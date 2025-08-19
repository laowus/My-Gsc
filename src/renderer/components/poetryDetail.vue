<script setup>
import { watch, onMounted, ref, onUnmounted } from "vue";
import KindIcon from "./KindIcon.vue";
import Writer from "../model/Writer";
import Poetry from "../model/Poetry";
import myTypesList from "./myTypesList.vue";
import { convertHtml, convertText } from "../common/fun";
const { ipcRenderer } = window.require("electron");
const { shell } = window.require("electron");

const props = defineProps({
  poetryid: {
    type: Number,
    default: 1
  }
});
const curPoetry = ref({});
const curInfoList = ref([]);
const curInfoIndex = ref(0);
const selectedTextToCopy = ref("");

const getPoetryDetail = () => {
  try {
    ipcRenderer.invoke("db-get-poetry-by-id", props.poetryid).then((res) => {
      if (res.success) {
        const data = res.data;
        const writer = new Writer(data.writerid, data.writername, data.dynastyid);
        data.content = convertHtml(data.content);
        curPoetry.value = new Poetry(data.poetryid, data.typeid, data.kindid, writer, data.title, data.content, data.infos);
        if (curPoetry.value) {
          console.log("curPoetry", curPoetry.value);
          getInfoList();
        }
      }
    }); // 使用异步方法
  } catch (error) {
    console.error("获取诗歌数据失败:", error);
  }
};

const getInfoList = () => {
  try {
    ipcRenderer.invoke("db-get-info-list", 1, props.poetryid).then((res) => {
      if (res.success) {
        curInfoList.value = res.data;
      }
    });
  } catch (error) {
    console.error("获取信息列表失败:", error);
  }
};

onMounted(() => {
  getPoetryDetail();
  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("click", handleClick);
});
// 清理事件监听
onUnmounted(() => {
  document.removeEventListener("contextmenu", handleContextMenu);
  document.removeEventListener("click", handleClick);
});

watch(
  () => props.poetryid,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      getPoetryDetail();
      curInfoIndex.value = 0;
    }
  }
);
// 右键菜单状态
const showContextMenu = ref(false);
const menuX = ref(0);
const menuY = ref(0);

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
        alert("复制成功");
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
</script>
<template>
  <div class="poem-detail" v-if="curPoetry">
    <div class="custom-context-menu" v-if="showContextMenu" :style="{ left: menuX + 'px', top: menuY + 'px' }">
      <button @click="copySelectedText">复制</button>
      <button @click="searchBaidu">搜索百度</button>
    </div>
    <myTypesList :poetryid="curPoetry.poetryid"></myTypesList>
    <div class="poem-title">
      {{ curPoetry.title }}
    </div>
    <div class="poem-writer">
      <KindIcon :kindid="curPoetry.kindid" />
      [{{ curPoetry.writer?.dynastyname }}]
      {{ curPoetry.writer?.writername }}
    </div>
    <div class="poem-content" v-html="curPoetry.content"></div>
    <div class="poem-info" v-if="curInfoList.length > 0">
      <div class="poem-info-title">
        <div class="info-item-title" :class="{ 'title-select': curInfoIndex === index }" v-for="(item, index) in curInfoList" :key="item.id" @click="curInfoIndex = index">
          {{ item.title }}
        </div>
      </div>
      <div class="info-content" v-html="convertHtml(curInfoList[curInfoIndex].content)"></div>
    </div>
  </div>
</template>

<style>
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
.poem-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 30px;
  margin: auto;
  user-select: text; /* 允许文本选择 */
  -webkit-user-select: text; /* 兼容WebKit浏览器 */
  -moz-user-select: text; /* 兼容Firefox */
}

.poem-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.poem-writer {
  font-size: 1rem;
  color: #666;
  display: flex;
  flex-direction: row;
}

.poem-content {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #333;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-height: 30vh;
  overflow-y: auto;
  max-width: 100%;
  width: fit-content;
  margin: auto;
}

.poem-info {
  font-size: 1rem;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.poem-info-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: flex;
  flex-direction: row;
  gap: 10px;
}
.info-item-title {
  width: fit-content;
  display: flex;
  align-items: center;
}
.title-select {
  background-color: #4caf50; /* 更改背景颜色为绿色 */
  color: white; /* 文字颜色设为白色 */
  border: none; /* 移除边框 */
  border-radius: 4px; /* 添加圆角 */
  padding: 8px 16px; /* 添加内边距 */
  font-size: 14px; /* 设置字体大小 */
  cursor: pointer; /* 鼠标悬停时显示指针 */
  transition: background-color 0.3s ease; /* 添加背景颜色过渡效果 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
}

.title-select:hover {
  background-color: #45a049; /* 悬停时更改背景颜色 */
}

.title-select:active {
  background-color: #3e8e41; /* 点击时更改背景颜色 */
  transform: translateY(1px); /* 点击时轻微下移 */
}
.info-content {
  font-size: 12px;
  line-height: 1.8;
  color: #333;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 30vh;
}
</style>
