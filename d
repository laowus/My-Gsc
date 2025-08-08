enderer\main.js
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/styles/reset.css";
import "./assets/styles/global.css";
import "./assets/styles/iconfont/iconfont.css";
import { router } from "./route/router";
import VueVirtualScroller from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import VueLazyLoad from "vue3-lazyload";
import { createPinia } from "pinia";
import piniaPersist from "pinia-plugin-persist";
import { VueMasonryPlugin } from "vue-masonry";

const pinia = createPinia();
pinia.use(piniaPersist);

window.$ = document.querySelector.bind(document);
const app = createApp(App);

app.use(router);
app.use(VueVirtualScroller);
app.use(VueLazyLoad);
app.use(pinia);
// 注册 vue-masonry 插件
app.use(VueMasonryPlugin);

app.mount("#app");