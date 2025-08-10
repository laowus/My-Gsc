<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

const index = ref(1);
const menuList = ref([
  {
    name: "诗词",
    icon: "icon-huitu-poem",
    path: "/poems"
  },
  {
    name: "诗人",
    icon: "icon-shiren1",
    path: "/"
  },
  {
    name: "分类",
    icon: "icon-fenlei",
    path: "/types"
  },
  {
    name: "设置",
    icon: "icon-shezhi",
    path: "/setting"
  },
  {
    name: "我的",
    icon: "icon-wodedangxuan",
    path: "/my"
  }
]);

const menuClick = (idx) => {
  console.log("menuList[idx].path:", menuList.value[idx].path); // 添加日志，检查路径
  if (menuList.value[idx] && menuList.value[idx].path) {
    index.value = idx;
    router.push(menuList.value[idx].path);
  } else {
    console.error("路径未定义");
  }
};
</script>

<template>
  <div class="menu">
    <img id="logo" src="../assets/logo.png" />
    <button v-for="(item, idx) in menuList" :key="idx" class="btn-icon" @click="menuClick(idx)" :title="item.name">
      <span class="iconfont" :class="item.icon + (idx === index ? ' selected' : '')"></span>
    </button>
  </div>
</template>

<style>
#logo {
  width: 40px;
  height: 40px;
  margin: 0 auto;
}

.btn-icon {
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: transparent;
  color: #fff;
}
.menu .iconfont {
  font-size: 20px;
}
.menu {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  width: 60px;
  height: 100%;
  background-color: #2e2e2e;
  gap: 40px;
}
.selected {
  color: lightgreen;
  font-size: 28px !important;
  font-weight: bold;
}
</style>
