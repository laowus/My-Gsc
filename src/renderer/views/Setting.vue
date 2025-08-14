<script setup>
import { ref, reactive, onMounted } from "vue";

import { useAppStore } from "../store/appStore";
import { storeToRefs } from "pinia";

const { myTypes } = storeToRefs(useAppStore());
const { setMyTypes } = useAppStore();

const mtStr = ref("");

const curIndex = ref(0);
const initMyTypes = () => {
  mtStr.value = myTypes.value.join(",");
};

onMounted(() => {
  initMyTypes();
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
      <div class="tabname" @click="changeTab(1)" :class="{ active: curIndex === 1 }">数据备份</div>
    </div>
    <div class="setting-right">
      <div class="myTypes" v-if="curIndex === 0">
        <div>
          <el-input v-model="mtStr" style="width: 300px" />
          <el-button type="success" @click="saveMyTypes">修改</el-button>
        </div>
        <div class="tip-title">备注: 用逗号( , 非 ， )隔开，例如: 诗词, 散文,随笔，第一个未收藏，不要删除，后面的可以修改。</div>
      </div>
      <div v-if="curIndex === 1">数据备份</div>
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
</style>
