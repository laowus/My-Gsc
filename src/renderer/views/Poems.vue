<script setup>
const { ipcRenderer } = window.require("electron");
import { ref, watch, reactive, onMounted } from "vue";
import Poetry from "../model/Poetry";
import Writer from "../model/Writer";
import KindIcon from "../components/KindIcon.vue";

const poetryList = ref([]);
const curindex = ref(0);
const curPoetry = ref(null);

const fetchPoetrys = () => {
  const poetryData = ipcRenderer.sendSync("db-get-all-poetry");
  poetryList.value = poetryData.data.map((item) => {
    const writer = new Writer(item.writerid, item.writername, item.dynastyid);
    return new Poetry(item.poetryid, item.typeid, item.kindid, writer, item.title, item.content, item.infos);
  });
};

onMounted(() => {
  fetchPoetrys();
  if (poetryList.value.length > 0) {
    curPoetry.value = poetryList.value[curindex.value];
  }
});
</script>
<template>
  <div class="poems">
    <div class="poems-left">
      <div class="top-bar">
        <div class="search">
          <span class="iconfont icon-sousuobeifen2"></span>
          <input type="text" placeholder="输入标题" class="searche-input" />
        </div>
        <button class="icon-btn">
          <span class="iconfont icon-jia" style="font-size: 30px"></span>
        </button>
      </div>
      <div class="poems-left-content">
        <div v-for="(item, index) in poetryList" :key="item.poetryid" class="poem-item">
          <div class="poem-item-title">{{ index + 1 }} 、{{ item.title }}</div>
          <div class="poem-item-writer"><KindIcon :kindid="item.kindid" />[{{ item.writer.dynastyname }}] {{ item.writer.writername }}</div>
          <div class="poem-item-content" v-html="item.content.slice(0, 50) + (item.content.length > 50 ? '...' : '')"></div>
        </div>
      </div>
    </div>
    <div class="poem-right">
      <h2 class="poem-title">{{ curPoetry.title }}</h2>
      <div class="poem-writer">[{{ curPoetry.writer.dynastyname }}] {{ curPoetry.writer.writername }}</div>
      <div class="poem-content" v-html="curPoetry.content"></div>
    </div>
  </div>
</template>

<style>
.poems-left-content {
  flex: 1;
  overflow-y: auto;
}
.poem-item {
  padding: 10px;
  margin: 10px;
  gap: 10px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
}

.poem-item:hover {
  background-color: #f8f9fa;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
.poem-item-title {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}
.poem-item-writer {
  display: flex;
  flex-direction: row;
  font-size: 12px;
  color: #7f8c8d;
  align-items: center;
  justify-content: flex-start;
}
.poem-item-content {
  font-size: 14px;
  color: #34495e;
}

.poem-right {
  display: flex;
  width: 80%;
  flex-direction: column;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  margin: 30px 10px 5px 10px;
}

.icon-btn {
  width: 30px;
  height: 30px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  display: flex;
}
.poems {
  width: 100%;
  display: flex;
  flex-direction: row;
  background-color: #f5f5f5;
  height: 99vh;
}
.poems-left {
  width: 300px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  padding-top: 20px;
}

.top-bar {
  width: 98%;
  height: 30px;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.search {
  width: 100%;
  height: 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-left: 5px;
  background-color: white;
}

.searche-input {
  width: 100%;
  flex: 1;
  padding: 5px;
}
</style>
