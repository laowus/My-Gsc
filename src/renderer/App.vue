<script setup>
import leftMenu from "./components/leftMenu.vue";
</script>

<template>
  <div class="container">
    <leftMenu></leftMenu>
    <div class="content">
      <router-view></router-view>
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
  padding: 20px;
  flex: 1;
}
.item {
  margin-bottom: 20px;
}
</style>
