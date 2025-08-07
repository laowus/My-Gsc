const { ipcMain } = require("electron");
const { getAllPoetry, getPoetryByid, getInfoList } = require("./dbtool");

const dbHandle = () => {
  ipcMain.handle("db-get-all-poetry", async () => {
    return new Promise((resolve, reject) => {
      getAllPoetry((result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取诗歌数据失败"));
        }
      });
    });
  });

  ipcMain.handle("db-get-poetry-by-id", async (event, poetryid) => {
    return new Promise((resolve, reject) => {
      getPoetryByid(poetryid, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取诗歌数据失败"));
        }
      });
    });
  });

  ipcMain.handle("db-get-info-list", async (event, cateid, id) => {
    return new Promise((resolve, reject) => {
      getInfoList(cateid, id, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取信息数据失败"));
        }
      });
    });
  });
};

module.exports = dbHandle;
