<script setup>
import { ref, onMounted, nextTick, toRaw, watch } from "vue";
import { storeToRefs } from "pinia";
import Poetry from "../model/Poetry";
import Writer from "../model/Writer";
import KindIcon from "../components/KindIcon.vue";
import PoetryDetail from "../components/poetryDetail.vue";
import { useAppStore } from "../store/appStore";
import TxtEditor from "../components/TxtEditor.vue";
import { DYNASTYS } from "../common/utils";
import { ElMessage, ElMessageBox } from "element-plus";
const { ipcRenderer } = window.require("electron");

const scrollerRef = ref(null);
const { setCurIndex, setKeyword, setLastAddPoetry } = useAppStore();
const { curIndex, keyword, lastAddPoetry } = storeToRefs(useAppStore());

const curPoetry = ref(null);
const poetryList = ref([]);
const addDialog = ref(false);
//当前作者的列表
const curWriter = ref({ dynastyid: 7 });
const writerList = ref([]);
const curAddPoetry = ref(null);

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

onMounted(async () => {
  await fetchPoetrys();
  nextTick(() => handleScroll(curIndex.value));
});

const handleScroll = (cIndex) => {
  if (scrollerRef.value) {
    console.log("滚动到", cIndex);
    scrollerRef.value.scrollToItem(cIndex);
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
        handleScroll(curIndex.value);
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
/** 以下代码用于添加诗歌******* */
//根据store中的writerid获取作者信息

const dyOptions = () => {
  // 从索引1开始截取数组，并映射为目标格式
  return DYNASTYS.slice(1).map((item, index) => ({
    value: index + 1,
    label: item.trim() // 去除可能存在的空格（如"宋朝 "→"宋朝"
  }));
};
//选择朝代,默认选择第一个
const changeDid = (index) => {
  console.log(index);
  curWriter.value.dynastyid = index;
  // 修改后：在数据加载完成后设置默认值
  getWriterList().then(() => {
    if (writerList.value.length > 0) {
      console.log("writerList.value", writerList.value[0].writerid);
      curAddPoetry.value.writerid = writerList.value[0].writerid;
      console.log("curAddPoetry", curAddPoetry.value);
    }
  });
};

//根据朝代获取作者列
const getWriterList = () => {
  return new Promise((resolve) => {
    console.log("getWriterList", curWriter.value.dynastyid);
    try {
      ipcRenderer.invoke("db-get-writers-by-did", curWriter.value.dynastyid).then((res) => {
        if (res.success) {
          writerList.value = res.data;
          // 验证数据结构（关键调试步骤）
          console.log("作者数据结构:", res.data[0]);
          resolve();
        }
      });
    } catch (error) {
      console.error("获取作者列表失败:", error);
      resolve();
    }
  });
};

const saveAddPoetry = () => {
  console.log(curAddPoetry.value);

  if (curAddPoetry.value.title.trim === "" || curAddPoetry.value.content.trim === "") {
    ElMessage.error("标题和内容不能为空");
    return;
  }

  ipcRenderer.invoke("db-add-poetry", toRaw(curAddPoetry.value)).then((res) => {
    if (res.success) {
      ElMessage.success(`添加 [ ${curAddPoetry.value.title} ]成功`);
      curIndex.value = poetryList.value.length;
      fetchPoetrys().then(() => {
        nextTick(() => handleScroll(curIndex.value));
        //新增后记录之前新增的作者等记录,下次新增时默认选中
        setLastAddPoetry({
          writerid: curAddPoetry.value.writerid,
          typeid: "",
          kindid: 1,
          title: "",
          content: ""
        });
        addDialog.value = false;
      });
    } else {
      ElMessage.error(`添加 [ ${curAddPoetry.value.title} ]失败`);
    }
  });
};

const fetchWriter = () => {
  console.log("fetchWriter", lastAddPoetry.value.writerid);
  if (lastAddPoetry.value.writerid) {
    ipcRenderer.invoke("db-get-writer-by-id", lastAddPoetry.value.writerid).then((res) => {
      console.log(res);
      if (res.data) {
        curWriter.value = new Writer(res.data.writerid, res.data.writername, res.data.dynastyid, res.data.summary);
        getWriterList();
      }
    });
  }
};
//用于添加新的诗歌作用 监测addDialog是否打开
watch(addDialog, () => {
  if (addDialog.value) {
    //显示弹出框 添加诗歌 获取朝代id
    console.log("打开添加诗歌");
    curAddPoetry.value = { ...toRaw(lastAddPoetry.value) };
    fetchWriter();
  }
});
</script>
<template>
  <div class="poems">
    <el-dialog v-model="addDialog" title="添加诗歌" width="80%" align-center>
      <el-form label-width="120px">
        <el-form-item label="名字">
          <el-input v-model="curAddPoetry.title" style="width: 300px; margin-right: 10px"></el-input>
        </el-form-item>
        <el-form-item label="作者">
          <el-select v-model="curWriter.dynastyid" style="width: 100px; margin-right: 20px" @change="changeDid">
            <el-option v-for="item in dyOptions()" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select style="width: 150px" v-model="curAddPoetry.writerid">
            <el-option v-for="(item, index) in writerList" :key="index" :label="item.writername" :value="item.writerid" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <TxtEditor v-model:content="curAddPoetry.content" :height="300" />
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
  height: 100vh;
}
.poems-left {
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  margin-bottom: 10px !important;
}

.top-bar {
  width: 100vh;
  height: 30px;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-bottom: 10px;
  margin-top: 20px;
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
</style>
