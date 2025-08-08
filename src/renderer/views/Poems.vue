<script setup>
const { ipcRenderer } = window.require("electron");
import { ref, watch, reactive, onMounted, nextTick } from "vue";
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

const fetchPoetrys = async () => {
  try {
    await ipcRenderer.invoke("db-get-all-poetry").then((res) => {
      if (res.success) {
        poetryList.value = res.data.map((item) => {
          const writer = new Writer(item.writerid, item.writername, item.dynastyid);
          return new Poetry(item.poetryid, item.typeid, item.kindid, writer, item.title, item.content, item.infos);
        });
        if (curIndex.value >= poetryList.value.length) {
          curIndex.value = 0;
        } else {
          curPoetry.value = poetryList.value[curIndex.value];
        }
      }
    }); // 使用异步方法
  } catch (error) {
    console.error("获取诗歌数据失败:", error);
  }
};
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
};

const search = () => {
  const keyword = document.querySelector(".searche-input").value;
  if (keyword) {
    const filteredPoetrys = poetryList.value.filter((item) => {
      return item.title.includes(keyword) || item.content.includes(keyword);
    });
    if (filteredPoetrys.length > 0) {
      curIndex.value = poetryList.value.indexOf(filteredPoetrys[0]);
      handlePoemClick(curIndex.value);
    } else {
      alert("未找到相关诗歌");
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
