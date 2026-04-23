const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron');
const path = require('path');

let mainWindow = null;
let miniWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 460,
    height: 560,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    title: 'study timer',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (miniWindow && !miniWindow.isDestroyed()) miniWindow.destroy();
  });
}

function createMiniWindow() {
  const { width: screenW } = screen.getPrimaryDisplay().workAreaSize;

  miniWindow = new BrowserWindow({
    width: 300,
    height: 140,
    x: screenW - 320,
    y: 20,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  miniWindow.setAlwaysOnTop(true, 'floating');
  miniWindow.loadFile('mini-player.html');
  miniWindow.on('closed', () => { miniWindow = null; });
}

app.whenReady().then(() => {
  createMainWindow();
  createMiniWindow();

  globalShortcut.register('Control+Shift+M', () => {
    if (!miniWindow || miniWindow.isDestroyed()) {
      createMiniWindow();
      return;
    }
    if (miniWindow.isVisible()) miniWindow.hide();
    else miniWindow.show();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
      createMiniWindow();
    }
  });
});

ipcMain.on('timer:state', (_e, payload) => {
  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.webContents.send('timer:state', payload);
  }
});

ipcMain.on('mini:close', () => {
  if (miniWindow && !miniWindow.isDestroyed()) miniWindow.hide();
});

ipcMain.on('main:close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
});

ipcMain.on('main:minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
