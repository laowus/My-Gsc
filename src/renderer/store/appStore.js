import { defineStore } from "pinia";

export const useAppStore = defineStore("appStore", {
  state: () => ({
    //当前选中的索引
    curIndex: 0
  }),
  getters: {},
  actions: {
    setCurIndex(index) {
      this.curIndex = index;
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ["curIndex"]
      }
    ]
  }
});
