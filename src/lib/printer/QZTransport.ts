/**
 * QZ Tray Transport Layer
 * Provides raw printing bridge to local Windows/Linux thermal printers.
 */

export interface QZPrinterConfig {
  host?: string;
  port?: number;
  secure?: boolean;
}

export class QZTransport {
  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private host: string;
  private port: number;
  private secure: boolean;
  private requestId: number = 0;
  private pendingRequests: Map<string, { resolve: (val: any) => void; reject: (err: any) => void }> = new Map();

  constructor(config: QZPrinterConfig = {}) {
    this.host = config.host || 'localhost';
    this.port = config.port || 8182;
    this.secure = config.secure ?? true;
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
        }, 3000);

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
            // Ignore non-JSON messages
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

  public async findPrinters(query?: string): Promise<string[]> {
    const isConn = await this.connect();
    if (!isConn) {
      // In Electron or local environment without QZ Tray running, fallback to Electron's webContents.getPrinters() if available
      if (typeof window !== 'undefined' && (window as any).electronAPI?.getPrinters) {
        const printers = await (window as any).electronAPI.getPrinters();
        const names = printers.map((p: any) => p.name);
        return query ? names.filter((n: string) => n.toLowerCase().includes(query.toLowerCase())) : names;
      }
      return ['TVS LP 46 Neo (Simulated)'];
    }

    return this.sendRequest('printers.find', { query: query || '' });
  }

  public async printRaw(printerName: string, rawData: string): Promise<void> {
    const isConn = await this.connect();
    if (!isConn) {
      // If Electron IPC is available, forward through IPC
      if (typeof window !== 'undefined' && (window as any).electronAPI?.printRaw) {
        return (window as any).electronAPI.printRaw({ printer: printerName, data: rawData });
      }
      console.warn('[QZ-TRANSPORT] QZ Tray not connected. Raw BPLZ data generated:\n', rawData);
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
