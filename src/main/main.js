process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
const { app, BrowserWindow, ipcMain, Menu, dialog, Tray } = require("electron");
const isDevEnv = process.env["NODE_ENV"] === "dev";
const path = require("path");

if (!isDevEnv) {
  resourcesRoot = path.dirname(resourcesRoot);
  publicRoot = path.join(__dirname, "../../dist");
}
let mainWin = null,
  tray = null;
let options = {
  width: 1050,
  height: 660,
  frame: false,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    webSecurity: false,
  },
};

const singleInstance = app.requestSingleInstanceLock();
if (!singleInstance) {
  app.quit();
} else {
  app.on("second-instance", (event, argv, workingDir) => {
    if (mainWin) {
      if (!mainWin.isVisible()) mainWin.show();
      mainWin.focus();
    }
  });
}
const startup = () => {
  init();
};
//创建浏览窗口
const createWindow = () => {
  if (!mainWin) {
    const mainWindow = new BrowserWindow({
      ...options,
    });
    if (isDevEnv) {
      mainWindow.loadURL("http://localhost:9000/");
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile("dist/index.html");
    }

    tray = new Tray(path.join(publicRoot, "/images/logo.png"));
    tray.setToolTip("古诗词");
    let contextMenu = generateContextMenu();
    tray.setContextMenu(contextMenu);
    tray.on("double-click", () => {
      mainWindow.show();
    });
    mainWindow.once("ready-to-show", () => {
      mainWindow.show();
    });

    mainWindow.once("ready-to-show", () => {
      mainWindow.show();
    });
    return mainWindow;
  }
  return mainWin;
};

ipcMain.on("window-min", (event) => {
  const webContent = event.sender;
  const win = BrowserWindow.fromWebContents(webContent);
  win.hide();
});
ipcMain.on("window-close", (event) => {
  app.quit();
});

const sendToRenderer = (channel, args) => {
  try {
    if (mainWin) mainWin.webContents.send(channel, args);
  } catch (error) {}
};
// 动态生成上下文菜单
const generateContextMenu = () => {
  return Menu.buildFromTemplate([
    {
      label: "打开主界面",
      icon: path.join(publicRoot, "/images/app.png"),
      click: () => {
        mainWin.show();
      },
    },
    { type: "separator" }, // 添加分隔线

    {
      label: "退出",
      icon: path.join(publicRoot, "/images/quit.png"),
      click: function () {
        app.quit();
      },
    },
  ]);
};
// 监听重启程序请求
ipcMain.on("restart-app", () => {
  app.relaunch();
  app.exit();
});
const init = () => {
  app.whenReady().then(async () => {
    mainWin = createWindow();
  });

  app.on("activate", (event) => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWin = createWindow();
    }
  });

  app.on("window-all-closed", (event) => {
    if (!isDevEnv) {
      app.quit();
    }
  });

  app.on("before-quit", (event) => {
    sendToRenderer("app-quit");
  });
};

//启动应用
startup();
