/***
 @author kritsu
 @date 2018/9/22 23:29
 **/
import { createRouter, createWebHashHistory } from "vue-router"

import App from "@/views/app.vue"

export default createRouter({
	history: createWebHashHistory("/"),
	routes: [
		{
			name: "index",
			path: "/",
			component: App
		},
		{
			name: "character",
			path: "/:id",
			component: App
		}
	]
})
