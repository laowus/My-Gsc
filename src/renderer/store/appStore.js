import { defineStore } from "pinia";

export const useAppStore = defineStore("appStore", {
  state: () => ({
    //当前选中的索引
    curIndex: 0,
    keyword: "",
    curRhIndex: 0,
    rhkeyword: "",
    myTypes: ["未收藏", "唐诗", "宋词", "元曲", "文言文", "喜欢", "推荐"],
    start: 0,
    lastAddPoetry: { writerid: 1, typeid: "11", kindid: 1, title: "", content: "" },
    writer_did: 7
  }),
  getters: {},
  actions: {
    setCurIndex(index) {
      this.curIndex = index;
    },
    setKeyword(keyword) {
      this.keyword = keyword;
    },
    setCurRhIndex(index) {
      this.curRhIndex = index;
    },
    setRhkeyword(keyword) {
      this.rhkeyword = keyword;
    },
    setMyTypes(myTypes) {
      this.myTypes = myTypes;
    },
    setStart(start) {
      this.start = start;
    },
    setLastAddPoetry(poetry) {
      this.lastAddPoetry = poetry;
    },
    setWriter_did(did) {
      console.log("store改变朝代", did);
      this.writer_did = did;
    },

    clearAppState() {
      // 重置为初始状态
      this.$reset();
      // 清除持久化存储
      localStorage.removeItem("appStore");
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ["curIndex", "keyword", "curRhIndex", "rhkeyword", "myTypes", "start", "lastAddPoetry", "writer_did"]
      }
    ]
  }
});
