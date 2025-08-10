<script setup>
import { ref, onMounted, watch } from "vue";
import getColor from "../common/colorUtils";
const { ipcRenderer } = window.require("electron");
const ptypes = ref([]);
const ctypes = ref([]);
const curpid = ref(0);
const getTypes = () => {
  ipcRenderer.invoke("db-get-types-by-pid", 0).then((res) => {
    if (res.success) {
      console.log(res.data);
      ptypes.value = res.data;
      console.log(ptypes.value.length);
    }
  });
};

onMounted(() => {
  getTypes();
});
</script>
<template>
  <div class="types">
    <div class="types-left">
      <div class="ptype-item" :class="{ dselected: curpid === index }" v-for="(item, index) in ptypes" :key="index" :style="{ backgroundColor: getColor(index) }" @click="getTypesByPid(item.typeid)">{{ item.typename }}</div>
    </div>
    <div class="types-right"></div>
  </div>
</template>

<style>
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
