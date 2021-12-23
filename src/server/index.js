const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { IAPI } = require("./iapi");

if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 950,
    backgroundColor: "#2f3542",
    webPreferences: {
      //preload: path.join(app.getAppPath(), "src/client/js/preload.js"),
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, "../client/index.html"));
  mainWindow.setResizable(false);
  mainWindow.setMenu(null);
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

ipcMain.on("execute", async (event, args) => {
  console.log(args);
  let iapi = new IAPI((args.proxy ? args.proxy : null));
  let login_status = await iapi.Login(args.ig).catch((e) => { return event.reply("execute-reply", { success: false, msg: e }) });

  if(!login_status) return;

  iapi.MassSend(args.dm_content);
})