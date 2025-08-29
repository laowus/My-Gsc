import { createRouter, createWebHashHistory } from "vue-router";
import { storeToRefs } from "pinia";
import { useAppStore } from "../store/appStore";
import { VIEWS } from "../common/utils.js";
import PoetryList from "../components/PoetryList.vue";
import writerDetail from "../components/writerDetail.vue";
import editPoetry from "../components/editPoetry.vue";
import editWriter from "../components/editWriter.vue";

const routes = [
  {
    name: "首页",
    path: "/",
    component: () => {
      const { start } = storeToRefs(useAppStore());
      return VIEWS[start.value];
    }
  },
  {
    name: "诗词",
    path: "/poems",
    component: VIEWS[0]
  },
  {
    name: "诗人",
    path: "/writers",
    component: VIEWS[1]
  },
  {
    name: "分类",
    path: "/types",
    component: VIEWS[2]
  },
  {
    name: "名句",
    path: "/rhesis",
    component: VIEWS[3]
  },
  {
    name: "我的",
    path: "/my",
    component: VIEWS[4]
  },
  {
    name: "设置",
    path: "/setting",
    component: VIEWS[5]
  },
  {
    path: "/poetryList",
    component: PoetryList,
    props: (route) => ({ params: route.query })
  },
  {
    name: "作者详情",
    path: "/writerDetail/:id",
    component: writerDetail
  },

  {
    name: "编辑诗词",
    path: "/editPoetry/:id",
    component: editPoetry
  },

  {
    name: "编辑作者",
    path: "/editWriter/:id",
    component: editWriter
  }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  next();
});
