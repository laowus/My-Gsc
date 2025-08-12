<script setup>
const props = defineProps({
  kindid: Number
});

const kinds = ["诗", "词", "曲", "文", "辞"];
</script>

<template>
  <div :class="['poetry-type-icon', `type-${props.kindid}`]">
    <span>{{ kinds[props.kindid - 1] }}</span>
  </div>
</template>

<style scoped>
.poetry-type-icon {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  margin-right: 10px;
}

.type-1 {
  background-color: #ff6666; /* 诗的颜色，加深 */
}

.type-2 {
  background-color: #66b366; /* 词的颜色，加深 */
}

.type-3 {
  background-color: #6666ff; /* 曲的颜色，加深 */
}

.type-4 {
  background-color: #ff9933; /* 文的颜色，加深 */
}
.type-5 {
  background-color: #000000; /* 辞的颜色，加深 */
}
</style>
