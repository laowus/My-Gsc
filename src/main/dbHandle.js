const { ipcMain } = require("electron");
const { getAllPoetry, getPoetryByid, getInfoList, getPoetryByPage, getPoetryCount } = require("./dbtool");

const dbHandle = () => {
  ipcMain.on("db-get-all-poetry", async (event) => {
    try {
      getAllPoetry((result) => {
        if (result.success) {
          event.sender.send("db-get-all-poetry-reply", result);
        } else {
          event.sender.send("db-get-all-poetry-error", new Error("获取诗歌数据失败"));
        }
      });
    } catch (error) {
      event.sender.send("db-get-all-poetry-error", error);
    }
  });

  ipcMain.on("db-get-poetry-by-id", async (event, poetryid) => {
    try {
      getPoetryByid(poetryid, (result) => {
        if (result.success) {
          event.sender.send("db-get-poetry-by-id-reply", result);
        } else {
          event.sender.send("db-get-poetry-by-id-error", new Error("获取诗歌数据失败"));
        }
      });
    } catch (error) {
      event.sender.send("db-get-poetry-by-id-error", error);
    }
  });

  ipcMain.on("db-get-info-list", async (event, cateid, id) => {
    try {
      getInfoList(cateid, id, (result) => {
        if (result.success) {
          event.sender.send("db-get-info-list-reply", result);
        } else {
          event.sender.send("db-get-info-list-error", new Error("获取信息数据失败"));
        }
      });
    } catch (error) {
      event.sender.send("db-get-info-list-error", error);
    }
  });

  ipcMain.on("db-get-poetry-by-page", async (event, { page, pageSize }) => {
    try {
      getPoetryByPage(page, pageSize, (result) => {
        if (result.success) {
          event.sender.send("db-get-poetry-by-page-reply", result);
        } else {
          event.sender.send("db-get-poetry-by-page-error", new Error("分页获取诗歌数据失败"));
        }
      });
    } catch (error) {
      event.sender.send("db-get-poetry-by-page-error", error);
    }
  });

  ipcMain.on("db-get-poetry-count", async (event) => {
    try {
      getPoetryCount((result) => {
        if (result.success) {
          event.sender.send("db-get-poetry-count-reply", result);
        } else {
          event.sender.send("db-get-poetry-count-error", new Error("获取诗歌总数失败"));
        }
      });
    } catch (error) {
      event.sender.send("db-get-poetry-count-error", error);
    }
  });
};

module.exports = dbHandle;
