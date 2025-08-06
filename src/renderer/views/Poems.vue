<script setup>
const { ipcRenderer } = window.require("electron");
import { ref, watch, reactive, onMounted } from "vue";
import Poetry from "../model/Poetry";
import Writer from "../model/Writer";
import KindIcon from "../components/KindIcon.vue";

const poetryList = ref([]);
const curindex = ref(0);
const curPoetry = ref(null);
const isLoading = ref(true); // 添加加载状态

const fetchPoetrys = async () => {
  try {
    await ipcRenderer.invoke("db-get-all-poetry").then((res) => {
      if (res.success) {
        poetryList.value = res.data.map((item) => {
          const writer = new Writer(item.writerid, item.writername, item.dynastyid);
          return new Poetry(item.poetryid, item.typeid, item.kindid, writer, item.title, item.content, item.infos);
        });
        console.log(poetryList.value.length);
        if (poetryList.value.length > 0) {
          curPoetry.value = poetryList.value[curindex.value];
          console.log("curPoetry.value", curPoetry.value);
        }
      }
    }); // 使用异步方法
  } catch (error) {
    console.error("获取诗歌数据失败:", error);
  } finally {
    isLoading.value = false; // 加载完成
  }
};

onMounted(() => {
  fetchPoetrys();
});

const handlePoemClick = (index) => {
  console.log("index", index);
  curindex.value = index;
};

watch(curindex, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    curPoetry.value = poetryList.value[newVal];
  }
});
</script>
<template>
  <div v-if="isLoading" class="modal-overlay">
    <div class="loading">
      <div class="progress-bar">
        <div class="progress"></div>
      </div>
      <div>加载中，请稍候...</div>
    </div>
  </div>
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
        <div>
          <div v-for="(item, index) in poetryList" :key="item.poetryid" class="poem-item" @click="handlePoemClick(index)" :class="{ pselected: index === curindex }">
            <div class="poem-item-title">{{ index + 1 }} 、{{ item.title }}</div>
            <div class="poem-item-writer"><KindIcon :kindid="item.kindid" />[{{ item.writer.dynastyname }}] {{ item.writer.writername }}</div>
            <div class="poem-item-content" v-html="item.content.slice(0, 50) + (item.content.length > 50 ? '...' : '')"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="poem-right" v-if="curPoetry">
      <h2>{{ curPoetry.title }}</h2>
      <div class="poem-writer">
        <KindIcon :kindid="curPoetry.kindid" />
        [{{ curPoetry.writer.dynastyname }}] {{ curPoetry.writer.writername }}
      </div>
      <div class="poem-content" v-html="curPoetry.content"></div>
    </div>
  </div>
</template>
<style>
.poems-left-content {
  margin-top: 10px;
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
  background-color: #ccc875;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}
.pselected {
  background-color: #ccc875;
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
  flex-direction: column;
  text-align: center;
  margin: 0 auto;
  width: 80%;
  margin-top: 20px;
}
.poem-writer {
  font-size: 12px;
  color: #7f8c8d;
  text-align: left;
  margin-left: 100px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
}

.poem-content {
  font-size: 14px;
  color: #34495e;
  font-size: 20px;
  font-weight: 700;
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
}
.poems-left {
  width: 300px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  padding-top: 20px;
  height: 99vh;
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 1001;
}

.progress-bar {
  width: 300px;
  height: 5px;
  background-color: #e0e0e0;
  border-radius: 5px;
}

.progress {
  height: 100%;
  background-color: #42b983;
  border-radius: 5px;
  width: 0%;
  animation: progress 1.5s infinite;
}

@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
}
</style>
