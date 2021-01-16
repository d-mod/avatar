// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import app from './views'
import router from './router'
import store from './store'
import MuseUI from 'muse-ui'
import MuseUILoading from 'muse-ui-loading'
import MuseUIToast from 'muse-ui-toast'
import MuseUIMessage from 'muse-ui-message'
import "material-icons/iconfont/material-icons.css"
import "muse-ui/dist/muse-ui.css"
import 'muse-ui-loading/dist/muse-ui-loading.css'
import "muse-ui-toast/dist/muse-ui-toast.all.css"
import 'muse-ui-message/dist/muse-ui-message.css'
import './style'
import './axios.config'

Vue.use(MuseUI)
Vue.use(MuseUILoading)
Vue.use(MuseUIToast)
Vue.use(MuseUIMessage)

Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
    router,
    store,
    render: $ => $(app)
}).$mount("#app")
