const { ipcMain } = require("electron");
const { getAllPoetry } = require("./dbtool");

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
};


module.exports = dbHandle;
