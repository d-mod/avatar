/***
 @author chizuki
 @date 2018/9/22 23:29
 **/
import { createRouter, createWebHistory } from "vue-router";

import App from "@/pages/app.vue";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: "character",
      path: "/:id?",
      component: App
    }
  ]
});
