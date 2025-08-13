<script setup>
import leftMenu from "./components/leftMenu.vue";
import maxMinCancel from "./components/maxMinClose.vue";
</script>

<template>
  <div class="container">
    <leftMenu></leftMenu>
    <div class="content">
      <maxMinCancel></maxMinCancel>
      <router-view v-slot="{ Component }">
        <keep-alive :include="['poetryList', 'my']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<style>
.container {
  display: flex;
  flex-direction: row;
  height: 100vh;
}
.title {
  font-size: 14px;
  font-weight: bold;
  padding: 14px;
}
.content {
  flex: 1;
  position: relative;
}
.item {
  margin-bottom: 20px;
}
</style>
