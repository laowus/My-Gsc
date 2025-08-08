const { ipcMain } = require("electron");
const { getAllPoetry, getPoetryByid, getInfoList, getCountByKeyword } = require("./dbtool");

const dbHandle = () => {
  ipcMain.handle("db-get-all-poetry", (event, keyword) => {
    return new Promise((resolve, reject) => {
      getAllPoetry(keyword, (result) => {
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
  //根据关键字获取诗歌数量
  ipcMain.handle("db-get-count-by-keyword", async (event, keyword) => {
    return new Promise((resolve, reject) => {
      getCountByKeyword(keyword, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取诗歌数量失败"));
        }
      });
    });
  });
};

module.exports = dbHandle;
