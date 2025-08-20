<script setup>
import { ref, onMounted, nextTick } from "vue";
import { storeToRefs } from "pinia";
import Poetry from "../model/Poetry";
import Writer from "../model/Writer";
import KindIcon from "../components/KindIcon.vue";
import PoetryDetail from "../components/poetryDetail.vue";
import { useAppStore } from "../store/appStore";
import TxtEditor from "../components/TxtEditor.vue";
import { DYNASTYS } from "../common/utils";
const { ipcRenderer } = window.require("electron");

const scrollerRef = ref(null);
const { setCurIndex, setKeyword } = useAppStore();
const { curIndex, keyword, lastAddPoetry } = storeToRefs(useAppStore());

const curPoetry = ref(null);
const poetryList = ref([]);
const addDialog = ref(false);
//当前作者的列表
const curWriter = ref(null);
const writerList = ref([]);
const curAddPoetry = ref({
  typeid: "",
  kindid: 1,
  writer: null,
  title: "",
  content: ""
});

const fetchPoetrys = async () => {
  try {
    await ipcRenderer.invoke("db-get-all-poetry", { ty: "keyword", v: keyword.value }).then((res) => {
      console.log(res);
      if (res.success) {
        poetryList.value = res.data.map((item) => {
          const writer = new Writer(item.writerid, item.writername, item.dynastyid);
          return new Poetry(item.poetryid, item.typeid, item.kindid, writer, item.title, item.content, item.infos);
        });
        console.log(poetryList.value.length);
        if (curIndex.value > poetryList.value.length) {
          setCurIndex(0);
        }
        if (poetryList.value.length > 0) {
          curPoetry.value = poetryList.value[curIndex.value];
          console.log("curPoetry.value", curPoetry.value);
        }
      } else {
      }
    });
  } catch (error) {
    console.error("获取诗歌数据失败:", error);
  }
};
//根据store中的writerid获取作者信息
const fetchWriter = async () => {
  if (lastAddPoetry.value.writerid) {
    ipcRenderer.invoke("db-get-writer-by-id", lastAddPoetry.value.writerid).then((res) => {
      console.log(res);
      if (res.data) {
        curWriter.value = new Writer(res.data.writerid, res.data.writername, res.data.dynastyid, res.data.summary);
        curAddPoetry.value.writer = curWriter.value;
        getWriterList(false);
      }
    });
  }
};

onMounted(async () => {
  await fetchWriter();
  await fetchPoetrys();
  nextTick(() => handleScroll());
});

const handleScroll = () => {
  if (scrollerRef.value) {
    console.log("滚动到", curIndex.value);
    scrollerRef.value.scrollToItem(curIndex.value);
  }
};

const handlePoemClick = (index) => {
  console.log(index);
  setCurIndex(index);
  curPoetry.value = poetryList.value[index];
};

const search = () => {
  const _keyword = document.querySelector(".search-input").value.trim();
  //去数据库哪里获取值,如果没有就提示,不保存
  ipcRenderer.invoke("db-get-count-by-keyword", _keyword).then((res) => {
    if (res.success) {
      console.log("getCountByKeyword", res);
      if (res.data > 0) {
        setKeyword(_keyword);
        setCurIndex(0);
        fetchPoetrys();
        handleScroll();
      } else {
        alert(`关键字: [${_keyword}] 没有符合条件的诗歌,请重新输入`);
        document.querySelector(".search-input").value = keyword.value;
        return;
      }
    } else {
      alert("获取诗歌数量失败");
      return;
    }
  });
};

const addPoetry = () => {};

const dyOptions = () => {
  // 从索引1开始截取数组，并映射为目标格式
  return DYNASTYS.slice(1).map((item, index) => ({
    value: index + 1,
    label: item.trim() // 去除可能存在的空格（如"宋朝 "→"宋朝"
  }));
};

const changeDid = (index) => {
  console.log(index);
  curWriter.value.dynastyid = index;
  getWriterList(true);
};

const getWriterList = (isChangeDid) => {
  try {
    ipcRenderer.invoke("db-get-writers-by-did", curWriter.value.dynastyid).then((res) => {
      if (res.success) {
        writerList.value = res.data;
        if (writerList.value.length > 0) {
          //怎么让writerid默认选中第一个
          if (isChangeDid) {
            curWriter.value.writerid = writerList.value[0].writerid;
            curWriter.value.writername = writerList.value[0].writername;
          }
        }
      }
    });
  } catch (error) {
    console.error("获取信息列表失败:", error);
  }
};

const saveAddPoetry = () => {
  ipcRenderer.invoke("db-add-poetry", curAddPoetry.value).then((res) => {
    if (res.success) {
      alert("添加成功");
      addDialog.value = false;
      //fetchPoetrys();
    } else {
      alert("添加失败");
    }
  });
};
</script>
<template>
  <div class="poems">
    <el-dialog v-model="addDialog" title="添加诗歌" width="80%" align-center>
      <el-form label-width="120px">
        <el-form-item label="名字">
          <el-input v-model="addPoetry.title" style="width: 300px; margin-right: 10px"></el-input>
        </el-form-item>
        <el-form-item label="作者">
          <el-select v-model="curWriter.dynastyid" style="width: 100px; margin-right: 20px" @change="changeDid">
            <el-option v-for="item in dyOptions()" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select style="width: 150px" v-model="curWriter.writerid">
            <el-option v-for="(item, index) in writerList" :key="index" :label="item.writername" :value="item.writerid" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <TxtEditor v-model:content="addPoetry.content" :height="300" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveAddPoetry"> 添加 </el-button>

          <el-button @click="addDialog = false"> 取消 </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <div class="poems-left">
      <div class="top-bar">
        <div class="search">
          <input type="text" placeholder="输入关键字" class="search-input" :value="keyword" />
          <span class="title-count">( {{ curIndex + 1 }}/ {{ poetryList.length }})</span>
        </div>
        <button class="icon-btn" @click="search">
          <span class="iconfont icon-sousuobeifen2" style="font-size: 30px"></span>
        </button>
        <button class="icon-btn" @click="addDialog = true">
          <span class="iconfont icon-jia" style="font-size: 30px"></span>
        </button>
      </div>
      <div class="poems-left-content" v-if="poetryList.length > 0">
        <RecycleScroller ref="scrollerRef" class="scroller" :items="poetryList" :item-size="120" key-field="poetryid" v-slot="{ item, index }">
          <div class="poem-item" :class="{ pselected: index === curIndex }" @click="handlePoemClick(index)">
            <div class="poem-item-title">{{ index + 1 }} 、{{ item.title }}</div>
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
