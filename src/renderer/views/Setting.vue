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
const restoreLoading = ref(false);
const aboutTabIndex = ref(0);

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
// 新增：切换关于页面的子tab
const changeAboutTab = (index) => {
  aboutTabIndex.value = index;
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

  ipcRenderer.once("backup-database-reply", (event, data) => {
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

// 执行数据库还原
const restoreDatabase = () => {
  restoreLoading.value = true;

  ipcRenderer.once("restore-database-reply", (event, data) => {
    restoreLoading.value = false;
    if (data.success) {
      ElMessage.success(data.message || "数据库还原成功");
      // 还原成功后，提示用户重启应用程序
      setTimeout(() => {
        if (confirm("数据库已还原成功，是否立即重启应用程序？")) {
          ipcRenderer.send("restart-app");
        }
      }, 1000);
    } else {
      ElMessage.error(data.message || "数据库还原失败");
    }
  });

  ipcRenderer.send("restore-database");
};

onMounted(() => {
  initMyTypes();
});

const formatFileSize = (size) => {
  if (!size) return "0 MB";

  // 将字节转换为MB（1MB = 1024 * 1024字节）
  const mbSize = (size / (1024 * 1024)).toFixed(2);
  return `${mbSize} MB`;
};
</script>

<template>
  <div class="setting">
    <div class="setting-tabs">
      <div class="tabname" @click="changeTab(0)" :class="{ active: curIndex === 0 }">关于</div>
      <div class="tabname" @click="changeTab(1)" :class="{ active: curIndex === 1 }">收藏类型</div>
      <div class="tabname" @click="changeTab(2)" :class="{ active: curIndex === 2 }">数据备份</div>
    </div>
    <div class="setting-right">
      <!-- 关于 -->
      <div v-if="curIndex === 0" class="about">
        <!-- 关于页面的子tab -->
        <div class="about-tabs">
          <div class="about-tab" @click="changeAboutTab(0)" :class="{ active: aboutTabIndex === 0 }">软件介绍</div>
          <div class="about-tab" @click="changeAboutTab(1)" :class="{ active: aboutTabIndex === 1 }">捐赠支持</div>
        </div>
        <div v-if="aboutTabIndex === 0" class="about-content">
          <div class="app-info">
            <h2>古诗词赏析</h2>
            <p class="version">版本: 1.0.0</p>
            <p class="author">作者: 黄老五</p>
            <div class="app-description">
              <h3>软件介绍</h3>
              <p>古诗词赏析是一款专注于中国古典诗词的学习与欣赏工具。我们精心收录了从先秦到清代的经典诗词作品， 提供详细的注释、译文和赏析，帮助用户深入理解诗词的意境和文化内涵。</p>

              <h3>主要功能</h3>
              <ul>
                <li>📚 丰富的诗词库：涵盖唐诗宋词等各个朝代的经典作品</li>
                <li>🔍 智能搜索：支持按作者、标题、内容等多种方式检索</li>
                <li>🎯 个性化收藏：自定义收藏分类，打造专属诗词库</li>
                <li>🗣️ 语音朗读：支持文本转语音，聆听诗词之美</li>
                <li>💾 数据管理：完整的数据备份与恢复功能</li>
              </ul>

              <h3>联系我们</h3>
              <p>邮箱：pjhxl@qq.com <br />Q Q：37156760 <br />QQ群：616712461(技术交流) 434503062(古诗词交流)<br /></p>
            </div>
          </div>
        </div>
        <div v-if="aboutTabIndex === 1" class="donation-content">
          <h2>支持我们</h2>
          <p class="donation-description">古诗词赏析是一款完全免费的应用程序，致力于传承和弘扬中华优秀传统文化。 如果您喜欢我的应用，欢迎通过以下方式支持我们，这将帮助我持续改进和添加更多优质内容。</p>
          <div class="donation-methods">
            <div class="donation-item">
              <img src="../assets/images/weichat.jpg" width="200" />
            </div>

            <div class="donation-item">
              <img src="../assets/images/alipay.jpg" width="200" />
            </div>
          </div>
        </div>
      </div>
      <!-- 收藏类型设置 -->
      <div class="myTypes" v-if="curIndex === 1">
        <div>
          <el-input v-model="mtStr" style="width: 300px" />
          <el-button type="success" @click="saveMyTypes">修改</el-button>
        </div>
        <div class="tip-title">备注: 用逗号( , 非 ， )隔开，例如: 诗词, 散文,随笔，第一个未收藏，不要删除，后面的可以修改。</div>
      </div>

      <!-- 数据备份功能 -->
      <div class="backup-container" v-if="curIndex === 2">
        <h3>数据库管理</h3>

        <!-- 数据库信息展示 -->
        <div class="database-info" v-if="databaseInfo">
          <div class="info-item">
            <span class="label">数据库路径:</span>
            <span class="value">{{ databaseInfo.path }}</span>
          </div>
          <div class="info-item">
            <span class="label">文件大小:</span>
            <span class="value">{{ formatFileSize(databaseInfo.size) }}</span>
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

          <el-button type="warning" @click="restoreDatabase" :loading="restoreLoading" :disabled="loading || backupLoading">
            {{ restoreLoading ? "还原中..." : "从备份还原" }}
          </el-button>

          <el-button @click="loadDatabaseInfo" :loading="loading" :disabled="backupLoading || restoreLoading">
            {{ loading ? "加载中..." : "刷新信息" }}
          </el-button>
        </div>

        <div class="backup-tip">
          <el-alert title="备份说明" type="info" :closable="false" description="点击'立即备份'按钮将创建当前数据库的完整备份。备份文件将保存在您选择的位置，文件名包含当前日期和时间戳。" />
          <el-alert title="还原说明" type="warning" :closable="false" description="点击'从备份还原'按钮将从您选择的备份文件恢复数据库。还原操作将覆盖当前所有数据，还原后需要重启应用程序才能生效。" style="margin-top: 10px" />
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
} /* 关于页面的子tab样式 */
.about-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #e4e7ed;
}

.about-tab {
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.about-tab:hover {
  color: #409eff;
}

.about-tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

/* 软件介绍样式 */
.about-content,
.donation-content {
  max-width: 600px;
  display: flex;
  flex-direction: column;
}

.app-info h2 {
  color: #303133;
  margin-bottom: 20px;
}

.version,
.author,
.email {
  margin: 5px 0;
  color: #606266;
}

.app-description {
  margin-top: 30px;
}

.app-description h3 {
  color: #303133;
  margin: 20px 0 10px 0;
}

.app-description ul {
  margin: 10px 0;
  padding-left: 20px;
}

.app-description li {
  margin: 8px 0;
  color: #606266;
}

/* 捐赠支持样式 */
.donation-info h2 {
  color: #303133;
  margin-bottom: 20px;
}

.donation-description {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 50px;
}

.donation-methods {
  display: flex;
  flex-direction: row;
  gap: 30px;
  width: 90%;
  justify-content: space-between;
  align-items: center;
}

.donation-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  width: 50%;
}

.donation-item h3 {
  color: #303133;
  margin-bottom: 10px;
}

.donation-item p {
  color: #606266;
  margin-bottom: 15px;
}
</style>
