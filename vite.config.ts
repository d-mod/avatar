import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import jsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

import uno from "unocss/vite";

import fourze from "@fourze/vite";
import uncomponents from "unplugin-vue-components/vite";
import { version } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  esbuild: {
    exclude: ["node_modules/**", "dist/**"]
  },
  build: {
    emptyOutDir: false
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  },
  define: {
    __APP_VERSION__: `"${version}"`,
    __LAST_MODIFIED__: `${new Date().getTime()}`
  },
  envPrefix: "APP_",
  plugins: [
    vue(),
    jsx(),
    fourze({
      base: "/api",
      timeout: 0,
      swagger: false
    }),
    uncomponents({
      allowOverrides: true,
      directoryAsNamespace: true,
      types: [
        {
          from: "vue-router",
          names: ["RouterLink", "RouterView"]
        }
      ]
    }),
    uno(),
    VitePWA({
      injectRegister: "auto",
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      manifest: {
        name: "纸娃娃系统",
        short_name: "纸娃娃",
        icons: [
          {
            src: "icon_32.png",
            sizes: "32x32",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icon_32.webp",
            sizes: "32x32",
            type: "images/webp",
            purpose: "any maskable"
          },

          {
            src: "icon_48.png",
            sizes: "48x48",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icon_128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icon_256.png",
            sizes: "256x256",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {}
    })
  ],
  server: {
    host: "0.0.0.0",
    open: true,
    fs: {
      deny: ["dist/**"]
    },
    proxy: {
      "^/(icon|image|cover)/.*": {
        target: "https://avatar.dnftools.com",
        changeOrigin: true
      }
    }
  }
});
