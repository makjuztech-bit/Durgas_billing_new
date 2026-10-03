const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-gpu-sandbox');

  const waylandDisplay = process.env.WAYLAND_DISPLAY || 'wayland-0';
  const xdgRuntimeDir = process.env.XDG_RUNTIME_DIR || `/run/user/${process.getuid ? process.getuid() : 1000}`;
  const waylandSocket = path.join(xdgRuntimeDir, waylandDisplay);
  if (process.env.WAYLAND_DISPLAY && !fs.existsSync(waylandSocket)) {
    delete process.env.WAYLAND_DISPLAY;
    app.commandLine.appendSwitch('ozone-platform', 'x11');
  } else if (!process.env.WAYLAND_DISPLAY && process.env.DISPLAY) {
    app.commandLine.appendSwitch('ozone-platform', 'x11');
  }
}

let mainWindow = null;
let serverProcess = null;

function getAppFilePath(relativeSubpath) {
  const candidatePaths = [
    path.join(__dirname, relativeSubpath),
    path.join(process.resourcesPath || '', 'app', relativeSubpath),
    path.join(__dirname, '..', relativeSubpath),
    path.join(__dirname, 'resources', 'app', relativeSubpath),
    path.join(process.cwd(), 'resources', 'app', relativeSubpath),
    path.join(process.cwd(), relativeSubpath)
  ];
  for (const p of candidatePaths) {
    if (p && fs.existsSync(p)) return p;
  }
  return path.join(__dirname, relativeSubpath);
}

function getBackendScriptPath() {
  const candidatePaths = [
    getAppFilePath('backend/server.js'),
    path.join(__dirname, '../backend/server.js'),
    path.join(process.resourcesPath || '', 'app/backend/server.js'),
    path.join(__dirname, 'backend/server.js'),
    path.join(__dirname, 'resources/app/backend/server.js')
  ];
  for (const p of candidatePaths) {
    if (p && fs.existsSync(p)) return p;
  }
  return path.join(__dirname, '../backend/server.js');
}

function startBackendServer() {
  const serverScript = getBackendScriptPath();
  const dbDir = path.join(app.getPath('userData'), 'data');
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch (e) {
      console.warn('[ELECTRON] Error creating data directory:', e);
    }
  }
  const dbPath = path.join(dbDir, 'database.sqlite');

  console.log('[ELECTRON] Starting backend server:', serverScript);
  console.log('[ELECTRON] Database file location:', dbPath);

  const isPackaged = app.isPackaged;
  const nodeExecutable = isPackaged ? process.execPath : 'node';
  const backendCwd = path.dirname(serverScript);

  serverProcess = spawn(nodeExecutable, [serverScript], {
    cwd: backendCwd,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: isPackaged ? '1' : undefined,
      PORT: process.env.PORT || '5000',
      DATABASE_PATH: dbPath,
      NODE_ENV: isPackaged ? 'production' : (process.env.NODE_ENV || 'development')
    },
    stdio: 'inherit',
    windowsHide: true
  });

  serverProcess.on('error', (err) => {
    console.error('[ELECTRON] Failed to start backend server:', err);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`[ELECTRON] Backend server exited (code: ${code}, signal: ${signal})`);
  });
}

function createWindow() {
  const iconPath = getAppFilePath('public/logo.png');
  let preloadPath = getAppFilePath('electron/preload.cjs');
  if (!fs.existsSync(preloadPath)) {
    preloadPath = getAppFilePath('electron/preload.js');
  }

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    title: 'Durgas - POS Billing System',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: fs.existsSync(preloadPath) ? preloadPath : path.join(__dirname, 'preload.cjs')
    }
  });

  const isDev = !app.isPackaged && (process.env.NODE_ENV === 'development' || process.argv.includes('--dev') || !fs.existsSync(getAppFilePath('dist/index.html')));

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:8080';
    console.log('[ELECTRON] Development mode: Connecting to Vite dev server at', devUrl);
    const loadDev = (retries = 15) => {
      mainWindow.loadURL(devUrl).catch((err) => {
        if (retries > 0) {
          console.log(`[ELECTRON] Waiting for Vite server at ${devUrl} (${retries} attempts left)...`);
          setTimeout(() => loadDev(retries - 1), 1000);
        } else {
          console.error('[ELECTRON] Failed to connect to Vite dev server:', err);
        }
      });
    };
    loadDev();
  } else {
    const indexPath = getAppFilePath('dist/index.html');
    console.log('[ELECTRON] Production mode: Loading file', indexPath);
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  // If running in development and backend already started by concurrently, don't spawn duplicate
  const isDevWithSeparateBackend = !app.isPackaged && process.argv.includes('--dev');
  if (!isDevWithSeparateBackend) {
    startBackendServer();
  } else {
    console.log('[ELECTRON] Development mode: Backend handled by dev script');
  }
  
  setTimeout(createWindow, 800);
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});

// IPC handler for printing receipts (supports silent & thermal)
ipcMain.on('print-receipt', (event, options) => {
  if (mainWindow) {
    mainWindow.webContents.print({
      silent: options?.silent || false,
      printBackground: true,
      deviceName: options?.printerName || ''
    }, (success, failureReason) => {
      if (!success) {
        console.warn('[ELECTRON] Print failed:', failureReason);
      }
    });
  }
});
