import { updateElectronApp } from "update-electron-app";
import { app, BrowserWindow } from "electron";
import { typedIpcMain } from "./messages";
import path from "node:path";
import started from "electron-squirrel-startup";
import { CHANNEL } from "../shared/types";
import log from "electron-log/main";
log.initialize();

updateElectronApp({
  logger: {
    log: log.log,
    info: log.info,
    warn: log.warn,
    error: log.error,
  },
});

// Something something Windows. Not currently supported, will just leave it.
if (started) {
  app.quit();
}

typedIpcMain.on(CHANNEL.WEE_WOO, (event, arg) => {
  event.reply(CHANNEL.WEE_WOO, { id: arg.id, ok: true });
});

typedIpcMain.handle(CHANNEL.GET_STATUS, (event, args) => {
  return { status: `Status for query "${args.query}"` };
});

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  mainWindow.webContents.openDevTools();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
