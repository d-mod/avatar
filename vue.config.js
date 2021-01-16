const path = require("path")
const proxy = require("./proxy.config")

module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  filenameHashing: false,
  outputDir: "dist",
  assetsDir: "static",
  devServer: {
    port: 81,
    proxy
  },
  chainWebpack(config) {
    config.resolve.alias.set("vue$", "vue/dist/vue.esm.js")
    config.resolve.alias.set("@", path.resolve(__dirname, "./", "src"))
    config.resolve.extensions.add(".scss")
  }
}
