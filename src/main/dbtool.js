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
const getAllPoetry = (params, callback) => {
  let sql = ` select p.poetryid, p.kindid, p.typeid,w.dynastyid,w.writerid,w.writername,p.title, p.content from Poetry p join Writer w on p.writerid = w.writerid`;
  if (params.ty == "keyword" && params.v !== "") {
    console.log(params);
    sql = sql + ` where p.title LIKE '%${params.v}%' OR w.writername LIKE '%${params.v}%' OR p.content LIKE '%${params.v}%'`;
  }
  if (params.ty === "writer" && params.v > 0) {
    sql = sql + ` where w.writerid = ${params.v}`;
  }

  if (params.ty === "type" && params.v > 0) {
    sql = sql + ` where p.typeid LIKE '${params.v},%' OR p.typeid LIKE '%,${params.v},%' OR p.typeid LIKE '%,${params.v}' OR p.typeid = '${params.v}'`;
  }

  if (params.ty === "my" && params.v !== "") {
    sql = sql + ` where p.poetryid IN (${params.v})`;
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
const editPoetry = (poetry, callback) => {
  const sql = ` update Poetry set title=?, kindid=?, typeid=?, writerid=?, content=? where poetryid=?`;
  console.log("editPoetry", sql);
  db.run(sql, [poetry.title, poetry.kindid, poetry.typeids, poetry.writer.writerid, poetry.content, poetry.poetryid], (err) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true });
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
    ` select p.poetryid, p.kindid, p.typeid,w.dynastyid,w.writerid,w.writername,p.title, p.content , p.isdel
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

const getWritersByDid = (dynastyid, callback) => {
  let sql = `SELECT * FROM Writer `;
  console.log(dynastyid);

  if (dynastyid > 0) {
    sql = sql + ` where dynastyid=${dynastyid}`;
  }
  console.log(sql);

  db.all(sql, (err, rows) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      // 按 writername 字段的拼音排序
      const sortedRows = rows.sort((a, b) => {
        return a.writername.localeCompare(b.writername, "zh-CN");
      });
      callback({ success: true, data: sortedRows });
    }
  });
};

const getTypesByPid = (pid, callback) => {
  const sql = `SELECT * FROM Type where parentid=${pid}`;
  console.log(sql);
  db.all(sql, (err, rows) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true, data: rows });
    }
  });
};

const getWriterById = (writerid, callback) => {
  const sql = `SELECT * FROM Writer where writerid=${writerid}`;
  db.get(sql, (err, row) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true, data: row });
    }
  });
};

const getRhesis = (keyword, callback) => {
  let sql = `SELECT r.rhesisid, r.rcontent, p.poetryid, p.kindid, p.title, w.writername, w.dynastyid FROM rhesis r join poetry p on r.poetryid=p.poetryid inner join writer w on p.writerid=w.writerid `;
  if (keyword !== "") {
    console.log(keyword);
    sql = sql + ` where p.title LIKE '%${keyword}%' OR w.writername LIKE '%${keyword}%' OR r.rcontent LIKE '%${keyword}%'`;
  }
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

const getCountByRhkeyword = (keyword, callback) => {
  const sql = `SELECT COUNT(*) as count FROM rhesis r join poetry p on r.poetryid=p.poetryid inner join writer w on p.writerid=w.writerid  where p.title LIKE '%${keyword}%' OR w.writername LIKE '%${keyword}%' OR r.rcontent LIKE '%${keyword}%'`;

  console.log(sql);
  db.get(sql, (err, row) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true, data: row.count });
    }
  });
};

const getMyByPoetryid = (poetryid, callback) => {
  const sql = `SELECT * FROM My where poetryid = ${poetryid}`;
  console.log(sql);

  db.all(sql, (err, row) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true, data: row });
    }
  });
};

function changeMtid(poetryid, mtid) {
  return new Promise((resolve, reject) => {
    // 先查询数据是否存在
    const checkQuery = `SELECT * FROM My WHERE poetryid = ?`;
    db.get(checkQuery, [poetryid], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row) {
        // 数据存在
        if (mtid === 0) {
          // mtid 等于 0，执行删除操作
          const deleteQuery = `DELETE FROM My WHERE poetryid = ?`;
          db.run(deleteQuery, [poetryid], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          // mtid 不等于 0，执行更新操作
          const updateQuery = `UPDATE My SET mtid = ? WHERE poetryid = ?`;
          db.run(updateQuery, [mtid, poetryid], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      } else {
        // 数据不存在，且 mtid 不等于 0，执行插入操作
        if (mtid !== 0) {
          const insertQuery = `INSERT INTO My (poetryid, mtid, addtime) VALUES (?, ?, ?)`;
          db.run(insertQuery, [poetryid, mtid, new Date().getTime()], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          // 数据不存在且 mtid 等于 0，不做操作
          resolve();
        }
      }
    });
  });
}

const getMyList = (mtid, callback) => {
  const sql = `SELECT poetryid from My where mtid=${mtid}`;

  console.log(sql);
  db.all(sql, (err, row) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true, data: row });
    }
  });
};

const editInfo = (info, callback) => {
  const sql = `UPDATE Info SET title = ?, content = ? WHERE infoid = ?`;

  db.run(sql, [info.title, info.content, info.infoid], (err) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true });
    }
  });
};

const delInfo = (infoid, callback) => {
  const sql = `DELETE FROM Info WHERE infoid = ?`;

  db.run(sql, [infoid], (err) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true });
    }
  });
};

const addInfo = (info, callback) => {
  const sql = `INSERT INTO Info (title, content, cateid ,fid) VALUES (?, ?, ?, ?)`;

  db.run(sql, [info.title, info.content, info.cateid, info.fid], function (err) {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true });
    }
  });
};

const addPoetry = (poetry, callback) => {
  const sql = `INSERT INTO Poetry (typeid, kindid, writerid, title, content, isdel) VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [poetry.typeids, poetry.kindid, poetry.writerid, poetry.title, poetry.content, 1], function (err) {
    if (err) {
      console.error(err.message);
      callback({ success: false, error: err.message });
    } else {
      callback({ success: true, lastID: this.lastID });
    }
  });
};

const delPoetry = (poetryid, callback) => {
  const sql = `DELETE FROM Poetry WHERE poetryid = ?`;
  db.run(sql, [poetryid], (err) => {
    if (err) {
      console.error(err.message);
      callback({ success: false, error: err.message });
    } else {
      callback({ success: true });
    }
  });
};

const getTypesInIds = (typeids, callback) => {
  const sql = `SELECT * FROM Type WHERE typeid IN (${typeids})`;
  console.log("sql", sql);

  db.all(sql, (err, rows) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      callback({ success: true, data: rows });
    }
  });
};

const get2Types = (callback) => {
  const sql = `SELECT * FROM Type where parentid != 0`;
  console.log("sql", sql);
  db.all(sql, (err, rows) => {
    if (err) {
      console.error(err.message);
      callback({ success: false });
    } else {
      const sortedRows = rows.sort((a, b) => {
        return a.typename.localeCompare(b.typename, "zh-CN");
      });
      callback({ success: true, data: sortedRows });
    }
  });
};

const addWriter = (writer, callback) => {
  const sql = `INSERT INTO Writer (dynastyid, writername, summary, isdel) VALUES (?, ?, ?, ?)`;
  db.run(sql, [writer.dynastyid, writer.writername, writer.summary, 1], function (err) {
    if (err) {
      console.error(err.message);
      callback({ success: false, error: err.message });
    } else {
      callback({ success: true, lastID: this.lastID });
    }
  });
};

const editWriter = (writer, callback) => {
  const sql = `UPDATE Writer SET dynastyid = ?, writername = ?, summary = ? WHERE writerid = ?`;
  db.run(sql, [writer.dynastyid, writer.writername, writer.summary, writer.writerid], (err) => {
    if (err) {
      console.error(err.message);
      callback({ success: false, error: err.message });
    } else {
      callback({ success: true });
    }
  });
};

const delWriter = (writerid, callback) => {
  const sql = `DELETE FROM Writer WHERE writerid = ?`;
  db.run(sql, [writerid], (err) => {
    if (err) {
      console.error(err.message);
      callback({ success: false, error: err.message });
    } else {
      callback({ success: true });
    }
  });
};

const addType = (aType, callback) => {
  const sql = `INSERT INTO Type (typename, parentid) VALUES (?, ?)`;
  db.run(sql, [aType.typename, aType.parentid], function (err) {
    if (err) {
      console.error(err.message);
      callback({ success: false, error: err.message });
    } else {
      callback({ success: true, lastID: this.lastID });
    }
  });
};

const existType = (typename, callback) => {
  const sql = `SELECT * FROM Type WHERE typename = ?`;
  db.get(sql, [typename], (err, row) => {
    if (err) {
      console.error(err.message);
      callback({ success: false, error: err.message });
    } else {
      callback({ success: true, exists: !!row });
    }
  });
};

// 导出批量更新函数
module.exports = {
  initDatabase,
  getAllPoetry,
  getPoetryByid,
  addPoetry,
  editPoetry,
  delPoetry,
  getInfoList,
  getPoetryCount,
  getCountByKeyword,
  getWritersByDid,
  getTypesByPid,
  getWriterById,
  getRhesis,
  getCountByRhkeyword,
  getMyByPoetryid,
  changeMtid,
  getMyList,
  addInfo,
  editInfo,
  delInfo,
  getTypesInIds,
  get2Types,
  addWriter,
  editWriter,
  delWriter,
  addType,
  existType
};
