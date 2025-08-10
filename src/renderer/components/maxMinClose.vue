<script setup>
import { onMounted, ref, computed } from "vue";
const { ipcRenderer } = window.require("electron");

const isTop = ref(false);

const handleClose = () => {
  ipcRenderer.send("window-close");
};
const handleMax = () => {
  ipcRenderer.send("window-max");
};
const handleMix = () => {
  ipcRenderer.send("window-min");
};

const handleTop = () => {
  ipcRenderer.send("window-top", !isTop.value);
  isTop.value = !isTop.value;
};

onMounted(() => {
  const isTp = ipcRenderer.sendSync("isTop");
  console.log(isTp);
  isTop.value = isTp;
});

// 新增计算属性
const topClass = computed(() => {
  return isTop.value ? { isTop: true } : { noTop: true };
});
</script>
<template>
  <div class="bar">
    <div class="drag"></div>
    <div class="maxMinClose">
      <button title="置顶">
        <span @click="handleTop" class="iconfont icon-zhiding" :class="topClass" title="置顶"></span>
      </button>
      <button title="最小化">
        <span @click="handleMix" class="iconfont icon-iczoomout2" title="最小化"></span>
      </button>
      <button title="最大化">
        <span class="iconfont icon-zuidahua_huaban1" @click="handleMax"></span>
      </button>
      <button title="关闭">
        <span class="iconfont icon-guanbi" @click="handleClose" title="关闭"></span>
      </button>
    </div>
  </div>
</template>
<style>
.bar {
  display: flex;
  flex-direction: row;
  height: 30px;
  width: 90vh;
  position: absolute; /* 设置绝对定位 */
  top: 0; /* 距离顶部 0 像素 */
  right: 0; /* 距离右侧 0 像素 */
  z-index: 999;
  margin-left: 20px; /* 添加左边距，可根据需求调整数值 */
}
.drag {
  flex: 1;
  height: 30px;
  user-select: none;
  -webkit-app-region: drag;
  -webkit-user-select: none;
}
.maxMinClose {
  display: flex;
  flex-direction: row;
  gap: 15px;
  padding-right: 10px;
}
.maxMinClose button {
  width: 20px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
}
.isTop {
  color: #000;
}

.noTop {
  color: #ccc;
}
</style>
