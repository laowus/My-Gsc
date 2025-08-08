<script setup>
const { ipcRenderer } = window.require("electron");
import { ref, watch, reactive, onMounted, nextTick, onUnmounted } from "vue";

import { storeToRefs } from "pinia";
import Poetry from "../model/Poetry";
import Writer from "../model/Writer";
import KindIcon from "../components/KindIcon.vue";
import PoetryDetail from "../components/poetryDetail.vue";
import { useAppStore } from "../store/appStore";
import { RecycleScroller } from "vue-virtual-scroller";
const scrollerRef = ref(null);
const { setCurIndex } = useAppStore();
const { curIndex } = storeToRefs(useAppStore());
const curPoetry = ref(null);
const poetryList = ref([]);
<<<<<<< HEAD
=======
const isLoading = ref(true); // 添加加载状态
const poemsLeftContent = ref(null);
const poemItems = ref([]);
const page = ref(1);
const pageSize = ref(20);
const totalPoetry = ref(0);
>>>>>>> 142897f0e70019155b906e9734738a665ae61012

// 新增：存储需要定位的索引
const targetIndex = ref(curIndex.value);

const fetchPoetrys = () => {
  try {
    isLoading.value = true;
    // 新增：获取总数据量
    ipcRenderer.send("db-get-poetry-count");
    // 新增：处理获取总数据量的回复
    ipcRenderer.on("db-get-poetry-count-reply", (event, res) => {
      if (res.success) {
        totalPoetry.value = res.data;
      }
    });

    ipcRenderer.send("db-get-poetry-by-page", { page: page.value, pageSize: pageSize.value });
  } catch (error) {
    console.error("获取诗歌数据失败:", error);
  }
};
<<<<<<< HEAD
onMounted(async () => {
  await fetchPoetrys();
  nextTick(() => {
    if (scrollerRef.value) {
      scrollerRef.value.scrollToItem(curIndex.value);
    }
  });
});

const handlePoemClick = (index) => {
  console.log(index);
  curIndex.value = index;
  curPoetry.value = poetryList.value[index];
=======

// 新增：标记是否是首次加载数据
const isFirstLoad = ref(true);

// 修改：处理数据加载完成后的逻辑
const handlePoetryReply = (event, res) => {
  if (res.success) {
    // 追加数据而非覆盖
    poetryList.value = [
      ...poetryList.value,
      ...res.data.map((item) => {
        const writer = new Writer(item.writerid, item.writername, item.dynastyid);
        return new Poetry(item.poetryid, item.typeid, item.kindid, writer, item.title, item.content, item.infos);
      })
    ];

    // 仅在首次加载时检查是否加载到目标索引
    if (isFirstLoad.value && poetryList.value.length > targetIndex.value) {
      curIndex.value = targetIndex.value;
      curPoetry.value = poetryList.value[curIndex.value];
      nextTick(() => {
        scrollToCurrentIndex();
      });
      isFirstLoad.value = false;
    } else if (!isLoading.value && poetryList.value.length < totalPoetry.value) {
      // 如果还没加载完所有数据，继续加载下一页
      loadMore();
    }
  }
  isLoading.value = false;
};

onMounted(() => {
  // 计算需要加载的起始页码
  const startPage = Math.floor(targetIndex.value / pageSize.value) + 1;
  page.value = startPage;
  fetchPoetrys();
  ipcRenderer.on("db-get-poetry-by-page-reply", handlePoetryReply);
  ipcRenderer.on("db-get-poetry-by-page-error", handlePoetryError);
  // 添加滚动事件监听
  poemsLeftContent.value?.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  ipcRenderer.removeListener("db-get-poetry-by-page-reply", handlePoetryReply);
  ipcRenderer.removeListener("db-get-poetry-by-page-error", handlePoetryError);
  // 移除滚动事件监听
  poemsLeftContent.value?.removeEventListener("scroll", handleScroll);
});

const scrollToCurrentIndex = () => {
  if (poemsLeftContent.value && poemItems.value[curIndex.value]) {
    console.log(poemItems.value[curIndex.value]);
    poemItems.value[curIndex.value].scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }
>>>>>>> 142897f0e70019155b906e9734738a665ae61012
};

const handlePoetryError = (event, error) => {
  console.error("获取诗歌数据失败:", error);
  isLoading.value = false;
};

const handlePoemClick = (index) => {
  console.log(index);
  setCurIndex(index);
  curPoetry.value = poetryList.value[index];
  // 仅在点击时调用滚动方法
  nextTick(() => {
    scrollToCurrentIndex();
  });
};

const search = () => {};
const loadMore = () => {
  page.value++;
  fetchPoetrys();
};

// 添加滚动事件处理函数
const handleScroll = () => {
  const container = poemsLeftContent.value;
  if (container) {
    const { scrollTop, scrollHeight, clientHeight } = container;
    // 当滚动到距离底部 50px 时，触发加载更多
    if (scrollTop + clientHeight >= scrollHeight - 50 && !isLoading.value) {
      loadMore();
    }
  }
};
</script>
<template>
  <div class="poems">
    <div class="poems-left">
      <div class="top-bar">
        <div class="search">
          <span class="iconfont icon-sousuobeifen2"></span>
          <input type="text" placeholder="输入关键字" class="searche-input" />
        </div>
        <button class="icon-btn" @click="search">
          <span class="iconfont icon-jia" style="font-size: 30px"></span>
        </button>
      </div>
      <div class="poems-left-content">
        <RecycleScroller ref="scrollerRef" class="scroller" :items="poetryList" :item-size="120" key-field="poetryid" v-slot="{ item, index }">
          <div class="poem-item" :class="{ pselected: index === curIndex }" @click="handlePoemClick(index)">
            <div class="poem-item-title">{{ item.poetryid }} 、{{ item.title }}</div>
            <div class="poem-item-writer"><KindIcon :kindid="item.kindid" />[{{ item.writer.dynastyname }}] {{ item.writer.writername }}</div>
            <div class="poem-item-content" v-html="item.content.slice(0, 50) + (item.content.length > 50 ? '...' : '')"></div>
          </div>
        </RecycleScroller>
      </div>
    </div>
    <div class="poem-right" v-if="curPoetry">
      <PoetryDetail :poetryid="curPoetry.poetryid" />
    </div>
  </div>
</template>
<style>
.scroller {
  height: 92vh;
}

.poems-left-content {
  margin-top: 10px;
  flex: 1;
  overflow-y: auto;
  gap: 10px;
}
.poem-item {
  padding: 5px;
  margin: 5px;
  gap: 5px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #e0e0e0;
  height: 100px;
}

.poem-item:hover {
  background-color: #ccc875;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}
.pselected {
  background-color: #ccc875 !important;
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
  height: 92vh;
  margin-top: 10px;
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
  display: flex;
  flex-direction: row;
  background-color: #f5f5f5;
}
.poems-left {
  width: 300px;
  min-width: 300px;
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
