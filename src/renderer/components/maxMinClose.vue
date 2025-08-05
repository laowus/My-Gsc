<script setup>
const { ipcRenderer } = window.require("electron");
const handleClose = () => {
  ipcRenderer.send("window-close");
};
const handleMax = () => {
  ipcRenderer.send("window-max");
};
const handleMix = () => {
  ipcRenderer.send("window-min");
};
</script>
<template>
  <div class="bar">
    <div class="drag"></div>
    <div class="maxMinClose">
      <button>
        <span class="iconfont icon-iczoomout2" @click="handleMix"></span>
      </button>
      <button>
        <span class="iconfont icon-zuidahua_huaban1" @click="handleMax"></span>
      </button>
      <button>
        <span class="iconfont icon-guanbi" @click="handleClose"></span>
      </button>
    </div>
  </div>
</template>
<style>
.bar {
  display: flex;
  flex-direction: row;
  height: 30px;
  width: 100%;
  background: #f5f5f5;
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
  gap: 10px;
  padding-right: 10px;
}
.maxMinClose button {
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
}
</style>
