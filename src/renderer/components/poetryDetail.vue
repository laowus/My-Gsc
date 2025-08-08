<script setup>
import { watch, onMounted, ref } from "vue";

import KindIcon from "./KindIcon.vue";
import Writer from "../model/Writer";
import Poetry from "../model/Poetry";

const { ipcRenderer } = window.require("electron");
const props = defineProps({
  poetryid: {
    type: Number,
    default: 1
  }
});
const curPoetry = ref({});
const curInfoList = ref([]);
const curInfoIndex = ref(0);

const getPoetryDetail = () => {
  try {
    ipcRenderer.invoke("db-get-poetry-by-id", props.poetryid).then((res) => {
      if (res.success) {
        const data = res.data;
        const writer = new Writer(data.writerid, data.writername, data.dynastyid);
        data.content = data.content.replace(/\(/g, "<br> (");
        curPoetry.value = new Poetry(data.poetryid, data.typeid, data.kindid, writer, data.title, data.content, data.infos);
        if (curPoetry.value) {
          console.log("获取infolst");
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
    ipcRenderer.invoke("db-get-info-list", 1, props.poetryid).then((res) => {
      if (res.success) {
        curInfoList.value = res.data;
      }
    });
  } catch (error) {
    console.error("获取信息列表失败:", error);
  }
};

onMounted(() => {
  getPoetryDetail();
});

watch(
  () => props.poetryid,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      getPoetryDetail();
      curInfoIndex.value = 0;
    }
  }
);
</script>
<template>
  <div class="poem-detail" v-if="curPoetry">
    <div class="poem-title">
      {{ curPoetry.title }}
    </div>
    <div class="poem-writer">
      <KindIcon :kindid="curPoetry.kindid" />
      [{{ curPoetry.writer?.dynastyname }}]
      {{ curPoetry.writer?.writername }}
    </div>
    <div class="poem-content" v-html="curPoetry.content"></div>
    <div class="poem-info" v-if="curInfoList.length > 0">
      <div class="poem-info-title">
        <div class="info-item-title" :class="{ 'title-select': curInfoIndex === index }" v-for="(item, index) in curInfoList" :key="item.id" @click="curInfoIndex = index">
          {{ item.title }}
        </div>
      </div>
      <div class="info-content" v-html="curInfoList[curInfoIndex].content"></div>
    </div>
  </div>
</template>

<style>
.poem-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 30px;
  width: 80%;
  margin: auto;
}

.poem-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.poem-writer {
  font-size: 1rem;
  color: #666;
  display: flex;
  flex-direction: row;
}

.poem-content {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #333;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-height: 30vh;
  overflow-y: auto;
  max-width: 100%;
  width: fit-content;
  margin: auto;
}

.poem-info {
  font-size: 1rem;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.poem-info-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: flex;
  flex-direction: row;
  gap: 10px;
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
.info-content {
  font-size: 12px;
  line-height: 1.8;
  color: #333;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 30vh;
}
</style>
