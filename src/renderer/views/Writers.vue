<script setup>
import { ref, onMounted, watch } from "vue";
import { DYNASTYS } from "../common/utils";
import Writer from "../model/Writer";
const { ipcRenderer } = window.require("electron");
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
      <div class="dynasty-item" :class="{ dselected: curdid === index }" v-for="(item, index) in DYNASTYS" :key="index" @click="curdid = index">
        {{ item }}
      </div>
    </div>
    <div class="writers-right">
      <div class="horizontal-waterfall" v-if="writers.length > 0">
        <div v-for="(item, index) in writers" :key="index" class="item">
          {{ item.writername }}
        </div>
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
.writers {
  height: 100%;
  display: flex;
  flex-direction: row;
  margin-top: 20px;
}

.writers-left {
  margin-top: 20px;
  width: 100px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.dynasty-item {
  height: 30px;
  line-height: 30px;
  text-align: center;
}

.dselected {
  background-color: #e5e5e5;
}

.writers-right {
  flex: 1;
  height: 90vh;
  overflow-y: auto;
  justify-content: center;
}
</style>
