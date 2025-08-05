<script setup>
import { ref, reactive } from "vue";
</script>
<template>
  <div class="poems">
    <div class="poems-left">
      <div class="top-bar">
        <input type="text" placeholder="输入标题" class="searche-input" />
        <button>搜索</button>
      </div>
      <div class="poems-left-content"></div>
    </div>
  </div>
</template>

<style>
.poems {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}
.poems-left {
  width: 200px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.top-bar {
  width: 100%;
  height: 30px;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: row;
}
.searche-input {
  width: 100%;
  flex: 1;
  padding: 5px;
}
</style>
