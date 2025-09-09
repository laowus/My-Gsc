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
  isTop.value = !isTop.value;
  ipcRenderer.send("window-top", isTop.value);
};

onMounted(() => {
  // 获取初始置顶状态
  try {
    const isTp = ipcRenderer.sendSync("isTop");
    isTop.value = isTp;
  } catch (error) {
    console.error("获取置顶状态失败:", error);
    isTop.value = false;
  }
});
// 计算属性：根据置顶状态返回对应的类名和标题
const topButtonInfo = computed(() => {
  return {
    class: isTop.value ? "isTop" : "noTop",
    title: isTop.value ? "取消置顶" : "置顶"
  };
});
</script>
<template>
  <div class="bar">
    <div class="drag"></div>
    <div class="maxMinClose">
      <button :title="topButtonInfo.title" @click="handleTop">
        <span class="iconfont icon-zhiding" :class="topButtonInfo.class"></span>
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
  width: 80vh;
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
