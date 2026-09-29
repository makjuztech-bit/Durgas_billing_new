const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

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

  // In packaged Electron, use Electron's internal Node runtime via ELECTRON_RUN_AS_NODE
  const isPackaged = app.isPackaged || !process.env.NODE_ENV || process.env.NODE_ENV === 'production';
  const nodeExecutable = isPackaged ? process.execPath : 'node';
  const backendCwd = path.dirname(serverScript);

  serverProcess = spawn(nodeExecutable, [serverScript], {
    cwd: backendCwd,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: isPackaged ? '1' : undefined,
      PORT: process.env.PORT || '5000',
      DATABASE_PATH: dbPath,
      NODE_ENV: 'production'
    },
    stdio: isPackaged ? 'ignore' : 'inherit',
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
  const preloadPath = getAppFilePath('electron/preload.js');

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
      preload: fs.existsSync(preloadPath) ? preloadPath : path.join(__dirname, 'preload.js')
    }
  });

  const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    const indexPath = getAppFilePath('dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  startBackendServer();
  // Allow brief initialization for Express & SQLite
  setTimeout(createWindow, 1200);
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
