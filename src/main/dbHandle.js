const { ipcMain } = require("electron");
const { getAllPoetry, getPoetryByid, getInfoList, getCountByKeyword, getWritersByDid, getTypesByPid, getWriterById, getRhesis, getCountByRhkeyword, getMyByPoetryid, changeMtid, getMyList, editPoetry, editInfo, delInfo, addInfo, addPoetry, getTypesInIds, get2Types, delPoetry } = require("./dbtool");

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

  ipcMain.handle("db-get-writer-by-id", async (event, writerid) => {
    return new Promise((resolve, reject) => {
      getWriterById(writerid, (result) => {
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

  ipcMain.handle("db-get-my-list", async (event, mtid) => {
    return new Promise((resolve, reject) => {
      getMyList(mtid, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取我的收藏数据失败"));
        }
      });
    });
  });

  //编辑诗歌
  ipcMain.handle("db-edit-poetry", async (event, poetry) => {
    return new Promise((resolve, reject) => {
      editPoetry(poetry, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("编辑诗歌数据失败"));
        }
      });
    });
  });

  //编辑信息
  ipcMain.handle("db-edit-info", async (event, info) => {
    return new Promise((resolve, reject) => {
      editInfo(info, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("编辑信息数据失败"));
        }
      });
    });
  });

  //删除信息
  ipcMain.handle("db-del-info", async (event, infoid) => {
    return new Promise((resolve, reject) => {
      delInfo(infoid, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("删除信息数据失败"));
        }
      });
    });
  });
  //添加信息
  ipcMain.handle("db-add-info", async (event, info) => {
    return new Promise((resolve, reject) => {
      addInfo(info, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("添加信息数据失败"));
        }
      });
    });
  });

  //添加诗歌
  ipcMain.handle("db-add-poetry", async (event, poetry) => {
    return new Promise((resolve, reject) => {
      addPoetry(poetry, (result) => {
        if (result.success) {
          console.log("新增记录的主键是:", result.lastID);
          resolve(result);
        } else {
          console.error("插入失败:", result.error);
          reject(new Error("添加诗歌数据失败"));
        }
      });
    });
  });

  ipcMain.handle("db-get-types-in-ids", async (event, ids) => {
    return new Promise((resolve, reject) => {
      getTypesInIds(ids, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取类别数据失败"));
        }
      });
    });
  });

  ipcMain.handle("db-get-2-types", async (event) => {
    return new Promise((resolve, reject) => {
      get2Types((result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("获取类别数据失败"));
        }
      });
    });
  });

  //删除诗歌
  ipcMain.handle("db-del-poetry", async (event, poetryid) => {
    return new Promise((resolve, reject) => {
      delPoetry(poetryid, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error("删除诗歌数据失败"));
        }
      });
    });
  });
};

module.exports = dbHandle;
