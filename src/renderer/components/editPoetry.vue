<script setup>
import { watch, onMounted, ref, toRaw, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit, DocumentAdd } from "@element-plus/icons-vue";
import { convertHtml, convertText } from "../common/fun";

import Writer from "../model/Writer";
import Poetry from "../model/Poetry";
import TxtEditor from "./TxtEditor.vue";
const { ipcRenderer } = window.require("electron");
import { DYNASTYS, KINDS } from "../common/utils";
const route = useRoute();
const router = useRouter();

const curPoetryid = ref(route.params.id);
const curPoetry = ref(null);
const writerList = ref([]);
const curInfoList = ref([]);
const curInfoIndex = ref(0);
const curInfo = ref(null);
const getDefaultInfo = () => {
  return {
    title: "诗词解析标题",
    content: "诗词解析内容"
  };
};

const curAddInfo = ref(getDefaultInfo());

const editDialog = ref(false);
const addDialog = ref(false);

const dyOptions = () => {
  // 从索引1开始截取数组，并映射为目标格式
  return DYNASTYS.slice(1).map((item, index) => ({
    value: index + 1,
    label: item.trim() // 去除可能存在的空格（如"宋朝 "→"宋朝"
  }));
};
const kindOptions = () => {
  return KINDS.slice(1).map((item, index) => ({
    value: index + 1,
    label: item.trim() //
  }));
};
const fetchPoetry = () => {
  try {
    ipcRenderer.invoke("db-get-poetry-by-id", curPoetryid.value).then((res) => {
      if (res.success) {
        const data = res.data;
        console.log(data);
        const writer = new Writer(data.writerid, data.writername, data.dynastyid);
        curPoetry.value = new Poetry(data.poetryid, data.typeid, data.kindid, writer, data.title, data.content, data.infos);
        if (curPoetry.value) {
          getWriterList(false);
          getInfoList();
        }
      }
    }); // 使用异步方法
  } catch (error) {
    console.error("获取诗歌数据失败:", error);
  }
};
const getInfoList = () => {
  try {
    ipcRenderer.invoke("db-get-info-list", 1, curPoetryid.value).then((res) => {
      if (res.success) {
        curInfoList.value = res.data;
        if (curInfoList.value.length > 0) {
          curInfo.value = curInfoList.value[0];
        }
      }
    });
  } catch (error) {
    console.error("获取信息列表失败:", error);
  }
};

const getWriterList = (isChangeDid) => {
  console.log("getWriterList", curPoetry.value.dynastyid);
  try {
    ipcRenderer.invoke("db-get-writers-by-did", curPoetry.value.dynastyid).then((res) => {
      if (res.success) {
        writerList.value = res.data;
        if (writerList.value.length > 0) {
          //怎么让writerid默认选中第一个
          if (isChangeDid) {
            curPoetry.value.writer.writerid = writerList.value[0].writerid;
            curPoetry.value.writer.writername = writerList.value[0].writername;
          }
        }
      }
    });
  } catch (error) {
    console.error("获取信息列表失败:", error);
  }
};
onMounted(() => {
  fetchPoetry();
});

const changeDid = (index) => {
  console.log(index);
  curPoetry.value.dynastyid = index;
  getWriterList(true);
};

const setCurIndex = (index) => {
  curInfoIndex.value = index;
  if (curInfoList.value.length > 0) {
    curInfo.value = curInfoList.value[index];
  }
};

const goBack = () => {
  router.go(-1);
};

const savePoetry = () => {
  if (curPoetry.value) {
    console.log("savePoetrvalu", toRaw(curPoetry.value));
    ipcRenderer.invoke("db-edit-poetry", toRaw(curPoetry.value)).then((res) => {
      if (res.success) {
        ElMessage.success("修改成功");
      } else {
        ElMessage.error("修改失败");
      }
    });
  }
};

const editInfo = () => {
  //info
  if (curInfoIndex.value >= 0) {
    editDialog.value = true;
    console.log(curInfoList.value[curInfoIndex.value]);
  }
};
const addInfo = () => {
  addDialog.value = true;
};
const delInfo = () => {
  if (curInfo.value) {
    ElMessageBox.confirm(`是否删除[${curInfo.value.title}]?`, "删除", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        ipcRenderer.invoke("db-del-info", curInfo.value.infoid).then((res) => {
          if (res.success) {
            ElMessage.success("删除成功");
            getInfoList();
          } else {
            ElMessage.error("删除失败");
          }
          editDialog.value = false;
        });
      })
      .catch(() => {
        console.log("删除取消");
      });
  }
};

const saveInfo = () => {
  if (curInfo.value) {
    console.log("saveInfo", toRaw(curInfo.value));
    if (curInfo.value.title.trim() == "" || curInfo.value.content.trim() == "") {
      ElMessage.error("标题和内容不能为空");
      return;
    }
    ipcRenderer.invoke("db-edit-info", toRaw(curInfo.value)).then((res) => {
      if (res.success) {
        ElMessage.success("修改成功");
      } else {
        ElMessage.error("修改失败");
      }
      editDialog.value = false;
    });
  }
};

const addSaveInfo = () => {
  if (curAddInfo.value.title.trim() == "" || curAddInfo.value.content.trim() == "") {
    ElMessage.error("标题和内容不能为空");
    return;
  }
  curAddInfo.value.fid = curPoetryid.value;
  curAddInfo.value.cateid = 1;
  console.log("addSaveInfo", toRaw(curAddInfo.value));
  ipcRenderer.invoke("db-add-info", toRaw(curAddInfo.value)).then((res) => {
    if (res.success) {
      ElMessage.success("添加成功");
      curAddInfo.value = getDefaultInfo();
      getInfoList();
    } else {
      ElMessage.error("添加失败");
    }
    addDialog.value = false;
  });
};
</script>
<template>
  <el-dialog v-model="editDialog" title="编辑信息" width="80%" align-center>
    <el-form label-width="120px" v-if="curInfo">
      <el-form-item label="标题">
        <el-input v-model="curInfo.title" style="width: 300px; margin-right: 10px"></el-input>
      </el-form-item>
      <el-form-item label="内容">
        <TxtEditor v-model:content="curInfo.content" :height="300" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveInfo"> 修改 </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <el-dialog v-model="addDialog" title="添加信息" width="80%" align-center>
    <el-form label-width="120px">
      <el-form-item label="标题">
        <el-input v-model="curAddInfo.title" style="width: 300px; margin-right: 10px"></el-input>
      </el-form-item>
      <el-form-item label="内容">
        <TxtEditor v-model:content="curAddInfo.content" :height="300" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addSaveInfo"> 添加 </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <div class="edit-poetry">
    <div class="return" @click="goBack">
      <i class="iconfont icon-fanhui"></i>
    </div>
    <el-form :model="curPoetry" label-width="120px" v-if="curPoetry">
      <el-form-item label="诗词名称">
        <el-input v-model="curPoetry.title" style="width: 300px; margin-right: 10px"></el-input>
        <div class="mr10">体裁</div>
        <el-select v-model="curPoetry.kindid" style="width: 100px; margin-right: 20px"> <el-option v-for="item in kindOptions()" :key="item.value" :label="item.label" :value="item.value" /> </el-select>
        <el-button type="primary" @click="savePoetry"> 修改 </el-button>
      </el-form-item>
      <el-form-item label="作者">
        <el-select v-model="curPoetry.writer.dynastyid" style="width: 100px; margin-right: 20px" @change="changeDid">
          <el-option v-for="item in dyOptions()" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select filterable style="width: 150px" v-model="curPoetry.writer.writerid">
          <el-option v-for="(item, index) in writerList" :key="index" :label="item.writername" :value="item.writerid" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型">
        <!-- <el-select v-model="curPoetry.typeid" style="width: 100px; margin-right: 20px"> <el-option v-for="item in kindOptions()" :key="item.value" :label="item.label" :value="item.value" /> </el-select> -->
      </el-form-item>
      <el-form-item label="内容">
        <TxtEditor v-model:content="curPoetry.content" :height="200" />
      </el-form-item>
      <el-form-item label="信息">
        <div class="poem-info">
          <div class="poem-info-title" style="justify-content: space-between">
            <div class="left-title">
              <div class="info-item-title" :class="{ 'title-select': curInfoIndex === index }" v-for="(item, index) in curInfoList" :key="item.id" @click="setCurIndex(index)">
                {{ item.title }}
              </div>
            </div>

            <div class="ctrl-btn">
              <el-button type="info" title="添加信息" :icon="DocumentAdd" circle @click="addInfo" />
              <el-button type="primary" title="编辑信息" :icon="Edit" circle @click="editInfo" />
              <el-button type="danger" title="删除信息" :icon="Delete" circle @click="delInfo" />
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item v-if="curInfoList.length > 0">
        <div class="info-content" v-html="convertHtml(curInfo.content)"></div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style>
.ctrl-btn {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

.edit-poetry {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 30px;
  margin: auto;
}
.poem-info {
  font-size: 1rem;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.left-title {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.poem-info-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: flex;
  flex-direction: row;
  gap: 20px; /* 防止内容换行 */
  white-space: nowrap;
  /* 允许水平滚动 */
  overflow-x: auto;
  /* 可选：添加内边距避免内容贴边 */
  padding: 8px 0;
  /* 可选：限制最大宽度（根据父容器调整） */
  max-width: 100%;
}
/* 可选：美化滚动条（WebKit浏览器） */
.poem-info-title::-webkit-scrollbar {
  height: 6px;
}
.poem-info-title::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}
.info-item-title {
  width: fit-content;
  display: flex;
  align-items: center;
}
.title-select {
  background-color: #4caf50; /* 更改背景颜色为绿色 */
  color: white; /* 文字颜色设为白色 */
  border: none; /* 移除边框 */
  border-radius: 4px; /* 添加圆角 */
  padding: 8px 16px; /* 添加内边距 */
  font-size: 14px; /* 设置字体大小 */
  cursor: pointer; /* 鼠标悬停时显示指针 */
  transition: background-color 0.3s ease; /* 添加背景颜色过渡效果 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
}

.title-select:hover {
  background-color: #45a049; /* 悬停时更改背景颜色 */
}

.title-select:active {
  background-color: #3e8e41; /* 点击时更改背景颜色 */
  transform: translateY(1px); /* 点击时轻微下移 */
}
</style>
