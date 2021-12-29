/***
 @author kritsu
 @date 2018/9/22 23:29
 **/
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

export default createRouter({
    history: createWebHistory("/"),

    routes: [
        {
            name: "index",
            path: "/",
            component: () => import("@/views/index.vue")
        },
        {
            name: "character",
            path: "/:id",
            component: () => import("@/views/index.vue")
        }
    ]
})
