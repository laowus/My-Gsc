const { ipcMain } = require("electron");
const { getAllPoetry } = require("./dbtool");

const dbHandle = () => {
  ipcMain.on("db-get-all-poetry", (event) => {
    getAllPoetry(event); // 调用重置表函数
  });
};
module.exports = dbHandle;
