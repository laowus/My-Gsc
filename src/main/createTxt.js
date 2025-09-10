const { ipcMain } = require("electron");
const { getInfoList } = require("./dbtool");
const { KINDS, DYNASTYS } = require("./tools");
const convertText = (text) => {
  let _txt = text.replace(/<br[^>]*>/gi, "\n");
  _txt = _txt.replace(/<\/?em>/gi, "");

  // 处理HTML实体编码
  const htmlEntities = {
    "&quot;": '"',
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&apos;": "'",
    "&#39;": "'",
    "&nbsp;": " ",
    "&hellip;": "…",
    "&mdash;": "—",
    "&ndash;": "–"
  };

  // 替换所有HTML实体
  for (const [entity, char] of Object.entries(htmlEntities)) {
    const regex = new RegExp(entity, "g");
    _txt = _txt.replace(regex, char);
  }

  return _txt;
};

// 修改 generateTxt 函数，使其返回 Promise
const generateTxt = async (poetryList, mainWin) => {
  let localTxtContent = "";
  const totalLength = poetryList.length;

  for (let i = 0; i < poetryList.length; i++) {
    const poetry = poetryList[i];
    const currentIndex = i + 1;

    // 发送进度信息给渲染进程
    if (mainWin && mainWin.webContents) {
      if (totalLength < 1000) {
        mainWin.webContents.send("showtip", `${poetry.title} 正在处理 ${currentIndex}/${totalLength}`);
      } // 大于等于1000条时，每100条发送一次提示
      else if (currentIndex % 30 === 0 || currentIndex === totalLength) {
        mainWin.webContents.send("showtip", `${poetry.title} 正在处理 ${currentIndex}/${totalLength}`);
      }
    }

    // 同时在控制台输出进度
    console.log(`处理进度: ${currentIndex}/${totalLength} - ${poetry.title}`);

    // 添加美观的诗歌标题格式
    const poetryStr = `\n
【${poetry.title}】
(${KINDS[poetry.kindid]}) [${DYNASTYS[poetry.writer.dynastyid]}] ${poetry.writer.writername}
${"=".repeat(60)}\n${convertText(poetry.content)}\n`;

    localTxtContent += poetryStr;

    try {
      // 使用await等待getInfos执行完成
      const infos = await getInfos(poetry.poetryid);

      if (infos && infos.length > 0) {
        localTxtContent += `\n${"─".repeat(40)}\n`;

        for (const info of infos) {
          let infoStr = `▪ ${info.title}\n${convertText(info.content)}\n\n`;
          localTxtContent += infoStr;
        }
      }

      // 添加优雅的分隔符
      localTxtContent += `\n${"=".repeat(80)}\n\n`;
    } catch (error) {
      console.error(`获取诗歌 ${poetry.poetryid} 的信息失败:`, error);
      // 即使获取信息失败也继续处理下一个诗歌
    }
  }
  ipcMain.emit("hidetip");
  return localTxtContent;
};

const getInfos = (poetryid) => {
  return new Promise((resolve, reject) => {
    getInfoList(1, poetryid, (result) => {
      if (result.success) {
        resolve(result.data || result); // 确保返回的是数组
      } else {
        reject(new Error("获取信息数据失败"));
      }
    });
  });
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
