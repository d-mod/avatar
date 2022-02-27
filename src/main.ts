// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import { createApp } from "vue"
import { RouterView } from "vue-router"
import router from "@/router"
import components from "@/components"
import store from "@/store"

import "@/assets/style/app.scss"
import "uno.css"

const app = createApp(RouterView)
app.use(router)
app.use(store)
app.use(components)

app.mount("#app")
