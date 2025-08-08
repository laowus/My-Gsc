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
        console.log("数据库文件存在");
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
//过滤关键字
const getAllPoetry = (keyword, callback) => {
  let sql = ` select p.poetryid, p.kindid, p.typeid,w.dynastyid,w.writerid,w.writername,p.title, p.content from Poetry p join Writer w on p.writerid = w.writerid`;
  if (keyword !== "") {
    sql = sql + ` where p.title LIKE '%${keyword}%' OR w.writername LIKE '%${keyword}%' OR p.content LIKE '%${keyword}%'`;
  }
  console.log("getAllPoetry", sql);

  db.all(sql, (err, rows) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true, data: rows });
    }
  });
};

//根据关键字获取诗歌数量

const getCountByKeyword = (keyword, callback) => {
  const sql = ` select COUNT(*) as count from Poetry p join Writer w on p.writerid = w.writerid where p.title LIKE '%${keyword}%' OR w.writername LIKE '%${keyword}%' OR p.content LIKE '%${keyword}%'`;
  console.log("getCountByKeyword", sql);
  // 移除多余的 keyword 参数
  db.get(sql, (err, row) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true, data: row.count });
    }
  });
};

const getPoetryByid = (poetryid, callback) => {
  db.get(
    ` select p.poetryid, p.kindid, p.typeid,w.dynastyid,w.writerid,w.writername,p.title, p.content 
    from Poetry p
    join Writer w on p.writerid = w.writerid 
    where p.poetryid = ?`,
    poetryid,
    (err, row) => {
      if (err) {
        console.error(err.message);
        callback({ success: false });
      } else {
        callback({ success: true, data: row });
      }
    }
  );
};

const getInfoList = (cateid, id, callback) => {
  db.all(` select * from Info where  cateid=? and fid=?`, cateid, id, (err, rows) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true, data: rows });
    }
  });
};

const getPoetryCount = (callback) => {
  db.get(`SELECT COUNT(*) as count FROM Poetry`, (err, row) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true, data: row.count });
    }
  });
};

// 导出批量更新函数
module.exports = {
  initDatabase,
  getAllPoetry,
  getPoetryByid,
  getInfoList,
  getPoetryCount,
  getCountByKeyword
};
