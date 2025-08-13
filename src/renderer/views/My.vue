<script setup>
import { ref, onMounted } from "vue";
import { useAppStore } from "../store/appStore";
import { storeToRefs } from "pinia";
const { ipcRenderer } = window.require("electron");
const { myTypes } = storeToRefs(useAppStore());

const curMyList = ref(null);

const fetchMyList = async () => {
  await ipcRenderer.invoke("db-get-my-list").then((res) => {
    console.log(res.data);
    curMyList.value = res.data;
  });
};

onMounted(async () => {
  await fetchMyList();
});

const countPid = (mtid) => {
  // 获取curMyList 里面 item.mtid
  const pids = curMyList.value.filter((item) => item.mtid === mtid);
  console.log(pids);

  // 若没有则是0
  return `共收藏${pids.length || 0}首, [${pids}]`;
};
</script>
<template>
  <div>
    <h1>我的收藏</h1>
    <ul>
      <li v-for="(item, index) in myTypes" :key="index">
        <div if="index>0">{{ item }} - {{ countPid(index) }}</div>
      </li>
    </ul>
  </div>
</template>

<style></style>
