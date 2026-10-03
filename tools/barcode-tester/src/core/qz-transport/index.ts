export interface QZStatus {
  connected: boolean;
  activePrinter: string;
  availablePrinters: string[];
  lastError?: string;
}

export class QZTransport {
  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private host: string;
  private port: number;
  private secure: boolean;
  private requestId: number = 0;
  private pendingRequests: Map<string, { resolve: (val: any) => void; reject: (err: any) => void }> = new Map();

  constructor(host: string = 'localhost', port: number = 8182, secure: boolean = true) {
    this.host = host;
    this.port = port;
    this.secure = secure;
  }

  public async connect(): Promise<boolean> {
    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      return true;
    }

    return new Promise((resolve) => {
      try {
        const protocol = this.secure ? 'wss' : 'ws';
        const url = `${protocol}://${this.host}:${this.port}`;
        this.ws = new WebSocket(url);

        const timeout = setTimeout(() => {
          if (!this.connected) {
            this.cleanup();
            resolve(false);
          }
        }, 2500);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.connected = true;
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.callId && this.pendingRequests.has(data.callId)) {
              const req = this.pendingRequests.get(data.callId)!;
              this.pendingRequests.delete(data.callId);
              if (data.error) {
                req.reject(new Error(data.error));
              } else {
                req.resolve(data.result);
              }
            }
          } catch {
            // Ignore non-JSON
          }
        };

        this.ws.onerror = () => {
          this.connected = false;
        };

        this.ws.onclose = () => {
          this.cleanup();
        };
      } catch {
        resolve(false);
      }
    });
  }

  public isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  public async getPrinters(): Promise<string[]> {
    const isConn = await this.connect();
    if (!isConn) {
      // Mock / fallback detection
      return [
        'TVS LP 46 Neo (Simulated USB)',
        'Generic / Text Only',
        'Zebra ZP 450'
      ];
    }

    return this.sendRequest('printers.find', { query: '' });
  }

  public async printRaw(printerName: string, rawData: string): Promise<void> {
    const isConn = await this.connect();
    if (!isConn) {
      console.log(`[QZ-TRANSPORT SIMULATED PRINT -> ${printerName}]\n`, rawData);
      return;
    }

    await this.sendRequest('print', {
      printer: { name: printerName },
      data: [{ type: 'raw', format: 'command', flavor: 'plain', data: rawData }]
    });
  }

  private sendRequest(call: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('QZ Tray WebSocket not open'));
      }
      const callId = `call_${Date.now()}_${++this.requestId}`;
      this.pendingRequests.set(callId, { resolve, reject });
      this.ws.send(JSON.stringify({ call, params, callId }));
    });
  }

  private cleanup() {
    this.connected = false;
    this.ws = null;
    for (const [, req] of this.pendingRequests) {
      req.reject(new Error('Connection closed'));
    }
    this.pendingRequests.clear();
  }
}
