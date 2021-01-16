import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

let context = require.context("./modules", false, /\.js$/)
const modules = context.keys().map(context).filter(e => !!e)


export default new Vuex.Store({
  modules
})
