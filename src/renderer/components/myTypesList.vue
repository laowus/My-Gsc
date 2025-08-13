<script setup>
import { onMounted, ref, watch } from "vue";
import { useAppStore } from "../store/appStore";
import { storeToRefs } from "pinia";

const { myTypes } = storeToRefs(useAppStore());
const { ipcRenderer } = window.require("electron");

const props = defineProps({
  poetryid: {
    type: Number,
    default: 1
  }
});

const curMtid = ref(0);
const curPoetryid = ref(props.poetryid);

const fetchMy = async () => {
  await ipcRenderer.invoke("db-get-my-by-poetryid", props.poetryid).then((res) => {
    if (res.success && res.data.length > 0) {
      console.log(res.data);
      curMtid.value = res.data[0].mtid;
    } else {
      curMtid.value = 0;
      console.log("未收藏");
    }
  });
};

onMounted(async () => {
  console.log(props.poetryid);
  await fetchMy();
});

watch(
  () => props.poetryid,
  (newVal, oldVal) => {
    console.log(newVal, oldVal);
    if (newVal !== oldVal) {
      fetchMy();
    }
  }
);

const changeMtid = async (v) => {
  try {
    const res = await ipcRenderer.invoke("db-edit-my-by-poetryid", props.poetryid, v);
    if (res.success) {
      console.log("收藏成功");
      fetchMy();
    } else {
      console.log("收藏失败");
    }
  } catch (error) {
    console.error("收藏操作出错:", error);
  }
};
</script>
<template>
  <div class="detail-top-bar">
    <div class="detail-top-left">收藏:</div>
    <el-select placeholder="请选择收藏类型" v-model="curMtid" style="width: 100px" @change="changeMtid">
      <el-option v-for="(item, index) in myTypes" :key="index" :label="item" :value="index" />
    </el-select>
  </div>
</template>

<style>
.detail-top-bar {
  width: 220px;
  font-size: 14px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 10px;
  text-align: right;
  margin-left: auto;
}

.detail-top-left {
  width: 50px;
  text-align: right;
  line-height: 30px;
}
</style>
