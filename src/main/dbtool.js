const path = require("path");
const { app, ipcMain } = require("electron");
const { dbZipPath, dbDir, dbPath } = require("./pathUtils");
const extract = require("extract-zip");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
let db;

const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      //判断数据库文件是否存在
      if (!fs.existsSync(dbPath)) {
        console.log("数据库文件不存在");
        try {
          // 确保解压目录存在
          if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
          }
          // 解压文件
          extract(dbZipPath, { dir: dbDir }).then(() => {
            console.log("文件解压成功");
            db = new sqlite3.Database(dbPath, (err) => {
              if (err) {
                console.error(err.message);
                reject(err);
              } else {
                console.log("连接数据库成功");
                resolve();
              }
            });
          });
        } catch (error) {
          console.error("解压或复制文件时出错:", error);
        }
      } else {
        console.log("数据库文件不存在");
        db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          } else {
            console.log("连接数据库成功");
            resolve();
          }
        });
      }
    });
  });
};



// 导出批量更新函数
module.exports = {
  initDatabase,
};
