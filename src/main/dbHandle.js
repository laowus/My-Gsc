const { ipcMain } = require("electron");
const { getAllPoetry, getPoetryByid, getInfoList, getCountByKeyword, getWritersByDid, getTypesByPid, getWritersById, getRhesis, getCountByRhkeyword, getMyByPoetryid, changeMtid } = require("./dbtool");

const dbHandle = () => {
  ipcMain.handle("db-get-all-poetry", (event, params) => {
    return new Promise((resolve, reject) => {
      getAllPoetry(params, (result) => {
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

  //根据朝代id获取作者列表
  ipcMain.handle("db-get-writers-by-did", async (event, dynastyid) => {
    return new Promise((resolve, reject) => {
      getWritersByDid(dynastyid, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取作者列表失败"));
        }
      });
    });
  });

  ipcMain.handle("db-get-types-by-pid", async (event, pid) => {
    return new Promise((resolve, reject) => {
      getTypesByPid(pid, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取作者列表失败"));
        }
      });
    });
  });

  ipcMain.handle("db-get-writers-by-id", async (event, writerid) => {
    return new Promise((resolve, reject) => {
      getWritersById(writerid, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取作者列表失败"));
        }
      });
    });
  });

  ipcMain.handle("db-get-rhesis", async (event, keyword) => {
    return new Promise((resolve, reject) => {
      getRhesis(keyword, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取名句列表失败"));
        }
      });
    });
  });

  //根据关键字获取诗歌数量
  ipcMain.handle("db-get-count-by-rhkeyword", async (event, keyword) => {
    return new Promise((resolve, reject) => {
      getCountByRhkeyword(keyword, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取诗歌数量失败"));
        }
      });
    });
  });

  ipcMain.handle("db-get-my-by-poetryid", async (event, poetryid) => {
    return new Promise((resolve, reject) => {
      getMyByPoetryid(poetryid, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取我的收藏数据失败"));
        }
      });
    });
  });

  ipcMain.handle("db-edit-my-by-poetryid", async (event, poetryid, mtid) => {
    return new Promise((resolve, reject) => {
      changeMtid(poetryid, mtid, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取我的收藏数据失败"));
        }
      });
    });
  });
};

module.exports = dbHandle;
