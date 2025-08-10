import { createRouter, createWebHashHistory } from "vue-router";
import Writers from "../views/Writers.vue";
import Types from "../views/Types.vue";
import Poems from "../views/Poems.vue";
import My from "../views/My.vue";
import Setting from "../views/Setting.vue";
import PoetryList from "../components/PoetryList.vue";

const routes = [
  {
    //默认
    path: "/poems",
    component: Poems
  },
  {
    path: "/",
    component: Writers
  },
  {
    path: "/types",
    component: Types
  },
  {
    path: "/poems",
    component: Poems
  },
  {
    path: "/my",
    component: My
  },
  {
    path: "/setting",
    component: Setting
  },
  {
    path: "/poetryList",
    component: PoetryList
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
