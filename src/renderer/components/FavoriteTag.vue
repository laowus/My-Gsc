<script setup>
const props = defineProps({
  myType: Number
});

const kinds = ["诗", "词", "曲", "文", "辞"];
</script>

<template>
  <div class="heart">
    <span class="heart-text">{{ kinds[props.myType] }}</span>
  </div>
</template>

<style>
.heart {
  position: relative;
  width: 15px;
  height: 15px;
  background-color: red;
  transform: rotate(-45deg);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white; /* 设置文字颜色 */
  font-size: 12px; /* 设置文字大小 */
  z-index: 1;
}

.heart::before,
.heart::after {
  content: "";
  position: absolute;
  width: 15px;
  height: 15px;
  background-color: red;
  border-radius: 50%;
  z-index: -1;
}

.heart::before {
  top: -8px;
  left: 0;
}

.heart::after {
  left: 8px;
  top: 0;
}
.heart-text {
  transform: rotate(45deg) translateY(-4px);
}
</style>
