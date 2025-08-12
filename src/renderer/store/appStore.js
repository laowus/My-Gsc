import { defineStore } from "pinia";

export const useAppStore = defineStore("appStore", {
  state: () => ({
    //当前选中的索引
    curIndex: 0,
    keyword: "",
    curRhIndex: 0,
    rhkeyword: ""
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
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ["curIndex", "keyword", "curRhIndex", "rhkeyword"]
      }
    ]
  }
});
