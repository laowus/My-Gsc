<script setup>
import { watch, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Writer from "../model/Writer";
import { ElMessage, ElMessageBox } from "element-plus";
const { ipcRenderer } = window.require("electron");
import EventBus from "../common/EventBus";
const route = useRoute();
const router = useRouter();

const curWriterid = ref(route.params.id); // 直接使用路由参数的 id
const curWriter = ref(null);
const curInfoList = ref([]);
const curInfoIndex = ref(0);

const getInfoList = () => {
  try {
    ipcRenderer.invoke("db-get-info-list", 0, curWriterid.value).then((res) => {
      if (res.success) {
        curInfoList.value = res.data;
      }
    });
  } catch (error) {
    console.error("获取信息列表失败:", error);
  }
};
const fetchWriter = async () => {
  if (curWriterid.value) {
    ipcRenderer.invoke("db-get-writer-by-id", curWriterid.value).then((res) => {
      console.log(res.data.isdel);
      if (res.data) {
        curWriter.value = new Writer(res.data.writerid, res.data.writername, res.data.dynastyid, res.data.summary, [], res.data.isdel);
        console.log(curWriter.value);

        if (curWriter.value) {
          getInfoList();
        }
      }
    });
  }
};

onMounted(() => {
  fetchWriter();
});

watch(
  () => curWriterid.value,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      fetchWriter();
      curInfoIndex.value = 0;
    }
  }
);

const goBack = () => {
  router.back();
};

const delWriter = () => {
  ElMessageBox.confirm(`是否删除[${curWriter.value.writername}]?`, "删除", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      ipcRenderer.invoke("db-del-writer", curWriter.value.writerid).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          EventBus.emit("refetchWriters");
          router.back();
        }
      });
    })
    .catch(() => {
      console.log("删除取消");
    });
};

const editWriter = () => {
  router.push({
    path: "/editWriter/" + curWriter.value.writerid
  });
};
</script>
<template>
  <div class="writer-detail" v-if="curWriter">
    <div class="writer-title">
      <div class="return" @click="goBack">
        <i class="iconfont icon-fanhui"></i>
      </div>
      <div>{{ curWriter.writername }} [{{ curWriter.dynastyname }}]</div>
      <div class="writer-ctr">
        <div class="ctr-bar">
          <i class="iconfont icon-shanchu" title="删除" @click="delWriter" v-if="curWriter.isdel != 0"></i>
          <i class="iconfont icon-xiugai" title="编辑" @click="editWriter"></i>
        </div>
        <div class="ta-poetry" @click="router.push({ path: `/poetryList/`, query: { ty: 'writer', v: curWriter.writerid, n: curWriter.writername } })">TA的作品</div>
      </div>
    </div>
    <div class="writer-content" v-html="curWriter.summary"></div>
    <div class="writer-info" v-if="curInfoList.length > 0">
      <div class="writer-info-title">
        <div class="info-item-title" :class="{ 'title-select': curInfoIndex === index }" v-for="(item, index) in curInfoList" :key="item.id" @click="curInfoIndex = index">
          {{ item.title }}
        </div>
      </div>
      <div class="info-content" v-html="curInfoList[curInfoIndex].content"></div>
    </div>
  </div>
</template>

<style>
.writer-ctr {
  display: flex;
  flex-direction: row;
  gap: 20px;
}
.ctr-bar {
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-items: center;
  align-items: center;
}

.writer-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 30px;
  margin: auto;
}

.writer-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.ta-poetry {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.writer-writer {
  font-size: 1rem;
  color: #666;
  display: flex;
  flex-direction: row;
}
.writer-content {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #333;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-height: 30vh;
  overflow-y: auto;
  max-width: 100%;
  width: fit-content;
  margin: auto;
}
.writer-info {
  font-size: 1rem;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.writer-info-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: flex;
  flex-direction: row;
  gap: 10px;
}
.info-item-title {
  width: fit-content;
  display: flex;
  align-items: center;
}
.title-select {
  background-color: #4caf50; /* 更改背景颜色为绿色 */
  color: white; /* 文字颜色设为白色 */
  border: none; /* 移除边框 */
  border-radius: 4px; /* 添加圆角 */
  padding: 8px 16px; /* 添加内边距 */
  font-size: 14px; /* 设置字体大小 */
  cursor: pointer; /* 鼠标悬停时显示指针 */
  transition: background-color 0.3s ease; /* 添加背景颜色过渡效果 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
}

.title-select:hover {
  background-color: #45a049; /* 悬停时更改背景颜色 */
}

.title-select:active {
  background-color: #3e8e41; /* 点击时更改背景颜色 */
  transform: translateY(1px); /* 点击时轻微下移 */
}
.info-content {
  font-size: 12px;
  line-height: 1.8;
  color: #333;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 30vh;
}
</style>
