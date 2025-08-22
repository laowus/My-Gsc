<script setup>
import { onMounted, ref } from "vue";

const { ipcRenderer } = window.require("electron");
const props = defineProps({
  typeid: {
    type: String,
    default: ""
  }
});

const typeNames = ref([]);

const fetchNames = () => {
  console.log("Fetching names for typeids:", props.typeid);
  ipcRenderer.invoke("db-get-types-in-ids", props.typeid).then((res) => {
    if (res.success) {
      typeNames.value = res.data;
    }
  });
};

onMounted(() => {
  fetchNames();
});
</script>
<template>
  <div class="type-container">
    <div v-if="typeNames.length > 0">
      <div v-for="item in typeNames" :key="item.typeid" class="type-item">
        {{ item.typename }}
      </div>
    </div>
  </div>
</template>
<style scoped>
.type-container {
  padding: 8px;
  max-width: 600px;
  white-space: nowrap;
  overflow-x: auto;
}

.type-item {
  padding: 6px 8px;
  margin-bottom: 8px;
  margin-right: 8px;
  display: inline-block;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #333333;
  font-size: 12px;
  transition: all 0.3s ease;
}

.type-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
</style>
