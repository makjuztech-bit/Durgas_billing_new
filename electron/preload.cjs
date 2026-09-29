const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printReceipt: (options) => ipcRenderer.send('print-receipt', options),
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron
});
