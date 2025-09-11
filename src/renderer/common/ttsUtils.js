// TTS工具类，封装Web Speech API功能
class TTSService {
  constructor() {
    // 确保单例模式
    if (TTSService.instance) {
      return TTSService.instance;
    }
    TTSService.instance = this;

    // TTS相关状态
    this.isPlaying = false;
    this.synthesis = window.speechSynthesis;
    this.utterance = null;
    this.isReadingInfo = false;
    this.paragraphs = [];
    this.currentParagraphIndex = 0;

    // 回调函数
    this.onPlayStart = null;
    this.onPlayPause = null;
    this.onPlayResume = null;
    this.onPlayStop = null;
    this.onParagraphChange = null;
    this.onError = null;
  }

  // 检查浏览器是否支持Web Speech API
  isTTSSupported() {
    return "speechSynthesis" in window;
  }

  // 获取可用的语音列表
  getVoices() {
    return this.synthesis.getVoices();
  }

  // 设置默认中文语音
  getChineseVoice() {
    const voices = this.getVoices();
    const chineseVoice = voices.find((voice) => voice.lang.includes("zh-CN") || voice.lang.includes("zh"));
    return chineseVoice || voices[0] || null;
  }

  // 按标点符号分割段落
  splitTextIntoParagraphs(text) {
    const regex = /([。！？.!?])/g;
    const parts = text.split(regex);
    const result = [];

    for (let i = 0; i < parts.length; i += 2) {
      if (parts[i] || (i + 1 < parts.length && parts[i + 1])) {
        result.push((parts[i] || "") + (parts[i + 1] || ""));
      }
    }

    return result;
  }

  // 播放TTS
  play(text, options = {}) {
    if (!this.isTTSSupported()) {
      console.warn("您的浏览器不支持文本转语音功能");
      return false;
    }

    // 如果正在播放，则停止
    if (this.isPlaying) {
      this.stop();
      return true;
    }

    // 设置选项
    this.isReadingInfo = options.isReadingInfo || false;

    // 创建语音实例
    this.utterance = new SpeechSynthesisUtterance();
    this.utterance.text = text;

    // 设置语音
    const voice = this.getChineseVoice();
    if (voice) {
      this.utterance.voice = voice;
    }

    // 设置语速和音调
    this.utterance.rate = options.rate || 0.8;
    this.utterance.pitch = options.pitch || 1;
    this.utterance.volume = options.volume || 1;

    // 分割段落
    this.paragraphs = this.splitTextIntoParagraphs(text);
    this.currentParagraphIndex = 0;

    // 设置事件监听
    this.setupUtteranceEvents(options);

    // 开始播放
    this.synthesis.speak(this.utterance);
    this.isPlaying = true;

    // 触发播放开始回调
    if (this.onPlayStart) {
      this.onPlayStart();
    }

    return true;
  }

  // 设置语音事件监听
  setupUtteranceEvents(options) {
    if (!this.utterance) return;

    // 朗读结束事件
    this.utterance.onend = () => {
      this.isPlaying = false;
      if (this.onPlayStop) {
        this.onPlayStop();
      }
    };

    // 错误事件
    this.utterance.onerror = (event) => {
      console.error("TTS播放错误:", event.error);
      this.isPlaying = false;
      if (this.onError) {
        this.onError(event.error);
      }
    };

    // 朗读进度事件
    this.utterance.onboundary = (event) => {
      if (event.name === "word" && this.paragraphs.length > 0) {
        const charIndex = event.charIndex;
        let accumulatedLength = 0;

        for (let i = 0; i < this.paragraphs.length; i++) {
          accumulatedLength += this.paragraphs[i].length;
          if (charIndex < accumulatedLength) {
            if (i !== this.currentParagraphIndex) {
              this.currentParagraphIndex = i;
              if (this.onParagraphChange) {
                this.onParagraphChange(i, this.paragraphs[i]);
              }
            }
            break;
          }
        }
      }
    };
  }

  // 暂停TTS
  pause() {
    if (!this.isTTSSupported() || !this.isPlaying) return;

    this.synthesis.pause();
    if (this.onPlayPause) {
      this.onPlayPause();
    }
  }

  // 继续TTS
  resume() {
    if (!this.isTTSSupported() || !this.isPlaying) return;

    this.synthesis.resume();
    if (this.onPlayResume) {
      this.onPlayResume();
    }
  }

  // 停止TTS
  stop() {
    if (!this.isTTSSupported()) return;
    this.synthesis.cancel();
    this.isPlaying = false;
    if (this.onPlayStop) {
      this.onPlayStop();
    }
  }

  // 朗读上一段
  readPreviousParagraph() {
    if (!this.isTTSSupported() || this.paragraphs.length === 0) return;

    this.stop();
    this.currentParagraphIndex = Math.max(0, this.currentParagraphIndex - 1);
    this.readCurrentParagraph();
  }

  // 朗读下一段
  readNextParagraph() {
    if (!this.isTTSSupported() || this.paragraphs.length === 0) return;

    this.stop();
    this.currentParagraphIndex = Math.min(this.paragraphs.length - 1, this.currentParagraphIndex + 1);
    this.readCurrentParagraph();
  }

  // 朗读当前段
  readCurrentParagraph(options = {}) {
    if (!this.isTTSSupported() || this.paragraphs.length === 0) return;

    const text = this.paragraphs[this.currentParagraphIndex];
    this.play(text, { ...options, shouldContinueAfter: false });
  }

  // 获取文本节点
  getTextNodesIn(element) {
    const textNodes = [];
    const walk = (node) => {
      if (node.nodeType === 3) {
        if (node.textContent.trim().length > 0) {
          textNodes.push(node);
        }
      } else if (node.nodeType === 1 && node.tagName !== "SCRIPT" && node.tagName !== "STYLE") {
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
        }
      }
    };
    walk(element);
    return textNodes;
  }

  // 在文本节点中选择指定范围的文本
  selectTextInNodes(textNodes, startIndex, endIndex) {
    if (!textNodes || textNodes.length === 0 || startIndex >= endIndex) return null;

    let currentIndex = 0;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;

    for (let i = 0; i < textNodes.length; i++) {
      const node = textNodes[i];
      const nodeLength = node.textContent.length;

      if (!startNode && currentIndex + nodeLength > startIndex) {
        startNode = node;
        startOffset = startIndex - currentIndex;
      }

      if (currentIndex + nodeLength >= endIndex) {
        endNode = node;
        endOffset = Math.min(nodeLength, endIndex - currentIndex);
        break;
      }

      currentIndex += nodeLength;
    }

    if (startNode && endNode) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      selection.removeAllRanges();
      selection.addRange(range);
      return range;
    }

    return null;
  }

  // 清除文本选择
  clearSelection() {
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else if (document.selection && document.selection.empty) {
      document.selection.empty();
    }
  }

  // 滚动到元素在容器中的位置
  scrollToElementInContainer(element, container) {
    if (!element || !container) return;

    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
    const relativeBottom = elementRect.bottom - containerRect.top + container.scrollTop;

    if (relativeTop < 0 || relativeBottom > container.clientHeight) {
      container.scrollTo({
        top: relativeTop - container.clientHeight / 3,
        behavior: "smooth"
      });
    }
  }

  // 获取当前TTS状态
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      isReadingInfo: this.isReadingInfo,
      currentParagraphIndex: this.currentParagraphIndex,
      totalParagraphs: this.paragraphs.length,
      currentParagraph: this.paragraphs[this.currentParagraphIndex] || ""
    };
  }
}

// 导出单例实例
export default new TTSService();
