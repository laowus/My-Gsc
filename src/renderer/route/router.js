import { createRouter, createWebHashHistory } from "vue-router";
import Writers from "../views/Writers.vue";
import Types from "../views/Types.vue";
import Poems from "../views/Poems.vue";
import My from "../views/My.vue";
import Setting from "../views/Setting.vue";
import PoetryList from "../components/PoetryList.vue";
import writerDetail from "../components/writerDetail.vue";
import Rhesis from "../views/Rhesis.vue";

const routes = [
  {
    name: "首页",
    path: "/",
    component: Rhesis
  },
  {
    name: "诗词",
    path: "/poems",
    component: Poems
  },
  {
    name: "诗人",
    path: "/writers",
    component: Writers
  },
  {
    name: "分类",
    path: "/types",
    component: Types
  },
  {
    name: "名句",
    path: "/rhesis",
    component: Rhesis
  },
  {
    name: "我的",
    path: "/my",
    component: My
  },
  {
    name: "设置",
    path: "/setting",
    component: Setting
  },
  {
    path: "/poetryList",
    component: PoetryList
  },
  {
    name: "作者详情",
    path: "/writerDetail/:id",

    component: writerDetail
  }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  console.log("路由跳转：从", from.path, "到", to.path);
  next();
});
