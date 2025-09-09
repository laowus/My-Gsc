<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, watch, toRaw } from "vue";
import Poetry from "../model/Poetry";
import Writer from "../model/Writer";
import KindIcon from "../components/KindIcon.vue";
import PoetryDetail from "../components/poetryDetail.vue";
import { ElMessage, ElDropdown } from "element-plus";
const { ipcRenderer } = window.require("electron");

const route = useRoute();
const router = useRouter();

const params = ref(route.query);
const poetryList = ref([]);
const curPoetry = ref(null);
const curIndex = ref(0);
const curName = ref("");

const fetchPoetrys = async () => {
  try {
    console.log("fetchPoetrys", params.value);
    await ipcRenderer.invoke("db-get-all-poetry", toRaw(params.value)).then((res) => {
      console.log(res);
      if (res.success) {
        poetryList.value = res.data.map((item) => {
          const writer = new Writer(item.writerid, item.writername, item.dynastyid);
          return new Poetry(item.poetryid, item.typeid, item.kindid, writer, item.title, item.content, item.infos);
        });
        if (poetryList.value.length > 0) {
          curName.value = params.value.n;
          curPoetry.value = poetryList.value[curIndex.value];
          console.log("curPoetry.value", curPoetry.value);
        }
      }
    });
  } catch (error) {
    console.error("获取诗歌数据失败:", error);
  }
};

onMounted(async () => {
  await fetchPoetrys();
});

// 添加对 route.query 的监听
watch(
  () => route.query,
  (newQuery) => {
    params.value = newQuery;
    curIndex.value = 0;
    fetchPoetrys();
  },
  { deep: true }
);

const handlePoemClick = (index) => {
  console.log(index);
  curIndex.value = index;
  curPoetry.value = poetryList.value[index];
};
const goBack = () => {
  router.go(-1);
};

const handleExport = async (format) => {
  console.log("选择的导出格式:", format);
  if (format === "txt" && poetryList.value.length > 0) {
    ipcRenderer.once("export-txt-reply", (event, res) => {
      console.log(res);
      if (res.success) {
        ElMessage.success(`导出成功!`);
      } else {
        ElMessage.error(res.message);
      }
    });
    ipcRenderer.send("export-txt", curName.value, toRaw(poetryList.value));
  } else if (format === "html" && poetryList.value.length > 0) {
    ipcRenderer.once("export-html-reply", (event, res) => {
      console.log(res);
      if (res.success) {
        ElMessage.success(`导出成功!`);
      } else {
        ElMessage.error(res.message);
      }
    });
    ipcRenderer.send("export-html", curName.value, toRaw(poetryList.value));
  } else if (format === "epub" && poetryList.value.length > 0) {
    ipcRenderer.once("export-epub-reply", (event, res) => {
      console.log(res);
      if (res.success) {
        ElMessage.success(`导出成功!`);
      } else {
        ElMessage.error(res.message);
      }
    });
    ipcRenderer.send("export-epub", curName.value, toRaw(poetryList.value));
  } else {
    ElMessage.error("当前没有诗歌可以导出");
  }
};
</script>

<template>
  <div class="poetrys">
    <div class="poetrys-left">
      <div class="return">
        <button class="icon-btn" @click="goBack">
          <span class="iconfont icon-fanhui"></span>
        </button>
        <div class="info">[ {{ curName }} ] ( {{ curIndex + 1 }} /{{ poetryList.length }} )</div>
        <el-dropdown trigger="click" @command="handleExport">
          <button class="icon-btn" title="导出">
            <span class="iconfont icon-gengduo" style="font-size: 18px"></span>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="html">
                <span class="iconfont icon-html" style="margin-right: 8px"></span>
                导出为 HTML
              </el-dropdown-item>
              <el-dropdown-item command="txt">
                <span class="iconfont icon-txt" style="margin-right: 8px"></span>
                导出为 TXT
              </el-dropdown-item>
              <el-dropdown-item command="epub">
                <span class="iconfont icon-epub" style="margin-right: 8px"></span>
                导出为 EPUB
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="poetrys-left-content" v-if="poetryList.length > 0">
        <RecycleScroller class="scroller" :items="poetryList" :item-size="120" key-field="poetryid" v-slot="{ item, index }">
          <div class="poetry-item" :class="{ pselected: index === curIndex }" @click="handlePoemClick(index)">
            <div class="poetry-item-title">{{ index + 1 }} 、{{ item.title }}</div>
            <div class="poetry-item-writer"><KindIcon :kindid="item.kindid" />[{{ item.writer.dynastyname }}] {{ item.writer.writername }}</div>
            <div class="poetry-item-content" v-html="item.content.slice(0, 50) + (item.content.length > 50 ? '...' : '')"></div>
          </div>
        </RecycleScroller>
      </div>
    </div>
    <div class="poetry-right" v-if="curPoetry">
      <PoetryDetail :poetryid="curPoetry.poetryid" />
    </div>
  </div>
</template>

<style>
.return {
  padding: 10px;
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: space-between;
}
.info {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}

.scroller {
  height: 92vh;
}

.poetrys-left-content {
  flex: 1;
  overflow-y: auto;
  gap: 10px;
}
.poetry-item {
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

.poetry-item:hover {
  background-color: #ccc875;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}
.pselected {
  background-color: #ccc875 !important;
}
.poetry-item-title {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}
.poetry-item-writer {
  display: flex;
  flex-direction: row;
  font-size: 12px;
  color: #7f8c8d;
  align-items: center;
  justify-content: flex-start;
}
.poetry-item-content {
  font-size: 14px;
  color: #34495e;
}

.poetrys {
  display: flex;
  flex-direction: row;
  background-color: #f5f5f5;
}
.poetrys-left {
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
}
.poetry-right {
  display: flex;
  flex-direction: column;
  height: 92vh;
  margin-top: 10px;
}
</style>
