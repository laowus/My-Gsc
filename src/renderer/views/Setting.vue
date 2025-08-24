<script setup>
import { ref, reactive, onMounted } from "vue";

import { useAppStore } from "../store/appStore";
import { storeToRefs } from "pinia";

const { myTypes } = storeToRefs(useAppStore());
const { setMyTypes, clearAppState } = useAppStore();

const mtStr = ref("");

const curIndex = ref(0);
// 新增：缓存数据相关变量
const cacheData = ref(null);
const cacheLoaded = ref(false);

const initMyTypes = () => {
  mtStr.value = myTypes.value.join(",");
};
// 新增：加载缓存数据
const loadCacheData = () => {
  try {
    const rawData = localStorage.getItem("appStore");
    cacheData.value = rawData ? JSON.parse(rawData) : null;
    cacheLoaded.value = true;
  } catch (e) {
    console.error("解析缓存数据失败:", e);
    cacheData.value = "缓存数据格式错误";
  }
};
onMounted(() => {
  initMyTypes();
  loadCacheData();
});

const changeTab = (index) => {
  curIndex.value = index;
};

const saveMyTypes = () => {
  const newMyTypes = mtStr.value.split(",");
  setMyTypes(newMyTypes);
  initMyTypes();
};
</script>
<template>
  <div class="setting">
    <div class="setting-tabs">
      <div class="tabname" @click="changeTab(0)" :class="{ active: curIndex === 0 }">收藏类型</div>
      <div class="tabname" @click="changeTab(1)" :class="{ active: curIndex === 1 }">初始化数据</div>
    </div>
    <div class="setting-right">
      <div class="myTypes" v-if="curIndex === 0">
        <div>
          <el-input v-model="mtStr" style="width: 300px" />
          <el-button type="success" @click="saveMyTypes">修改</el-button>
        </div>
        <div class="tip-title">备注: 用逗号( , 非 ， )隔开，例如: 诗词, 散文,随笔，第一个未收藏，不要删除，后面的可以修改。</div>
      </div>
      <div v-if="curIndex === 1">
        <!-- 新增：缓存数据显示区域 -->
        <div class="cache-data-container">
          <div v-if="!cacheLoaded">加载中...</div>
          <div v-if="cacheData">
            <pre class="cache-json"
              >{{ JSON.stringify(cacheData, null, 2) }}
          </pre
            >
            <el-button type="danger" @click="clearAppState">初始化</el-button>
          </div>
          <div v-else>
            <div>无缓存数据</div>
          </div>
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

/* 新增：缓存数据样式 */
.cache-data-container {
  padding: 20px;
}
.cache-json {
  margin-top: 10px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 400px;
  font-family: monospace;
}
</style>
