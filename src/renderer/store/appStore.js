import { defineStore } from "pinia";

export const useAppStore = defineStore("appStore", {
  state: () => ({
    //当前选中的索引
    curIndex: 0,
    keyword: ""
  }),
  getters: {},
  actions: {
    setCurIndex(index) {
      this.curIndex = index;
    },
    setKeyword(keyword) {
      this.keyword = keyword;
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ["curIndex", "keyword"]
      }
    ]
  }
});
