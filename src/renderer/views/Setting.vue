<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useAppStore } from "../store/appStore";
import { storeToRefs } from "pinia";
const { ipcRenderer } = window.require("electron");
const { myTypes } = storeToRefs(useAppStore());
const { setMyTypes, clearAppState } = useAppStore();

const mtStr = ref("");
const curIndex = ref(0);

// 数据备份相关状态
const databaseInfo = ref(null);
const loading = ref(false);
const backupLoading = ref(false);

const initMyTypes = () => {
  mtStr.value = myTypes.value.join(",");
};

const changeTab = (index) => {
  curIndex.value = index;
  if (index === 1) {
    // 切换到数据备份标签页时加载数据库信息
    loadDatabaseInfo();
  }
};

const saveMyTypes = () => {
  const newMyTypes = mtStr.value.split(",");
  setMyTypes(newMyTypes);
  initMyTypes();
  ElMessage.success("收藏类型已更新");
};

// 加载数据库信息
const loadDatabaseInfo = () => {
  loading.value = true;
  ipcRenderer.once("get-database-info-reply", (event, data) => {
    loading.value = false;
    console.log("data", data);
    if (data.success) {
      databaseInfo.value = data.info;
    } else {
      ElMessage.error(data.message || "获取数据库信息失败");
    }
  });
  ipcRenderer.send("get-database-info");
};

// 执行数据库备份
const backupDatabase = () => {
  backupLoading.value = true;
  // 监听数据库信息回复

  ipcRenderer.once("backup-database-reply", (data) => {
    backupLoading.value = false;
    if (data.success) {
      ElMessage.success(data.message || "数据库备份成功");
      // 备份成功后重新加载数据库信息
      loadDatabaseInfo();
    } else {
      ElMessage.error(data.message || "数据库备份失败");
    }
  });

  ipcRenderer.send("backup-database");
};

onMounted(() => {
  initMyTypes();
});
</script>

<template>
  <div class="setting">
    <div class="setting-tabs">
      <div class="tabname" @click="changeTab(0)" :class="{ active: curIndex === 0 }">收藏类型</div>
      <div class="tabname" @click="changeTab(1)" :class="{ active: curIndex === 1 }">数据备份</div>
    </div>
    <div class="setting-right">
      <!-- 收藏类型设置 -->
      <div class="myTypes" v-if="curIndex === 0">
        <div>
          <el-input v-model="mtStr" style="width: 300px" />
          <el-button type="success" @click="saveMyTypes">修改</el-button>
        </div>
        <div class="tip-title">备注: 用逗号( , 非 ， )隔开，例如: 诗词, 散文,随笔，第一个未收藏，不要删除，后面的可以修改。</div>
      </div>

      <!-- 数据备份功能 -->
      <div v-if="curIndex === 1" class="backup-container">
        <h3>数据库备份</h3>

        <!-- 数据库信息展示 -->
        <div class="database-info" v-if="databaseInfo">
          <div class="info-item">
            <span class="label">数据库路径:</span>
            <span class="value">{{ databaseInfo.path }}</span>
          </div>
          <div class="info-item">
            <span class="label">文件大小:</span>
            <span class="value">{{ databaseInfo.size }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间:</span>
            <span class="value">{{ new Date(databaseInfo.createTime).toLocaleString() }}</span>
          </div>
          <div class="info-item">
            <span class="label">最后修改:</span>
            <span class="value">{{ new Date(databaseInfo.modifyTime).toLocaleString() }}</span>
          </div>
        </div>

        <div class="backup-actions">
          <el-button type="primary" @click="backupDatabase" :loading="backupLoading" :disabled="loading">
            {{ backupLoading ? "备份中..." : "立即备份" }}
          </el-button>

          <el-button @click="loadDatabaseInfo" :loading="loading" :disabled="backupLoading">
            {{ loading ? "加载中..." : "刷新信息" }}
          </el-button>
        </div>

        <div class="backup-tip">
          <el-alert title="备份说明" type="info" :closable="false" description="点击'立即备份'按钮将创建当前数据库的完整备份。备份文件将保存在您选择的位置，文件名包含当前日期和时间戳。" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.setting {
  display: flex;
  flex-direction: row;
  background-color: #f5f5f5;
}

.setting-tabs {
  padding-top: 50px;
  width: 100px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  height: 99vh;
  align-items: center;
  gap: 10px;
}

.tabname {
  font-size: 14px;
  width: 100px;
  height: 40px;
  align-items: center;
  justify-content: center;
  display: flex;
  cursor: pointer;
}

.tabname.active {
  background-color: #87ceeb;
}

.setting-right {
  padding-top: 50px;
  flex: 1;
  padding-left: 20px;
}

.myTypes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 20px;
}

.myTypes div {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.tip-title {
  font-size: 12px;
  color: #999;
}

/* 数据备份样式 */
.backup-container {
  padding: 20px;
  max-width: 600px;
}

.backup-container h3 {
  margin-bottom: 20px;
  color: #333;
}

.database-info {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
}

.info-item .label {
  font-weight: bold;
  color: #495057;
  min-width: 100px;
}

.info-item .value {
  color: #6c757d;
  word-break: break-all;
}

.backup-actions {
  margin-bottom: 20px;
}

.backup-tip {
  margin-top: 20px;
}
</style>
