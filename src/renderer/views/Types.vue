<script setup>
import { ref, onMounted, watch } from "vue";
import getColor from "../common/colorUtils";
const { ipcRenderer } = window.require("electron");
const ptypes = ref([]);
const ctypes = ref([]);
const curpid = ref(0);

const fetchTypes = async () => {
  await ipcRenderer.invoke("db-get-types-by-pid", 0).then((res) => {
    if (res.success) {
      ptypes.value = res.data;
    }
  });
  if (ptypes.value.length > 0) {
    const pid = ptypes.value[curpid.value].typeid;
    console.log(pid);
    const res1 = await ipcRenderer.invoke("db-get-types-by-pid", pid);
    console.log(res1);
    if (res1.success) {
      ctypes.value = res1.data;
    }
  }
};

onMounted(async () => {
  await fetchTypes();
});

watch(curpid, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    await fetchTypes();
  }
});
</script>
<template>
  <div class="types">
    <div class="types-left">
      <div class="ptype-item" :class="{ dselected: curpid === index }" v-for="(item, index) in ptypes" :key="index" :style="{ backgroundColor: getColor(index) }" @click="curpid = index">{{ item.typename }}</div>
    </div>
    <div class="types-right">
      <div class="horizontal-waterfall" v-if="ctypes.length > 0">
        <div v-for="(item, index) in ctypes" :key="index" :style="{ backgroundColor: getColor(index) }" class="item" @click="$router.push({ path: `/poetryList/`, query: { ty: 'type', v: item.typeid, n: item.typename } })">{{ item.typename }}</div>
      </div>
    </div>
  </div>
</template>

<style>
.horizontal-waterfall {
  width: 90%;
  height: 20px; /* 设置统一高度 */
  column-count: auto; /* 自动计算列数 */
  column-gap: 20px; /* 列间距 */
  writing-mode: horizontal-tb; /* 水平排列 */
  padding: 20px;
}

.item {
  break-inside: avoid; /* 避免元素内部断行 */
  display: inline-block; /* 内联块元素 */
  width: auto; /* 宽度自动 */
  height: 100%; /* 高度统一 */
  background-color: #f0f0f0;
  margin-bottom: 10px;
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
  font-size: 16px;
}
.item:hover {
  transform: translateY(-5px); /* 悬停上移效果 */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15); /* 悬停阴影加深 */
  cursor: pointer;
}

.types {
  height: 100%;
  display: flex;
  flex-direction: row;
  background-color: #f8f9fa; /* 设置页面背景色 */
}

.types-left {
  width: 80px; /* 加宽左侧栏 */
  display: flex;
  flex-direction: column;
  gap: 20px; /* 增加间距 */
  overflow-y: auto;
  height: 95vh;
  border-right: 2px solid #e9ecef; /* 右侧边框 */
  padding: 20px; /* 增加内边距 */
  background-color: #ffffff; /* 设置白色背景 */
}

.types-right {
  flex: 1;
  display: flex;
  align-items: flex-start;
  height: 95vh;
  overflow-y: auto;
  justify-content: center;
  margin-top: 25px;
}

.ptype-item {
  height: 35px; /* 增加高度 */
  line-height: 35px; /* 调整行高 */
  text-align: center;
  border-radius: 8px; /* 添加圆角 */
  transition: all 0.2s ease; /* 添加过渡效果 */
}
.ptype-item:hover {
  background-color: #edf6ff; /* 悬停背景色 */
  cursor: pointer;
}
</style>
