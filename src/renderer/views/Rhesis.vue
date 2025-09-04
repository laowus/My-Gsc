<script setup>
import { ref, onMounted, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "../store/appStore";
import PoetryDetail from "../components/PoetryDetail.vue";
import KindIcon from "../components/KindIcon.vue";
import { ElMessage, ElMessageBox } from "element-plus";

import { DYNASTYS } from "../common/utils";
const { ipcRenderer } = window.require("electron");

const scrollerRef = ref(null);
const { setCurRhIndex, setRhkeyword } = useAppStore();
const { curRhIndex, rhkeyword } = storeToRefs(useAppStore());

const curPoetry = ref(null);
const rhesisList = ref([]);
const addDialog = ref(false);

const addRhesis = ref({
  rcontent: "",
  poetryid: 0
});

const poetryList = ref([]); //用于添加名句时选择诗歌

const fetchPoetrys = async () => {
  try {
    await ipcRenderer.invoke("db-get-rhesis", rhkeyword.value).then((res) => {
      console.log("fetchPoetrys", res);
      if (res.success) {
        rhesisList.value = res.data;
        if (rhesisList.value.length > 0) {
          curPoetry.value = rhesisList.value[curRhIndex.value];
        }
      }
    });
  } catch (error) {
    console.error("获取诗歌数据失败:", error);
  }
};

onMounted(async () => {
  await fetchPoetrys();
  nextTick(() => handleScroll());
});

const handleRhesisClick = (index) => {
  console.log(index);
  setCurRhIndex(index);
  curPoetry.value = rhesisList.value[index];
};
const handleScroll = () => {
  if (scrollerRef.value) {
    console.log("滚动到", curRhIndex.value);
    scrollerRef.value.scrollToItem(curRhIndex.value);
  }
};
const search = () => {
  const _keyword = document.querySelector(".search-input").value.trim();
  //去数据库哪里获取值,如果没有就提示,不保存
  ipcRenderer.invoke("db-get-count-by-rhkeyword", _keyword).then((res) => {
    if (res.success) {
      console.log("getCountByRhkeyword", res);
      if (res.data > 0) {
        setRhkeyword(_keyword);
        setCurRhIndex(0);
        fetchPoetrys();
        handleScroll();
      } else {
        ElMessage.error(`关键字: [${_keyword}] 没有符合条件的诗歌,请重新输入`);
        document.querySelector(".search-input").value = rhkeyword.value;
        return;
      }
    } else {
      ElMessage.error("获取诗歌数量失败");
      return;
    }
  });
};

const searchPoetry = () => {
  const _rcontent = addRhesis.value.rcontent.trim();
  if (_rcontent.length === 0) {
    alert("请输入名句内容");
    return;
  }
  //去数据库哪里获取值,如果没有就提示,不保存
  ipcRenderer.invoke("db-get-poetry-by-rcontent", _rcontent).then((res) => {
    if (res.success) {
      console.log("getPoetryByRcontent", res);
      if (res.data.length > 0) {
        rhesisList.value = res.data;
      } else {
        alert(`名句: [${_rcontent}] 没有符合条件的诗歌,请重新输入`);
        return;
      }
    } else {
      alert("获取诗歌失败");
      return;
    }
  });
};
</script>
<template>
  <div class="rhesiss">
    <el-dialog v-model="addDialog" title="添加名句" width="80%" align-center>
      <el-form label-width="120px">
        <el-form-item label="名句内容">
          <el-input v-model="addRhesis.rcontent" style="width: 300px; margin-right: 10px"> </el-input>
          <button class="icon-btn" @click="searchPoetry">
            <span class="iconfont icon-sousuobeifen2" style="font-size: 30px"></span>
          </button>
        </el-form-item>
        <el-form-item label="选择诗歌" v-if="poetryList.length > 0">
          <el-select v-model="addRhesis.poetryid" placeholder="请选择诗歌" style="width: 300px">
            <el-option v-for="item in rhesisList" :key="item.poetryid" :label="item.title + ' - ' + item.writername" :value="item.poetryid" />
          </el-select>
          <div>当前选择:</div>
        </el-form-item>
      </el-form>
    </el-dialog>
    <div class="rhesiss-left">
      <div class="top-bar">
        <div class="search">
          <span class="iconfont icon-sousuobeifen2"></span>
          <input type="text" placeholder="输入关键字" class="search-input" :value="rhkeyword" />
          <span class="title-count">( {{ curRhIndex + 1 }}/ {{ rhesisList.length }})</span>
        </div>
        <button class="icon-btn" @click="search">
          <span class="iconfont icon-sousuobeifen2" style="font-size: 30px"></span>
        </button>
        <button class="icon-btn" @click="addDialog = true">
          <span class="iconfont icon-jia" style="font-size: 30px"></span>
        </button>
      </div>
      <div class="rhesiss-left-content" v-if="rhesisList.length > 0">
        <RecycleScroller ref="scrollerRef" class="scroller" :items="rhesisList" :item-size="120" key-field="rhesisid" v-slot="{ item, index }">
          <div class="rhesis-item" :class="{ pselected: index === curRhIndex }" @click="handleRhesisClick(index)">
            <div class="rhesis-item-top">
              <div class="rhesis-item-index">{{ index + 1 }}</div>
              <div class="rhesis-item-content">
                {{ item.rcontent }}
              </div>
            </div>
            <div class="rhesis-item-writer">
              <div class="rhesis-item-writer-left"><KindIcon :kindid="item.kindid"></KindIcon> {{ item.title }}</div>
              <div>{{ item.writername }} [{{ DYNASTYS[item.dynastyid] }}]</div>
            </div>
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
.rhesis-item-writer-left {
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  justify-content: flex-start;
  align-items: center;
}

.scroller {
  height: 92vh;
}

.rhesiss-left-content {
  font-size: 18px;
  color: red;
}
.rhesis-item {
  padding: 12px;
  margin: 8px;
  gap: 8px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 2px solid #f0f0f0;
  height: 80px;
}

.rhesis-item:hover {
  background-color: #f8f4d2;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  cursor: pointer;
}
.pselected {
  background-color: #f8f4d2 !important;
  border-color: #ccc875;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
.rhesis-item-top {
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;
  gap: 8px;
}
.rhesis-item-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
.rhesis-item-writer {
  height: 20px;
  font-size: 12px;
  color: #7f8c8d;
  align-items: center;
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.rhesis-item-index {
  font-size: 12px;
  color: #ffffff; /* 白色文字 */
  background-color: #2196f3; /* 蓝色背景 */
  align-items: center;
  justify-content: center;
  line-height: 1rem;
  padding: 5px;
  border-radius: 5px;
}

.rhesis-right {
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
.rhesiss {
  display: flex;
  flex-direction: row;
  background-color: #f5f5f5;
}
.rhesiss-left {
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
  justify-content: space-between;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-left: 5px;
  background-color: white;
}

.search-input {
  width: 100%;
  flex: 1;
  padding: 5px;
}

.title-count {
  font-size: 12px;
  color: #7f8c8d;
  margin-right: 5px;
  font-weight: bold;
}
</style>
