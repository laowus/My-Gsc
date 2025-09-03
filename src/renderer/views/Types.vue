<script setup>
import { ref, onMounted, watch, toRaw } from "vue";
import getColor from "../common/colorUtils";
const { ipcRenderer } = window.require("electron");
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useAppStore } from "../store/appStore";
import { storeToRefs } from "pinia";

const { curPType } = storeToRefs(useAppStore());
const { setCurPType } = useAppStore();
const router = useRouter();
const ptypes = ref([]);
const ctypes = ref([]);
const addDialog = ref(false);
const addType = ref({
  typename: "",
  parentid: curPType.value
});

const editDialog = ref(false);
const editType = ref(null);

const fetchTypes = async () => {
  //获取一级类型(父级)
  await ipcRenderer.invoke("db-get-types-by-pid", 0).then((res) => {
    if (res.success) {
      console.log(res);
      ptypes.value = res.data;
    }
  });
  if (ptypes.value.length > 0) {
    //从store里面获取当前类型的pid
    console.log("当前类型的pid:", curPType.value);
    const res1 = await ipcRenderer.invoke("db-get-types-by-pid", curPType.value);
    console.log("当前类型的子类型:", res1);
    if (res1.success) {
      ctypes.value = res1.data;
    }
  }
};

onMounted(async () => {
  await fetchTypes();
});

watch(curPType, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    await fetchTypes();
    addType.value.parentid = newVal;
  }
});

watch(addDialog, () => {
  if (addDialog.value) {
    console.log("打开addDialog");
    addType.value.parentid = curPType.value;
    console.log("addType.value.parentid:", addType.value.parentid);
  }
});

watch(editDialog, () => {
  if (editDialog.value) {
  }
});

const tyOptions = () => {
  if (ptypes.value.length === 0) {
    return [{ value: 0, label: "顶级" }];
  }

  // 在原有结果前添加顶级选项
  return [
    { value: 0, label: "顶级" },
    ...ptypes.value.map((item) => ({
      value: item.typeid,
      label: item.typename
    }))
  ];
};

const saveAddType = () => {
  if (addType.value.typename === "") {
    ElMessage.error("类型不能为空!");
    return;
  }
  ipcRenderer.invoke("db-add-type", toRaw(addType.value)).then((res) => {
    if (res.success) {
      addDialog.value = false;
      setCurPType(res.parentid);
      fetchTypes();
      console.log(res);
      ElMessage.success("添加成功");
    } else {
      ElMessage.error(res.message);
    }
  });
};

const fetchEditType = (item) => {
  ipcRenderer.invoke("db-get-type-by-id", item.typeid).then((res) => {
    if (res.success) {
      editType.value = res.data;
      console.log(editType.value);
      editDialog.value = true;
    }
  });
};

const saveEditType = () => {
  if (editType.value.typename === "") {
    ElMessage.error("类型不能为空!");
    return;
  }
  ipcRenderer.invoke("db-edit-type", toRaw(editType.value)).then((res) => {
    if (res.success) {
      editDialog.value = false;
      setCurPType(res.parentid);
      fetchTypes();
      console.log(res);
      ElMessage.success("修改成功");
    } else {
      ElMessage.error(res.message);
    }
  });
};

const openNext = (item) => {
  router.push({ path: `/poetryList/`, query: { ty: "type", v: item.typeid, n: item.typename } });
};

const deleteType = (item) => {
  ElMessageBox.confirm(`是否删除[${item.typename}]?`, "删除", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      ipcRenderer.invoke("db-delete-type", item.typeid).then((res) => {
        if (res.success) {
          ElMessage.success("删除成功");
          fetchTypes();
        } else {
          ElMessage.error(res.message);
        }
      });
    })
    .catch(() => {
      console.log("删除取消");
    });
};
</script>
<template>
  <div class="types">
    <el-dialog v-model="addDialog" title="添加类型" width="60%" align-center>
      <el-form label-width="120px">
        <el-form-item label="分类">
          <el-select style="width: 100px; margin-right: 20px" v-model="addType.parentid">
            <el-option v-for="item in tyOptions()" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-model="addType.typename" placeholder="请输入类型名称" style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveAddType"> 添加 </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog v-model="editDialog" title="修改类型" width="60%" align-center>
      <el-form>
        <el-form-item label="分类">
          <el-select style="width: 100px; margin-right: 20px" v-model="editType.parentid">
            <el-option v-for="item in tyOptions()" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-model="editType.typename" style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveEditType">修改 </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <div class="types-left">
      <div class="ptype-item" :class="{ dselected: curPType === item.typeid }" v-for="(item, index) in ptypes" :key="index" :style="{ backgroundColor: getColor(index) }" @click="setCurPType(item.typeid)">{{ item.typename }}</div>
    </div>
    <div class="types-right">
      <button class="icon-btn" @click="addDialog = true">
        <span class="iconfont icon-jia" style="font-size: 30px"></span>
      </button>
      <div class="horizontal-waterfall" v-if="ctypes.length > 0">
        <div v-for="(item, index) in ctypes" :key="index" :style="{ backgroundColor: getColor(index) }" class="type-item">
          <span class="item-name" @click="openNext(item)">{{ item.typename }}</span>
          <div class="item-actions">
            <span class="iconfont icon-xiugai" @click.stop="fetchEditType(item)"></span>
            <span class="iconfont icon-shanchu" @click.stop="deleteType(item)" v-if="item.isdel === 1"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.horizontal-waterfall {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: flex-start;
  padding: 20px;
  width: 90%;
}

.type-item {
  break-inside: avoid;
  display: inline-block;
  width: auto;
  height: 100%;
  background-color: #f0f0f0;
  margin-bottom: 10px;
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
  font-size: 16px;
  position: relative;
}
.type-item:hover .item-actions {
  display: flex;
  gap: 10px;
  cursor: pointer;
}
.icon-xiugai {
  color: #409eff;
  border-color: #b3d8ff;
  background-color: #ecf5ff;
}

.icon-shanchu {
  color: #f56c6c;
  border-color: #fab6b6;
  background-color: #fef0f0;
}

.item-actions span:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  opacity: 1;
}

.icon-xiugai:hover {
  background-color: #d0ebff;
  border-color: #8cc5ff;
}

.icon-shanchu:hover {
  background-color: #fde2e2;
  border-color: #f8a3a3;
}

.item-actions span:hover {
  background-color: white;
  transform: scale(1.1);
}
.item-actions {
  display: none;
  position: absolute;
  right: -15px;
  top: -10px;
}

.item-actions span {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 6px;
  border: 1px solid;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.types {
  height: 100%;
  display: flex;
  flex-direction: row;
  background-color: #f8f9fa; /* 设置页面背景色 */
}

.types-left {
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

.types-right {
  flex: 1;
  display: flex;
  align-items: flex-start;
  height: 95vh;
  overflow-y: auto;
  justify-content: center;
  margin-top: 25px;
}

.ptype-item {
  height: 35px; /* 增加高度 */
  line-height: 35px; /* 调整行高 */
  text-align: center;
  border-radius: 8px; /* 添加圆角 */
  transition: all 0.2s ease; /* 添加过渡效果 */
}
.ptype-item:hover {
  background-color: #edf6ff; /* 悬停背景色 */
  cursor: pointer;
}
</style>
