// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import { createApp } from "vue";
import { RouterView } from "vue-router";
import router from "@/router";

import store from "@/store";
import "uno.css";
import "@/assets/style/app.less";

const appContainer = document.createElement("div");
document.body.appendChild(appContainer);

const app = createApp(RouterView);
app.use(router);
app.use(store);

app.mount(appContainer);
