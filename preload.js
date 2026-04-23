const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  sendTimerState: (state) => ipcRenderer.send('timer:state', state),
  onTimerState: (cb) => ipcRenderer.on('timer:state', (_e, state) => cb(state)),
  closeMini: () => ipcRenderer.send('mini:close'),
  closeMain: () => ipcRenderer.send('main:close'),
  minimizeMain: () => ipcRenderer.send('main:minimize'),
});
