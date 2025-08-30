<script setup>
import { onMounted, ref, toRaw } from "vue";
import { storeToRefs } from "pinia";
import { DYNASTYS } from "../common/utils";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit, DocumentAdd } from "@element-plus/icons-vue";
const { ipcRenderer } = window.require("electron");
import Writer from "../model/Writer";
import TxtEditor from "../components/TxtEditor.vue";
import { convertHtml, convertText } from "../common/fun";
const route = useRoute();
const router = useRouter();
const curWriterid = ref(route.params.id);
const curWriter = ref(null);
const curInfoList = ref([]);
const curInfoIndex = ref(0);
const curInfo = ref(null);
const getDefaultInfo = () => {
  return {
    title: "诗人简介标题",
    content: "诗人简介内容"
  };
};
const curAddInfo = ref(getDefaultInfo());

const editDialog = ref(false);
const addDialog = ref(false);

const fetchWriter = async () => {
  try {
    ipcRenderer.invoke("db-get-writer-by-id", curWriterid.value).then((res) => {
      if (res.success) {
        const data = res.data;
        console.log(data);
        curWriter.value = new Writer(data.writerid, data.writername, data.dynastyid, data.summary, [], data.isdel);
        if (curWriter.value) {
          getInfoList();
        }
      }
    }); // 使用异步方
  } catch (error) {
    console.error("获取作者数据失败:", error);
  }
};

onMounted(() => {
  fetchWriter();
});
const dyOptions = () => {
  // 从索引1开始截取数组，并映射为目标格式
  return DYNASTYS.slice(1).map((item, index) => ({
    value: index + 1,
    label: item.trim() // 去除可能存在的空格（如"宋朝 "→"宋朝"
  }));
};
const goBack = () => {
  router.go(-1);
};

const editWriter = () => {
  if (curWriter.value.writername.trim() === "" || curWriter.value.summary.trim() === "") {
    ElMessage.error("请输入作者姓名和简介不能为空");
    return;
  }

  ipcRenderer.invoke("db-edit-writer", toRaw(curWriter.value)).then((res) => {
    if (res.success) {
      ElMessage.success("修改成功");
    } else {
      ElMessage.error("修改失败");
    }
  });
};

const getInfoList = () => {
  try {
    ipcRenderer.invoke("db-get-info-list", 0, curWriterid.value).then((res) => {
      if (res.success) {
        curInfoList.value = res.data;
        if (curInfoList.value.length > 0) {
          curInfo.value = curInfoList.value[0];
          curInfoIndex.value = 0;
        }
      }
    });
  } catch (error) {
    console.error("获取信息列表失败:", error);
  }
};

const setCurIndex = (index) => {
  curInfoIndex.value = index;
  if (curInfoList.value.length > 0) {
    curInfo.value = curInfoList.value[index];
  }
};

const editInfo = () => {
  //info
  if (curInfoIndex.value >= 0) {
    editDialog.value = true;
    console.log(curInfoList.value[curInfoIndex.value]);
  }
};
const addInfo = () => {
  addDialog.value = true;
};
const delInfo = () => {
  if (curInfo.value) {
    ElMessageBox.confirm(`是否删除[${curInfo.value.title}]?`, "删除", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        ipcRenderer.invoke("db-del-info", curInfo.value.infoid).then((res) => {
          if (res.success) {
            ElMessage.success("删除成功");
            getInfoList();
          } else {
            ElMessage.error("删除失败");
          }
          editDialog.value = false;
        });
      })
      .catch(() => {
        console.log("删除取消");
      });
  }
};
const saveInfo = () => {
  if (curInfo.value) {
    console.log("saveInfo", toRaw(curInfo.value));
    if (curInfo.value.title.trim() == "" || curInfo.value.content.trim() == "") {
      ElMessage.error("标题和内容不能为空");
      return;
    }
    ipcRenderer.invoke("db-edit-info", toRaw(curInfo.value)).then((res) => {
      if (res.success) {
        ElMessage.success("修改成功");
      } else {
        ElMessage.error("修改失败");
      }
      editDialog.value = false;
    });
  }
};
const addSaveInfo = () => {
  if (curAddInfo.value.title.trim() == "" || curAddInfo.value.content.trim() == "") {
    ElMessage.error("标题和内容不能为空");
    return;
  }
  curAddInfo.value.fid = curWriterid.value;
  curAddInfo.value.cateid = 0;
  console.log("addSaveInfo", toRaw(curAddInfo.value));
  ipcRenderer.invoke("db-add-info", toRaw(curAddInfo.value)).then((res) => {
    if (res.success) {
      ElMessage.success("添加成功");
      curAddInfo.value = getDefaultInfo();
      getInfoList();
    } else {
      ElMessage.error("添加失败");
    }
    addDialog.value = false;
  });
};
</script>
<template>
  <el-dialog v-model="editDialog" title="编辑信息" width="80%" align-center>
    <el-form label-width="120px" v-if="curInfo">
      <el-form-item label="标题">
        <el-input v-model="curInfo.title" style="width: 200px; margin-right: 10px"></el-input>
      </el-form-item>
      <el-form-item label="内容">
        <TxtEditor v-model:content="curInfo.content" :height="200" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveInfo"> 修改 </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <el-dialog v-model="addDialog" title="添加信息" width="80%" align-center>
    <el-form label-width="120px">
      <el-form-item label="标题">
        <el-input v-model="curAddInfo.title" style="width: 200px; margin-right: 10px"></el-input>
      </el-form-item>
      <el-form-item label="内容">
        <TxtEditor v-model:content="curAddInfo.content" :height="200" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addSaveInfo"> 添加 </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <div class="edit-writer">
    <div class="ctr-bar1">
      <div class="return" @click="goBack">
        <i class="iconfont icon-fanhui"></i>
      </div>
    </div>
    <el-form label-width="120px" v-if="curWriter">
      <el-form-item label="朝代">
        <el-select v-model="curWriter.dynastyid" style="width: 100px; margin-right: 20px"> <el-option v-for="item in dyOptions()" :key="item.value" :label="item.label" :value="item.value" /> </el-select><el-button type="primary" @click="editWriter"> 修改 </el-button>
      </el-form-item>
      <el-form-item label="名字">
        <el-input v-model="curWriter.writername" style="width: 200px; margin-right: 10px"></el-input>
      </el-form-item>
      <el-form-item label="简介">
        <TxtEditor v-model:content="curWriter.summary" :height="200" />
      </el-form-item>
      <el-form-item label="信息">
        <div class="poem-info">
          <div class="poem-info-title" style="justify-content: space-between">
            <div class="left-title">
              <div class="info-item-title" :class="{ 'title-select': curInfoIndex === index }" v-for="(item, index) in curInfoList" :key="item.id" @click="setCurIndex(index)">
                {{ item.title }}
              </div>
            </div>

            <div class="ctrl-btn">
              <el-button type="info" title="添加信息" :icon="DocumentAdd" circle @click="addInfo" />
              <el-button type="primary" title="编辑信息" :icon="Edit" circle @click="editInfo" />
              <el-button type="danger" title="删除信息" :icon="Delete" circle @click="delInfo" />
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item v-if="curInfoList.length > 0">
        <div class="info-content" v-html="convertHtml(curInfo.content)"></div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style>
.ctr-bar1 {
  position: fixed;
  top: 0;
  left: 80px;
  z-index: 999;
}

.edit-writer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 30px;
  margin: auto;
}
</style>
