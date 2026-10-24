const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

const LIVE_APP_URL = 'https://m-s-siam.github.io/Quantrex/';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#07090e',
    title: 'Quantrex',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
    },
    autoHideMenuBar: true,
    show: false,
  });

  Menu.setApplicationMenu(null);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // লাইভ ক্লাউড সাইট লোড করা (যাতে আপনার ফ্রেন্ড স্বয়ংক্রিয়ভাবে সব নতুন ফিচার পায়)
  mainWindow.loadURL(LIVE_APP_URL).catch(() => {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode) => {
    if (errorCode !== -3) {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
  });

  mainWindow.on('page-title-updated', (e) => {
    e.preventDefault();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      if (!url.includes('m-s-siam.github.io/Quantrex')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
