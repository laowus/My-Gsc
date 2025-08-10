<script setup>
import { ref, onMounted, watch } from "vue";
import { DYNASTYS } from "../common/utils";
import Writer from "../model/Writer";
const { ipcRenderer } = window.require("electron");
import { useRouter } from "vue-router";
import getColor from "../common/colorUtils";
const router = useRouter();

const curdid = ref(8);
const writers = ref([]);
const getWriters = async () => {
  try {
    await ipcRenderer.invoke("db-get-writers-by-did", curdid.value).then((res) => {
      if (res.success) {
        console.log(res.data);
        writers.value = res.data.map((item) => {
          return new Writer(item.writerid, item.writername, item.dynastyid, item.summary);
        });
        console.log(writers.value.length);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
onMounted(async () => {
  await getWriters();
});

watch(curdid, async () => {
  await getWriters();
});
</script>
<template>
  <div class="writers">
    <div class="writers-left">
      <div class="dynasty-item" :class="{ dselected: curdid === index }" :style="{ backgroundColor: getColor(index) }" v-for="(item, index) in DYNASTYS" :key="index" @click="curdid = index">
        {{ item }}
      </div>
    </div>
    <div class="writers-right">
      <div class="horizontal-waterfall" v-if="writers.length > 0">
        <div v-for="(item, index) in writers" :key="index" :style="{ backgroundColor: getColor(index) }" class="item" @click="router.push({ path: `/poetryList/`, query: { ty: 'writer', v: item.writerid } })">{{ item.writername }}</div>
      </div>
    </div>
  </div>
</template>

<style>
.horizontal-waterfall {
  width: 90%;
  height: 20px; /* 设置统一高度 */
  column-count: auto; /* 自动计算列数 */
  column-gap: 20px; /* 列间距 */
  writing-mode: horizontal-tb; /* 水平排列 */
  padding: 20px;
}

.item {
  break-inside: avoid; /* 避免元素内部断行 */
  display: inline-block; /* 内联块元素 */
  width: auto; /* 宽度自动 */
  height: 100%; /* 高度统一 */
  background-color: #f0f0f0;
  margin-bottom: 10px;
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
  font-size: 16px;
}
.item:hover {
  transform: translateY(-5px); /* 悬停上移效果 */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15); /* 悬停阴影加深 */
  cursor: pointer;
}
.writers {
  height: 100%;
  display: flex;
  flex-direction: row;
  background-color: #f8f9fa; /* 设置页面背景色 */
}

.writers-left {
  width: 80px; /* 加宽左侧栏 */
  display: flex;
  flex-direction: column;
  gap: 20px; /* 增加间距 */
  overflow-y: auto;
  height: 95vh;
  border-right: 2px solid #e9ecef; /* 右侧边框 */
  padding: 20px; /* 增加内边距 */
  background-color: #ffffff; /* 设置白色背景 */
}

.writers-right {
  flex: 1;
  display: flex;
  align-items: flex-start;
  height: 95vh;
  overflow-y: auto;
  justify-content: center;
  margin-top: 25px;
}
.dynasty-item {
  height: 35px; /* 增加高度 */
  line-height: 35px; /* 调整行高 */
  text-align: center;
  border-radius: 8px; /* 添加圆角 */
  transition: all 0.2s ease; /* 添加过渡效果 */
}
.dynasty-item:hover {
  background-color: #f1f3f5; /* 悬停背景色 */
  cursor: pointer;
}
.dselected {
  background-color: #dee2e6;
  font-weight: bold;
  box-shadow: 0 0 0 2px #007bff; /* 添加蓝色边框高亮效果 */
  font-size: large;
}
</style>
