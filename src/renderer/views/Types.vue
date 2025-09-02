<script setup>
import { ref, onMounted, watch, toRaw } from "vue";
import getColor from "../common/colorUtils";
const { ipcRenderer } = window.require("electron");
import { ElMessage } from "element-plus";
import { useAppStore } from "../store/appStore";
import { storeToRefs } from "pinia";
const { curPType } = storeToRefs(useAppStore());
const { setCurPType } = useAppStore();

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
  $router.push({ path: `/poetryList/`, query: { ty: "type", v: item.typeid, n: item.typename } });
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
        <div v-for="(item, index) in ctypes" :key="index" :style="{ backgroundColor: getColor(index) }" class="item" @click="fetchEditType(item)">{{ item.typename }}</div>
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
