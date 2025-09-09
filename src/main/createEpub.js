const { ipcMain } = require("electron");
const { KINDS, DYNASTYS } = require("./tools");
const JSZip = require("jszip");
const { getInfoList } = require("./dbtool");
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
// 递归生成 navPoints 的函数
const generateNavPoints = (poetryList, parentPlayOrder = 1) => {
  let currentPlayOrder = parentPlayOrder;
  return poetryList.map((poetry, index) => {
    const id = `chapter${poetry.poetryid}`;
    const playOrder = currentPlayOrder++;
    let navPoint = `<navPoint id="navPoint-${id}" playOrder="${playOrder}">
                  <navLabel>
                    <text>${poetry.title} (${poetry.writer.writername} )</text>
                  </navLabel>
                  <content src="./OEBPS/${id}.xhtml" />`;
    navPoint += `</navPoint>`;
    return navPoint.trim();
  });
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

const createEpub = async (fname, poetryList, mainWin) => {
  const title = fname;
  const author = "黄老五";
  return new Promise((resolve, reject) => {
    try {
      const zip = new JSZip();
      zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
      zip.folder("META-INF").file(
        "container.xml",
        ` <?xml version="1.0" encoding="UTF-8"?>
            <container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
                <rootfiles>
                <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
                </rootfiles>
            </container>`.trim()
      );
      // 调用递归函数生成 navPoints
      const navPoints = generateNavPoints(poetryList).join("\n");

      // 目录页面
      zip.folder("").file(
        "toc.ncx",
        ` <?xml version="1.0" encoding="UTF-8"?>
            <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
                <head>
                <meta name="dtb:uid" content="book-id" />
                <meta name="dtb:depth" content="1" />
                <meta name="dtb:totalPageCount" content="0" />
                <meta name="dtb:maxPageNumber" content="0" />
                </head>
                <docTitle>
                <text>${title}</text>
                </docTitle>
                <docAuthor>
                <text>${author}</text>
                </docAuthor>
                <navMap>
                ${navPoints}
                </navMap>
            </ncx>`.trim()
      );

      // 生成 manifest
      const manifestItems = poetryList.map(
        (poetry, index) => `
        <item id="chap${poetry.poetryid}" href="OEBPS/chapter${poetry.poetryid}.xhtml" media-type="application/xhtml+xml"/>
    `
      );

      const manifest = manifestItems.join("").trim();

      // 生成 spine
      const spineItems = poetryList.map(
        (poetry, index) => `
        <itemref idref="chap${poetry.poetryid}"/>`
      );

      const spine = spineItems.join("").trim();

      // 生成内容页面
      // 将 forEach 替换为 for...of 循环
      const addPoetryListFiles = async () => {
        const totalLength = poetryList.length;

        for (let i = 0; i < poetryList.length; i++) {
          const poetry = poetryList[i];
          const currentIndex = i + 1;
          // 使用 mainWindow.webContents.send 发送消息给渲染进程
          // 发送进度信息给渲染进程
          if (mainWin && mainWin.webContents) {
            mainWin.webContents.send("showtip", `${poetry.title} 正在处理 ${currentIndex}/${totalLength}`);
          }
          let htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>古诗词合集</title>
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
    <div class="poetry-container">
        <h2 class="poetry-title">${poetry.title}</h2>
        <h3>(${KINDS[poetry.kindid]}) [${DYNASTYS[poetry.writer.dynastyid]}] ${poetry.writer.writername}</h3>
        <div class="poetry-content">${convertHtml(poetry.content)}</div>`;
          try {
            const infos = await getInfos(poetry.poetryid);
            if (infos && infos.length > 0) {
              htmlContent += `
        <div class="info-section">`;
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
          } catch (error) {
            console.error(`获取诗歌 ${poetry.poetryid} 的信息失败:`, error);
            htmlContent += `</div></body>
</html>`;
          }

          zip.folder("OEBPS").file(`chapter${poetry.poetryid}.xhtml`, htmlContent.trim());
        }
      };

      // 等待所有章节文件添加完成
      addPoetryListFiles()
        .then(() => {
          const tocManifest = `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`;
          ipcMain.emit("hidetip");
          // 生成 content.opf
          zip.folder("").file(
            "content.opf",
            `
            <?xml version="1.0" encoding="UTF-8"?>
            <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id" version="2.0">
              <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
                <dc:title>${title}</dc:title>
                <dc:language>zh</dc:language>
                <dc:creator>${author}</dc:creator>
                <dc:identifier id="book-id">${new Date().getTime()}</dc:identifier>
              </metadata>
              <manifest>
                ${manifest}
                ${tocManifest}
              </manifest>
              <spine toc="ncx">
                ${spine}
              </spine>
            </package>
          `.trim()
          );

          zip
            .generateAsync({ type: "nodebuffer" })
            .then((epubContent) => {
              resolve(epubContent);
            })
            .catch((err) => {
              console.error("转换过程中出现错误:", err);
              reject(err);
            });
        })
        .catch((err) => {
          console.error("添加章节文件时出现错误:", err);
          reject(err);
        });
    } catch (err) {
      console.error("转换过程中出现错误:", err);
      reject(err);
    }
  });
};
module.exports = {
  createEpub
};
