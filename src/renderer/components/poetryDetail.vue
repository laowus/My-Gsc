<script setup>
import { watch, onMounted, ref, onUnmounted } from "vue";
import KindIcon from "./KindIcon.vue";
import Writer from "../model/Writer";
import Poetry from "../model/Poetry";
import myTypesList from "./myTypesList.vue";
import { convertHtml, convertText } from "../common/fun";
import TypeStr from "./TypeStr.vue";
const { ipcRenderer } = window.require("electron");

const props = defineProps({
  poetryid: {
    type: Number,
    default: 1
  }
});
const curPoetry = ref({});
const curInfoList = ref([]);
const curInfoIndex = ref(0);

// TTS相关状态和函数
const isPlaying = ref(false);
const synthesis = window.speechSynthesis;
let utterance = null;
let isReadingInfo = ref(false); // 标记当前是否正在朗读信息内容
let paragraphs = []; // 存储分割后的段落
let currentParagraphIndex = 0; // 当前段落索引

// 检查浏览器是否支持Web Speech API
const isTTSSupported = () => {
  return "speechSynthesis" in window;
};

// 获取可用的语音列表
const getVoices = () => {
  return synthesis.getVoices();
};

// 设置默认中文语音
const getChineseVoice = () => {
  const voices = getVoices();
  // 尝试找到中文语音
  const chineseVoice = voices.find((voice) => voice.lang.includes("zh-CN") || voice.lang.includes("zh"));
  // 如果没有找到中文语音，返回第一个可用语音
  return chineseVoice || voices[0] || null;
};

// 按标点符号分割段落
const splitTextIntoParagraphs = (text) => {
  // 使用正则表达式按句号、问号、感叹号等分割文本
  // 保留分隔符在段落末尾
  const regex = /([。！？.!?])/g;
  const parts = text.split(regex);

  const result = [];
  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i] || (i + 1 < parts.length && parts[i + 1])) {
      result.push((parts[i] || "") + (parts[i + 1] || ""));
    }
  }

  return result;
};

// 播放TTS
const playTTS = () => {
  if (!isTTSSupported()) {
    console.warn("您的浏览器不支持文本转语音功能");
    return;
  }

  // 如果正在播放，则停止
  if (isPlaying.value) {
    stopTTS();
    return;
  }

  // 开始朗读诗歌内容
  isReadingInfo.value = false;
  startReadingPoetryContent();
};

// 开始朗读诗歌内容
const startReadingPoetryContent = () => {
  // 创建语音实例
  utterance = new SpeechSynthesisUtterance();

  // 从HTML内容中提取纯文本
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = curPoetry.value.content || "";
  const contentText = tempDiv.textContent || tempDiv.innerText || "";

  // 设置语音内容
  const fullText = curPoetry.value.title ? `${curPoetry.value.title}。${curPoetry.value.writer.dynastyname} 。${curPoetry.value.writer.writername} 。${contentText}` : contentText;
  utterance.text = fullText;

  // 设置语音
  const voice = getChineseVoice();
  if (voice) {
    utterance.voice = voice;
  }

  // 设置语速和音调
  utterance.rate = 0.8; // 语速，0.1-10
  utterance.pitch = 1; // 音调，0-2
  utterance.volume = 1; // 音量，0-1

  // 分割段落
  paragraphs = splitTextIntoParagraphs(fullText);
  currentParagraphIndex = 0;

  // 设置事件监听
  utterance.onend = () => {
    // 当诗歌内容朗读完毕，检查是否有信息内容需要朗读
    if (curInfoList.value.length > 0 && curInfoList.value[curInfoIndex.value]) {
      // 开始朗读信息内容
      isReadingInfo.value = true;
      startReadingInfoContent();
    } else {
      // 没有信息内容，结束朗读
      isPlaying.value = false;
      clearSelection();
    }
  };

  utterance.onerror = (event) => {
    console.error("TTS播放错误:", event.error);
    isPlaying.value = false;
    clearSelection();
  };

  // 使用onboundary事件获取朗读进度
  utterance.onboundary = (event) => {
    if (event.name === "word" && paragraphs.length > 0) {
      // 获取当前朗读到的文本位置
      const charIndex = event.charIndex;

      // 查找当前应该朗读到的段落
      let accumulatedLength = 0;
      for (let i = 0; i < paragraphs.length; i++) {
        accumulatedLength += paragraphs[i].length;
        if (charIndex < accumulatedLength) {
          if (i !== currentParagraphIndex) {
            currentParagraphIndex = i;
            selectCurrentParagraph();
          }
          break;
        }
      }
    }
  };

  // 开始播放
  synthesis.speak(utterance);
  isPlaying.value = true;

  // 初始化时选择第一段
  if (isPlaying.value && paragraphs.length > 0) {
    selectCurrentParagraph();
  }
};

// 开始朗读信息内容
const startReadingInfoContent = () => {
  // 创建语音实例
  utterance = new SpeechSynthesisUtterance();

  // 从HTML内容中提取纯文本
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = curInfoList.value[curInfoIndex.value]?.content || "";
  const infoText = tempDiv.textContent || tempDiv.innerText || "";

  // 设置语音内容（添加标题以提高可理解性）
  const infoTitle = curInfoList.value[curInfoIndex.value]?.title || "";
  const fullText = infoTitle ? `${infoTitle}。${infoText}` : infoText;
  utterance.text = fullText;

  // 设置语音
  const voice = getChineseVoice();
  if (voice) {
    utterance.voice = voice;
  }

  // 设置语速和音调
  utterance.rate = 0.8;
  utterance.pitch = 1;
  utterance.volume = 1;

  // 分割段落
  paragraphs = splitTextIntoParagraphs(fullText);
  currentParagraphIndex = 0;

  // 设置事件监听
  utterance.onend = () => {
    // 检查是否还有下一个信息项
    if (curInfoIndex.value < curInfoList.value.length - 1) {
      // 切换到下一个信息项
      curInfoIndex.value++;

      // 等待UI更新后再开始朗读下一个内容

      if (isPlaying.value) {
        startReadingInfoContent();
      }
      // 给100毫秒的延迟，确保UI有足够时间更新
    } else {
      // 所有信息内容朗读完毕，结束朗读
      isPlaying.value = false;
      isReadingInfo.value = false;
      clearSelection();
    }
  };

  utterance.onerror = (event) => {
    console.error("TTS播放错误:", event.error);
    isPlaying.value = false;
    isReadingInfo.value = false;
    clearSelection();
  };

  // 使用onboundary事件获取朗读进度
  utterance.onboundary = (event) => {
    if (event.name === "word" && paragraphs.length > 0) {
      // 获取当前朗读到的文本位置
      const charIndex = event.charIndex;

      // 查找当前应该朗读到的段落
      let accumulatedLength = 0;
      for (let i = 0; i < paragraphs.length; i++) {
        accumulatedLength += paragraphs[i].length;
        if (charIndex < accumulatedLength) {
          if (i !== currentParagraphIndex) {
            currentParagraphIndex = i;
            selectCurrentParagraph();
          }
          break;
        }
      }
    }
  };

  // 开始播放
  synthesis.speak(utterance);

  // // 初始化时选择第一段
  // setTimeout(() => {
  //   if (isPlaying.value && paragraphs.length > 0) {
  //     selectCurrentParagraph();
  //   }
  // }, 100);
};

// 停止TTS
const stopTTS = () => {
  if (!isTTSSupported()) return;

  synthesis.cancel();
  isPlaying.value = false;
  isReadingInfo.value = false;
  clearSelection();
};

// 清除文本选择
const clearSelection = () => {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection && document.selection.empty) {
    document.selection.empty();
  }
};

// 选择当前段落
const selectCurrentParagraph = () => {
  // 根据当前朗读的内容类型选择不同的元素
  let targetElement;
  let fullText;
  let targetParagraph = paragraphs[currentParagraphIndex];

  if (isReadingInfo.value) {
    // 朗读信息内容
    targetElement = document.querySelector(".info-content");

    // 获取完整的信息内容文本
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = curInfoList.value[curInfoIndex.value]?.content || "";
    const infoText = tempDiv.textContent || tempDiv.innerText || "";
    const infoTitle = curInfoList.value[curInfoIndex.value]?.title || "";
    fullText = infoTitle ? `${infoTitle}。${infoText}` : infoText;
  } else {
    // 朗读诗歌内容
    targetElement = document.querySelector(".poem-content");

    // 获取完整的诗歌内容文本(包括标题)
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = curPoetry.value.content || "";
    const contentText = tempDiv.textContent || tempDiv.innerText || "";
    fullText = curPoetry.value.title ? `${curPoetry.value.title}。${contentText}` : contentText;
  }

  if (!targetElement || currentParagraphIndex >= paragraphs.length) return;

  // 找到段落在完整文本中的位置
  const startIndex = fullText.indexOf(targetParagraph);
  if (startIndex === -1) return;

  // 获取对应区域的文本节点
  const textNodes = getTextNodesIn(targetElement);

  // 计算在内容中的相对位置（如果是诗歌内容，不包括标题）
  let contentStartIndex = startIndex;
  let contentEndIndex = Math.min(startIndex + targetParagraph.length, fullText.length);

  if (!isReadingInfo.value && curPoetry.value.title) {
    // 对于诗歌内容，减去标题长度
    const titleEndIndex = curPoetry.value.title.length + 1; // +1 是句号的长度
    if (startIndex >= titleEndIndex) {
      contentStartIndex = startIndex - titleEndIndex;
      contentEndIndex = contentStartIndex + targetParagraph.length;
    }
  }

  // 在对应的内容中创建选区
  selectTextInNodes(textNodes, contentStartIndex, contentEndIndex);
};

// 在文本节点中选择指定范围的文本
const selectTextInNodes = (textNodes, startIndex, endIndex) => {
  if (!textNodes || textNodes.length === 0 || startIndex >= endIndex) return;

  let currentIndex = 0;
  let startNode = null;
  let startOffset = 0;
  let endNode = null;
  let endOffset = 0;

  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    const nodeLength = node.textContent.length;

    // 找到开始的节点和偏移量
    if (!startNode && currentIndex + nodeLength > startIndex) {
      startNode = node;
      startOffset = startIndex - currentIndex;
    }

    // 找到结束的节点和偏移量
    if (currentIndex + nodeLength >= endIndex) {
      endNode = node;
      endOffset = Math.min(nodeLength, endIndex - currentIndex);
      break;
    }

    currentIndex += nodeLength;
  }

  // 创建选区并选中文本
  if (startNode && endNode) {
    const selection = window.getSelection();
    const range = document.createRange();

    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);

    selection.removeAllRanges();
    selection.addRange(range);

    // 精确控制内容区域滚动，避免影响父节点
    const scrollToElementInContainer = (element) => {
      // 获取当前选区的矩形信息
      const rangeRect = range.getBoundingClientRect();

      // 查找包含滚动条的特定内容区域
      const poemContent = document.querySelector(".poem-content");
      const infoContent = document.querySelector(".info-content");
      let targetContainer = null;

      // 确定元素属于哪个可滚动容器
      if (poemContent && poemContent.contains(element)) {
        targetContainer = poemContent;
      } else if (infoContent && infoContent.contains(element)) {
        targetContainer = infoContent;
      }

      if (targetContainer && targetContainer.scrollHeight > targetContainer.clientHeight) {
        const containerRect = targetContainer.getBoundingClientRect();

        // 计算元素在容器内的相对位置
        const relativeTop = rangeRect.top - containerRect.top + targetContainer.scrollTop;
        const relativeBottom = rangeRect.bottom - containerRect.top + targetContainer.scrollTop;

        // 只在元素不完全在可视区域时才滚动
        if (relativeTop < 0 || relativeBottom > targetContainer.clientHeight) {
          // 平滑滚动到元素位置，使元素在容器中居中
          targetContainer.scrollTo({
            top: relativeTop - targetContainer.clientHeight / 3,
            behavior: "smooth"
          });
        }
      }
    };

    // 滚动到选区位置，但只影响内容容器
    scrollToElementInContainer(range.startContainer.parentNode);
  }
};

// 获取元素内所有文本节点
const getTextNodesIn = (element) => {
  const textNodes = [];

  const walk = (node) => {
    if (node.nodeType === 3) {
      // 文本节点
      if (node.textContent.trim().length > 0) {
        // 只处理非空文本节点
        textNodes.push(node);
      }
    } else if (node.nodeType === 1 && node.tagName !== "SCRIPT" && node.tagName !== "STYLE") {
      // 遍历子节点
      for (let i = 0; i < node.childNodes.length; i++) {
        walk(node.childNodes[i]);
      }
    }
  };

  walk(element);
  return textNodes;
};

// 组件卸载时停止播放
onUnmounted(() => {
  stopTTS();
});

const getPoetryDetail = () => {
  try {
    ipcRenderer.invoke("db-get-poetry-by-id", props.poetryid).then((res) => {
      if (res.success) {
        const data = res.data;
        console.log("db-get-poetry-by-id", data);

        const writer = new Writer(data.writerid, data.writername, data.dynastyid);
        data.content = convertHtml(data.content);
        curPoetry.value = new Poetry(data.poetryid, data.typeid, data.kindid, writer, data.title, data.content, data.infos, data.isdel);

        if (curPoetry.value) {
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
});

watch(
  () => props.poetryid,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      // 切换诗词时停止当前播放
      stopTTS();
      getPoetryDetail();
      curInfoIndex.value = 0;
    }
  }
);
</script>
<template>
  <div class="poem-detail" v-if="curPoetry">
    <myTypesList :poetry="curPoetry"></myTypesList>
    <div class="poem-title">
      {{ curPoetry.title }}
      <!-- TTS按钮 -->
      <button v-if="isTTSSupported()" class="tts-button" :class="{ 'tts-playing': isPlaying }" @click="playTTS" title="朗读诗词">
        <i class="tts-icon">{{ isPlaying ? "⏸️" : "🔊" }}</i>
        <span class="tts-text">{{ isPlaying ? "暂停" : "朗读" }}</span>
      </button>
    </div>
    <div class="poem-writer">
      <div class="poem-writer-left">
        <KindIcon :kindid="curPoetry.kindid" />
        [{{ curPoetry.writer?.dynastyname }}]
        {{ curPoetry.writer?.writername }}
      </div>
      <TypeStr :typeid="curPoetry.typeid" />
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
.poem-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  margin: auto;
}

.poem-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

/* TTS按钮样式 */
.tts-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  min-width: 70px;
}

.tts-button:hover {
  background-color: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.tts-button:active {
  transform: translateY(0);
}

.tts-button.tts-playing {
  background-color: #f44336;
}

.tts-button.tts-playing:hover {
  background-color: #d32f2f;
}

.tts-icon {
  font-size: 16px;
}

.tts-text {
  font-size: 12px;
}

.poem-writer-left {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.poem-writer {
  font-size: 1rem;
  color: #666;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.poem-content {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #333;
  padding: 10px;
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

/* 添加高亮文本样式 */
.highlighted-text {
  background-color: #ffeb3b; /* 黄色背景 */
  color: #333; /* 文字颜色 */
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
  animation: highlight-pulse 1s infinite;
}

/* 添加高亮动画效果 */
@keyframes highlight-pulse {
  0% {
    background-color: #ffeb3b;
  }
  50% {
    background-color: #ffc107;
  }
  100% {
    background-color: #ffeb3b;
  }
}
</style>
