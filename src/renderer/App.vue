<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import leftMenu from "./components/leftMenu.vue";
import maxMinCancel from "./components/maxMinClose.vue";
import EventBus from "./common/EventBus";
import Popovers from "./components/Popovers.vue";
const { shell } = window.require("electron");
// 右键菜单状态
const showContextMenu = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const selectedTextToCopy = ref("");

// 修改右键菜单处理函数
const handleContextMenu = (e) => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    e.preventDefault();
    // 保存选中文本
    selectedTextToCopy.value = selectedText;
    showContextMenu.value = true;
    menuX.value = e.clientX;
    menuY.value = e.clientY;
  } else {
    showContextMenu.value = false;
    selectedTextToCopy.value = "";
  }
};
// 点击其他区域关闭菜单
const handleClick = () => {
  showContextMenu.value = false;
};

// 修改复制函数使用保存的文本
const copySelectedText = () => {
  if (selectedTextToCopy.value) {
    navigator.clipboard
      .writeText(selectedTextToCopy.value)
      .then(() => {
        console.log("复制的文本:", selectedTextToCopy.value);
        showContextMenu.value = false;
        selectedTextToCopy.value = "";
        // 添加复制成功提示
        ElMessage.success("复制成功");
      })
      .catch((err) => {
        console.error("复制失败:", err);
      });
  }
};

// 百度搜索选中文本
const searchBaidu = () => {
  if (selectedTextToCopy.value) {
    // 对搜索文本进行URL编码
    const encodedText = encodeURIComponent(selectedTextToCopy.value);
    // 构建百度搜索URL
    const searchUrl = `https://www.baidu.com/s?wd=${encodedText}`;
    // 使用系统默认浏览器打开搜索链接
    shell.openExternal(searchUrl).catch((err) => {
      console.error("打开浏览器失败:", err);
    });
    // 关闭右键菜单并清空选中的文本
    showContextMenu.value = false;
    selectedTextToCopy.value = "";
  }
};

onMounted(() => {
  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("click", handleClick);
});

onUnmounted(() => {
  document.removeEventListener("contextmenu", handleContextMenu);
  document.removeEventListener("click", handleClick);
});
</script>

<template>
  <div class="container">
    <Popovers @click.stop></Popovers>
    <div class="custom-context-menu" v-if="showContextMenu" :style="{ left: menuX + 'px', top: menuY + 'px' }">
      <button @click="copySelectedText">复制</button>
      <button @click="searchBaidu">搜索百度</button>
    </div>
    <leftMenu></leftMenu>
    <div class="content">
      <maxMinCancel></maxMinCancel>
      <router-view v-slot="{ Component }">
        <keep-alive :include="['poetryList', 'my']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<style>
.container {
  display: flex;
  flex-direction: row;
  height: 100vh;
  user-select: text; /* 允许文本选择 */
  -webkit-user-select: text; /* 兼容WebKit浏览器 */
  -moz-user-select: text; /* 兼容Firefox */
}
.title {
  font-size: 14px;
  font-weight: bold;
  padding: 14px;
}
.content {
  flex: 1;
  position: relative;
}
.item {
  margin-bottom: 20px;
}

.custom-context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 5px 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  display: flex; /* 添加flex布局 */
  flex-direction: column; /* 垂直排列按钮 */
}

.custom-context-menu button {
  display: block;
  width: 100%;
  padding: 8px 16px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  /* 添加按钮间距 */
  margin: 2px 0;
}

.custom-context-menu button:hover {
  background-color: #f5f5f5;
}
</style>
