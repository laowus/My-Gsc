<script setup>
import { onMounted, ref, watch } from "vue";
import { useAppStore } from "../store/appStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import EventBus from "../common/EventBus";
const router = useRouter();
const { myTypes } = storeToRefs(useAppStore());
const { ipcRenderer } = window.require("electron");

const props = defineProps({
  poetry: {
    type: Object,
    default: () => null
  }
});

const curMtid = ref(0);

const fetchMy = async () => {
  await ipcRenderer.invoke("db-get-my-by-poetryid", props.poetry.poetryid || 1).then((res) => {
    console.log(res);

    if (res.success && res.data.length > 0) {
      curMtid.value = res.data[0].mtid;
    } else {
      curMtid.value = 0;
    }
  });
};

onMounted(async () => {
  console.log("myTypesList,", props.poetry);
  await fetchMy();
});

watch(
  () => props.poetry.poetryid,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      console.log("myTypesList,", props.poetry);
      fetchMy();
    }
  }
);

const changeMtid = async (v) => {
  try {
    const res = await ipcRenderer.invoke("db-edit-my-by-poetryid", props.poetry.poetryid, v);
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
const editPoetry = () => {
  router.push({
    path: "/editPoetry/" + props.poetry.poetryid
  });
};

const delPoetry = async () => {
  ElMessageBox.confirm(`是否删除[${props.poetry.title}]?`, "删除", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        const res = await ipcRenderer.invoke("db-del-poetry", props.poetry.poetryid);

        if (res.success) {
          console.log("删除成功");
          //怎么强制刷新父父组件
          EventBus.emit("refreshPoetryList", "delete");
        } else {
          console.log("删除失败");
        }
      } catch (error) {
        console.error("删除操作出错:", error);
      }
    })
    .catch(() => {
      console.log("删除取消");
    });
};
</script>
<template>
  <div class="detail-top-bar">
    <i class="iconfont icon-shanchu" title="删除" @click="delPoetry" v-if="props.poetry.isdel != 0"></i>
    <i class="iconfont icon-xiugai" title="编辑" @click="editPoetry"></i>
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
  gap: 20px;
  text-align: right;
  margin-left: auto;
  align-items: center;
}
.iconfont {
  cursor: pointer;
}

.detail-top-left {
  width: 50px;
  text-align: right;
  line-height: 30px;
}
</style>
