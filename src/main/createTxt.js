const { ipcMain } = require("electron");

// 修改 generateTxt 函数，使其返回 Promise
const generateTxt = async (poetryList, mainWin) => {
  let localTxtContent = "";
  for (const poetry of poetryList) {
    // 发送进度信息给渲染进程
    if (mainWin && mainWin.webContents) {
      mainWin.webContents.send("showtip", poetry.title);
    }
    const poetryStr = poetry.title + "\n" + poetry.content;

    localTxtContent += poetryStr;
  }
  ipcMain.emit("hidetip");
  return localTxtContent;
};

const createTxt = async (poetryList, mainWin) => {
  // 检查 chapters 是否为空
  if (!poetryList || poetryList.length === 0) {
    console.log("chapters 数组为空");
    return "";
  }

  try {
    // 等待 generateTxt 执行完成
    const txtContent = await generateTxt(poetryList, mainWin);
    return txtContent;
  } catch (err) {
    console.error("转换过程中出现错误:", err);
    throw err;
  }
};

module.exports = {
  createTxt
};
