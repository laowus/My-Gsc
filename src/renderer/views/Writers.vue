<script setup>
import { ref, onMounted, watch, toRaw, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { DYNASTYS } from "../common/utils";
import Writer from "../model/Writer";
import { useRouter } from "vue-router";
import { useAppStore } from "../store/appStore";
import getColor from "../common/colorUtils";
import TxtEditor from "../components/TxtEditor.vue";
import { ElMessage } from "element-plus";
import EventBus from "../common/EventBus";
const { writer_did } = storeToRefs(useAppStore());
const { setWriter_did } = useAppStore();
const { ipcRenderer } = window.require("electron");

const router = useRouter();
const addDialog = ref(false);
const _writer = {
  writername: "",
  dynastyid: writer_did.value,
  summary: ""
};
const curWriter = ref(_writer);

const curdid = ref(writer_did.value);
const writers = ref([]);
const dynastyRefs = ref([]);

const getWriters = async () => {
  try {
    await ipcRenderer.invoke("db-get-writers-by-did", curdid.value).then((res) => {
      if (res.success) {
        console.log(res.data);
        writers.value = res.data.map((item) => {
          return new Writer(item.writerid, item.writername, item.dynastyid, item.summary);
        });
        setWriter_did(curdid.value);
        console.log(writers.value.length);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
onMounted(async () => {
  await getWriters();
  nextTick(() => {
    const targetEl = dynastyRefs.value[curdid.value];
    if (targetEl) targetEl.scrollIntoView({ block: "center" });
  });
});

// watch(curdid, async () => {
//   console.log("改变朝代", curdid.value);
//   await getWriters();
// });
// 监听 curdid 变化，滚动到对应项
watch(curdid, async (newVal) => {
  // 确保 DOM 已更新
  await getWriters();
  nextTick(() => {
    const targetEl = dynastyRefs.value[newVal];
    if (targetEl) {
      // 平滑滚动到目标元素，垂直居中对齐
      targetEl.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  });
});
const dyOptions = () => {
  // 从索引1开始截取数组，并映射为目标格式
  return DYNASTYS.slice(1).map((item, index) => ({
    value: index + 1,
    label: item.trim() // 去除可能存在的空格（如"宋朝 "→"宋朝"
  }));
};
watch(addDialog, () => {
  if (addDialog.value) {
    //显示弹出框 添加诗歌 获取朝代id
    curWriter.value = {
      writername: "",
      dynastyid: writer_did.value,
      summary: ""
    };
  }
});

const addWriter = () => {
  if (curWriter.value.writername === "" || curWriter.value.summary === "") {
    ElMessage.error("请输入作者名和内容");
    return;
  }
  console.log(toRaw(curWriter.value));
  ipcRenderer.invoke("db-add-writer", toRaw(curWriter.value)).then((res) => {
    if (res.success) {
      ElMessage.success("添加成功");
      addDialog.value = false;
      curdid.value = curWriter.value.dynastyid;
      getWriters();
    }
  });
};

EventBus.on("refetchWriters", () => {
  getWriters();
});
</script>
<template>
  <div class="writers">
    <el-dialog v-model="addDialog" title="添加作者" width="80%" align-center>
      <el-form label-width="120px">
        <el-form-item label="朝代">
          <el-select v-model="curWriter.dynastyid" style="width: 100px; margin-right: 20px">
            <el-option v-for="item in dyOptions()" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="名字">
          <el-input v-model="curWriter.writername" style="width: 200px; margin-right: 10px"></el-input>
        </el-form-item>
        <el-form-item label="简介">
          <TxtEditor v-model:content="curWriter.summary" :height="250" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addWriter"> 添加 </el-button>
          <el-button @click="addDialog = false"> 取消 </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <div class="writers-left">
      <div class="dynasty-item" :class="{ dselected: curdid === index }" :style="{ backgroundColor: getColor(index) }" v-for="(item, index) in DYNASTYS" :key="index" @click="curdid = index" :ref="(el) => (dynastyRefs[index] = el)">
        {{ item }}
      </div>
    </div>
    <div class="writers-right">
      <button class="icon-btn" @click="addDialog = true">
        <span class="iconfont icon-jia" style="font-size: 30px"></span>
      </button>
      <div class="horizontal-waterfall" v-if="writers.length > 0">
        <div v-for="(item, index) in writers" :key="index" :style="{ backgroundColor: getColor(index) }" class="item" @click="router.push({ path: `/writerDetail/${item.writerid}` })">{{ item.writername }}</div>
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
