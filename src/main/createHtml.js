const { ipcMain } = require("electron");
const { getInfoList } = require("./dbtool");
const { KINDS, DYNASTYS } = require("./tools");

const convertHtml = (text) => {
  let _txt = text;

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

  // 转换换行符为HTML的<br>标签
  _txt = _txt.replace(/<br[^>]*>/gi, "<br>");
  _txt = _txt.replace(/\n/g, "<br>");

  // 移除em标签
  _txt = _txt.replace(/<\/?em>/gi, "");

  return _txt;
};

// 生成HTML内容
const generateHtml = async (fname, poetryList, mainWin) => {
  let htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>关于 [ ${fname} ] 的诗词</title>
    <style>
        body {
            font-family: 'SimSun', '宋体', serif;
            line-height: 1.8;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
            color: #333;
        }
        .poetry-container {
            background: white;
            padding: 30px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .poetry-title {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .poetry-content {
            font-size: 18px;
            text-align: center;
            margin: 30px 0;
            line-height: 2;
        }
        .info-section {
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-left: 4px solid #3498db;
        }
        .info-title {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .info-content {
            font-size: 14px;
            color: #555;
            line-height: 1.6;
        }
        .separator {
            height: 2px;
            background: linear-gradient(to right, #3498db, #2c3e50, #3498db);
            margin: 40px 0;
            border-radius: 1px;
        }
        .page-header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px;
        }
        .page-title {
            font-size: 28px;
            margin: 0;
        }
        .page-subtitle {
            font-size: 16px;
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="page-header">
        <h1 class="page-title">关于 [ ${fname} ] 的诗词 </h1>
        <p class="page-subtitle">共收录 ${poetryList.length} 首诗词</p>
    </div>
`;

  const totalLength = poetryList.length;

  for (let i = 0; i < poetryList.length; i++) {
    const poetry = poetryList[i];
    const currentIndex = i + 1;

    // 发送进度信息给渲染进程
    if (mainWin && mainWin.webContents) {
      mainWin.webContents.send("showtip", `${poetry.title} 正在处理 ${currentIndex}/${totalLength}`);
    }

    // 同时在控制台输出进度
    console.log(`处理进度: ${currentIndex}/${totalLength} - ${poetry.title}`);

    htmlContent += `
    <div class="poetry-container">
        <h2 class="poetry-title">${poetry.title}</h2>
        <h3>(${KINDS[poetry.kindid]}) [${DYNASTYS[poetry.writer.dynastyid]}] ${poetry.writer.writername}</h3>
        <div class="poetry-content">${convertHtml(poetry.content)}</div>
`;

    try {
      const infos = await getInfos(poetry.poetryid);

      if (infos && infos.length > 0) {
        htmlContent += `
        <div class="info-section"> `;
        for (const info of infos) {
          htmlContent += `
            <div class="info-item">
                <h4 class="info-title">${info.title}</h4>
                <div class="info-content">${convertHtml(info.content)}</div>
            </div>
          `;
        }

        htmlContent += `</div>`;
      }

      htmlContent += `</div>`;

      if (i < poetryList.length - 1) {
        htmlContent += `<div class="separator"></div>`;
      }
    } catch (error) {
      console.error(`获取诗歌 ${poetry.poetryid} 的信息失败:`, error);
      htmlContent += `</div>`;
    }
  }

  htmlContent += `
    <div class="page-header">
        <p class="page-subtitle">古诗词合集制作完成</p>
    </div>
</body>
</html>
`;

  ipcMain.emit("hidetip");
  return htmlContent;
};

const getInfos = (poetryid) => {
  return new Promise((resolve, reject) => {
    getInfoList(1, poetryid, (result) => {
      if (result.success) {
        resolve(result.data || result);
      } else {
        reject(new Error("获取信息数据失败"));
      }
    });
  });
};

const createHtml = async (fname, poetryList, mainWin) => {
  if (!poetryList || poetryList.length === 0) {
    console.log("chapters 数组为空");
    return "";
  }

  try {
    const htmlContent = await generateHtml(fname, poetryList, mainWin);
    return htmlContent;
  } catch (err) {
    console.error("生成HTML过程中出现错误:", err);
    throw err;
  }
};

module.exports = {
  createHtml
};
