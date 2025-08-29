<script setup>
import { onMounted, ref, toRaw } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit, DocumentAdd } from "@element-plus/icons-vue";
const route = useRoute();
const router = useRouter();
const curWriterid = ref(route.params.id);

const goBack = () => {
  router.go(-1);
};
</script>
<template>
  <div class="edit-writer">
    <div class="writer-title">
      <div class="return" @click="goBack">
        <i class="iconfont icon-fanhui"></i>
      </div>
      <div>编辑作者</div>
    </div>
  </div>
</template>

<style>
.edit-writer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 30px;
  margin: auto;
}
</style>
