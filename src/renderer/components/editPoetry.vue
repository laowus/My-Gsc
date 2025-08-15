<script setup>
import { watch, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import Writer from "../model/Writer";
import Poetry from "../model/Poetry";
import TxtEditor from "./TxtEditor.vue";
const { ipcRenderer } = window.require("electron");
import { DYNASTYS } from "../common/utils";
const route = useRoute();
const router = useRouter();

const curPoetryid = ref(route.params.id);
const curPoetry = ref(null);
const writerList = ref([]);
const curInfoList = ref([]);
const curInfoIndex = ref(0);

const dyOptions = () => {
  // 从索引1开始截取数组，并映射为目标格式
  return DYNASTYS.slice(1).map((item, index) => ({
    value: index + 1,
    label: item.trim() // 去除可能存在的空格（如"宋朝 "→"宋朝"
  }));
};

const fetchPoetry = () => {
  try {
    ipcRenderer.invoke("db-get-poetry-by-id", curPoetryid.value).then((res) => {
      if (res.success) {
        const data = res.data;
        console.log(data);
        const writer = new Writer(data.writerid, data.writername, data.dynastyid);
        data.content = data.content.replace(/\(/g, "<br> (");
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

watch(
  () => curPoetryid.value,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      getPoetryDetail();
      curInfoIndex.value = 0;
    }
  }
);

const setCurIndex = (index) => {
  curInfoIndex.value = index;
};

const goBack = () => {
  router.go(-1);
};

const savePoetry = () => {
  if (curPoetry.value) {
    console.log(curPoetry.value);
  }
};
</script>
<template>
  <div class="edit-poetry">
    <div class="return" @click="goBack">
      <i class="iconfont icon-fanhui"></i>
    </div>
    <el-form :model="curPoetry" label-width="120px" v-if="curPoetry">
      <el-form-item label="诗词名称">
        <el-input v-model="curPoetry.title" style="width: 300px; margin-right: 10px"></el-input>
        <el-button type="primary" @click="savePoetry"> 修改 </el-button>
      </el-form-item>
      <el-form-item label="作者">
        <el-select v-model="curPoetry.writer.dynastyid" style="width: 100px; margin-right: 20px" @change="changeDid">
          <el-option v-for="item in dyOptions()" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select style="width: 150px" v-model="curPoetry.writer.writerid">
          <el-option v-for="(item, index) in writerList" :key="index" :label="item.writername" :value="item.writerid" />
        </el-select>
      </el-form-item>
      <el-form-item label="内容">
        <TxtEditor v-model:content="curPoetry.content" :height="200" />
      </el-form-item>
      <el-form-item label="信息" v-if="curInfoList.length > 0">
        <div class="poem-info">
          <div class="poem-info-title">
            <div class="info-item-title" :class="{ 'title-select': curInfoIndex === index }" v-for="(item, index) in curInfoList" :key="item.id" @click="setCurIndex(index)">
              {{ item.title }}
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item v-if="curInfoList.length > 0">
        <TxtEditor :content="curInfoList[curInfoIndex].content" :height="200" />
      </el-form-item>
    </el-form>
  </div>
</template>

<style>
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
.poem-info-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: flex;
  flex-direction: row;
  gap: 20px;
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
