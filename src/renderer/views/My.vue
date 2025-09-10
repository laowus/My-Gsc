<script>
export default {
  name: "my"
};
</script>

<script setup>
import { ref, onMounted, toRaw } from "vue";
import { useAppStore } from "../store/appStore";
import { storeToRefs } from "pinia";
import myPoetryList from "../components/myPoetryList.vue";
import { ElMessage, ElDropdown } from "element-plus";

const { ipcRenderer } = window.require("electron");
const { myTypes } = storeToRefs(useAppStore());

const curMyList = ref(null);
const curIndex = ref(1);
const curpids = ref("");
const poetryListRef = ref(null);

const fetchMyList = async (mtid) => {
  await ipcRenderer.invoke("db-get-my-list", mtid).then((res) => {
    const pids = res.data.map((item) => item.poetryid).join(",");
    console.log("pids", pids);
    curpids.value = pids;
  });
};

onMounted(async () => {
  await fetchMyList(curIndex.value);
});

const clickItem = (index) => {
  curIndex.value = index;
  fetchMyList(index);
};

const handleExport = (command) => {
  if (!curpids.value) {
    ElMessage.error("当前没有收藏的诗词");
    return;
  }
  poetryListRef.value.handleExport(command, myTypes.value[curIndex.value]);
};
</script>
<template>
  <div class="my">
    <div class="my-types">
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
      <div class="my-item" :class="{ active: curIndex === index + 1 }" v-for="(item, index) in myTypes.slice(1)" :key="index" @click="clickItem(index + 1)">
        {{ item }}
      </div>
    </div>
    <div>
      <div v-for="(item, index) in curMyList" :key="index">
        {{ item }}
      </div>
    </div>
    <myPoetryList :pids="curpids" v-if="curpids" ref="poetryListRef" />
    <div class="special-tip" v-else>当前没有收藏的诗词</div>
  </div>
</template>

<style>
.special-tip {
  padding: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}

.my {
  display: flex;
  flex-direction: column;
  padding-top: 20px;
}
.my-types {
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding-left: 5px;
  padding-bottom: 5px;
}
.my-item {
  padding: 5px 10px;
  border-radius: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
}
.my-item.active {
  background-color: #007bff;
  color: #fff;
}
</style>
