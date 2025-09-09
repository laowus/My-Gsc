process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
const { app, BrowserWindow, ipcMain, Menu, dialog, Tray } = require("electron");
const isDevEnv = process.env["NODE_ENV"] === "dev";
const path = require("path");
const fs = require("fs");
const { publicDir } = require("./pathUtils");
const { initDatabase } = require("./dbtool");
const { createEpub } = require("./createEpub");
const { createTxt } = require("./createTxt");
const { createHtml } = require("./createHtml");

const Store = require("electron-store");
const store = new Store();
const dbhandle = require("./dbhandle");

let mainWin = null,
  tray = null;
let options = {
  width: 1024,
  height: 768,
  frame: false,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    webSecurity: false
  }
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

dbhandle();

const startup = () => {
  init();
};
//创建浏览窗口
const createWindow = () => {
  if (!mainWin) {
    // 从 electron-store 中获取窗口大小和位置
    const windowWidth = parseInt(store.get("mainWindowWidth") || 1024);
    const windowHeight = parseInt(store.get("mainWindowHeight") || 768);
    // 增加默认值处理，避免 NaN
    const windowX = parseInt(store.get("mainWindowX")) || 0;
    const windowY = parseInt(store.get("mainWindowY"));

    // 从 electron-store 中获取置顶状态，默认为 false
    const isAlwaysOnTop = store.get("isAlwaysOnTop", false);

    const mainWindow = new BrowserWindow({
      ...options,
      width: windowWidth,
      height: windowHeight,
      x: windowX,
      y: windowY,
      alwaysOnTop: isAlwaysOnTop // 设置初始置顶状态
    });
    if (isDevEnv) {
      mainWindow.loadURL("http://localhost:9000/");
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile("dist/index.html");
    }

    tray = new Tray(path.join(publicDir, "/images/logo.png"));
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

    // 监听窗口大小改变事件
    mainWindow.on("resize", () => {
      if (!mainWindow.isDestroyed()) {
        if (!mainWindow.isMaximized()) {
          let bounds = mainWindow.getBounds();
          store.set({
            mainWindowWidth: bounds.width,
            mainWindowHeight: bounds.height
          });
        } else {
          console.log("当前为大化状态，不保存窗口大小和位置");
        }
      }
    }); // 监听窗口移动事件
    mainWindow.on("move", () => {
      if (!mainWindow.isDestroyed()) {
        if (!mainWindow.isMaximized()) {
          let bounds = mainWindow.getBounds();
          store.set({
            mainWindowX: bounds.x,
            mainWindowY: bounds.y
          });
        }
      }
    });
    return mainWindow;
  }
  return mainWin;
};

// 添加置顶事件监听
ipcMain.on("window-top", (event, isTop) => {
  const webContent = event.sender;
  const win = BrowserWindow.fromWebContents(webContent);
  if (win) {
    win.setAlwaysOnTop(isTop);
    // 保存置顶状态到 electron-store
    store.set("isAlwaysOnTop", isTop);
  }
});
// 修改获取置顶状态事件监听
ipcMain.on("isTop", (event) => {
  const webContent = event.sender;
  const win = BrowserWindow.fromWebContents(webContent);
  if (win) {
    const isTop = win.isAlwaysOnTop();
    event.returnValue = isTop;
  } else {
    event.returnValue = false;
  }
});

ipcMain.on("window-min", (event) => {
  const webContent = event.sender;
  const win = BrowserWindow.fromWebContents(webContent);
  win.hide();
});
ipcMain.on("window-close", (event) => {
  app.quit();
});
ipcMain.on("window-max", (event) => {
  const webContent = event.sender;
  const win = BrowserWindow.fromWebContents(webContent);
  if (win.isMaximized()) {
    const width = store.get("mainWindowWidth") || 1050;
    const height = store.get("mainWindowHeight") || 660;
    const x = store.get("mainWindowX") || mainWin.getPosition()[0];
    const y = store.get("mainWindowY") || mainWin.getPosition()[1];
    if (width && height) {
      win.setSize(width, height);
      if (x && y) {
        win.setPosition(x, y);
      }
    }
  } else {
    win.maximize();
  }
});

//导出成html txt epub

ipcMain.on("export-txt", async (event, fname, poetryList) => {
  //获取当前日期时间
  const now = new Date();
  const timestamp = now.getTime();
  const fileName = `${fname}_${timestamp}.txt`;
  try {
    // 保存当前窗口的置顶状态
    const wasAlwaysOnTop = mainWin.isAlwaysOnTop();

    // 临时取消置顶状态
    if (wasAlwaysOnTop) {
      mainWin.setAlwaysOnTop(false);
    }
    // 弹出保存对话框
    const { filePath } = await dialog.showSaveDialog({
      title: "保存 Txt 文件",
      defaultPath: fileName,
      filters: [
        { name: "Txt 文件", extensions: ["txt"] },
        { name: "所有文件", extensions: ["*"] }
      ],
      parent: mainWin, // 添加父窗口
      modal: true // 设置为模态对话框
    });
    // 恢复窗口的置顶状态
    if (wasAlwaysOnTop) {
      mainWin.setAlwaysOnTop(true);
    }
    if (!filePath) {
      event.sender.send("export-txt-reply", {
        success: false,
        message: "用户取消保存"
      });
    } else {
      await createTxt(poetryList, mainWin).then((txtContent) => {
        if (mainWin && mainWin.webContents) {
          mainWin.webContents.send("hidetip");
        }
        fs.writeFile(filePath, txtContent, (err) => {
          if (err) {
            event.sender.send("export-txt-reply", {
              success: false,
              message: "文件写入失败,请重试或者检查文件!"
            });
          } else {
            event.sender.send("export-txt-reply", {
              success: true,
              message: fileName + " 导出成功!"
            });
          }
        });
      });
      return { success: true, filePath };
    }
  } catch (error) {
    event.sender.send("export-txt-reply", {
      success: false,
      message: "文件写入失败,请重试或者检查文件!"
    });
  }
});

ipcMain.on("export-html", async (event, fname, poetryList) => {
  //获取当前日期时间
  const now = new Date();
  const timestamp = now.getTime();
  const fileName = `${fname}_${timestamp}.html`;
  try {
    // 保存当前窗口的置顶状态
    const wasAlwaysOnTop = mainWin.isAlwaysOnTop();

    // 临时取消置顶状态
    if (wasAlwaysOnTop) {
      mainWin.setAlwaysOnTop(false);
    }
    // 弹出保存对话框
    const { filePath } = await dialog.showSaveDialog({
      title: "保存 Html 文件",
      defaultPath: fileName,
      filters: [
        { name: "Html 文件", extensions: ["html"] },
        { name: "所有文件", extensions: ["*"] }
      ],
      parent: mainWin, // 添加父窗口
      modal: true // 设置为模态对话框
    });

    // 恢复窗口的置顶状态
    if (wasAlwaysOnTop) {
      mainWin.setAlwaysOnTop(true);
    }
    if (!filePath) {
      event.sender.send("export-html-reply", {
        success: false,
        message: "用户取消保存"
      });
    } else {
      await createHtml(fname, poetryList, mainWin).then((htmlContent) => {
        if (mainWin && mainWin.webContents) {
          mainWin.webContents.send("hidetip");
        }
        fs.writeFile(filePath, htmlContent, (err) => {
          if (err) {
            event.sender.send("export-html-reply", {
              success: false,
              message: "文件写入失败,请重试或者检查文件!"
            });
          } else {
            event.sender.send("export-html-reply", {
              success: true,
              message: fileName + " 导出成功!"
            });
          }
        });
      });
      return { success: true, filePath };
    }
  } catch (error) {
    event.sender.send("export-html-reply", {
      success: false,
      message: "文件写入失败,请重试或者检查文件! 错误信息: " + error.message
    });
  }
});

ipcMain.on("export-epub", async (event, fname, poetryList) => {
  //获取当前日期时间
  const now = new Date();
  const timestamp = now.getTime();
  const fileName = `${fname}_${timestamp}.epub`;
  try {
    // 保存当前窗口的置顶状态
    const wasAlwaysOnTop = mainWin.isAlwaysOnTop();

    // 临时取消置顶状态
    if (wasAlwaysOnTop) {
      mainWin.setAlwaysOnTop(false);
    }
    // 弹出保存对话框
    const { filePath } = await dialog.showSaveDialog({
      title: "保存 Epub 文件",
      defaultPath: fileName,
      filters: [
        { name: "Epub 文件", extensions: ["epub"] },
        { name: "所有文件", extensions: ["*"] }
      ],
      parent: mainWin, // 添加父窗口
      modal: true // 设置为模态对话框
    });
    // 恢复窗口的置顶状态
    if (wasAlwaysOnTop) {
      mainWin.setAlwaysOnTop(true);
    }
    if (!filePath) {
      event.sender.send("export-epub-reply", {
        success: false,
        message: "用户取消保存"
      });
    } else {
      await createEpub(fname, poetryList, mainWin).then((epubContent) => {
        if (mainWin && mainWin.webContents) {
          mainWin.webContents.send("hidetip");
        }
        fs.writeFile(filePath, epubContent, (err) => {
          if (err) {
            event.sender.send("export-epub-reply", {
              success: false,
              message: "文件写入失败,请重试或者检查文件!"
            });
          } else {
            event.sender.send("export-epub-reply", {
              success: true,
              message: fileName + " 导出成功!"
            });
          }
        });
      });
      return { success: true, filePath };
    }
  } catch (error) {
    event.sender.send("export-epub-reply", {
      success: false,
      message: "文件写入失败,请重试或者检查文件! 错误信息: " + error.message
    });
  }
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
      icon: path.join(publicDir, "/images/app.png"),
      click: () => {
        mainWin.show();
      }
    },
    { type: "separator" }, // 添加分隔线

    {
      label: "退出",
      icon: path.join(publicDir, "/images/quit.png"),
      click: function () {
        app.quit();
      }
    }
  ]);
};
// 监听重启程序请求
ipcMain.on("restart-app", () => {
  app.relaunch();
  app.exit();
});
const init = () => {
  app.whenReady().then(async () => {
    await initDatabase();
    mainWin = createWindow();
    initWindowBounds(mainWin);
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

const initWindowBounds = (win) => {
  store.get("mainWindowWidth") || store.set("mainWindowWidth", win.getSize()[0]);
  store.get("mainWindowHeight") || store.set("mainWindowHeight", win.getSize()[1]);
  store.get("mainWindowX") || store.set("mainWindowX", win.getPosition()[0]);
  store.get("mainWindowY") || store.set("mainWindowY", win.getPosition()[1]);
};
//启动应用
startup();
