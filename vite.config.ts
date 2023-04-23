import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import jsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

import { icons } from "@iconify-json/ic";
import { presetIcons, presetUno } from "unocss";
import uno from "unocss/vite";

import fourze from "@fourze/vite";
import presetPalette from "unocss-preset-palette";
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
      timeout: 0
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
    uno({
      rules: [],
      presets: [
        presetUno({}),
        presetPalette({
          colorMode: {
            attribute: "data-theme",
            selector: ":root"
          },
          cssVarName(name) {
            return name;
          },
          colors: {
            primary: "#4fb3ff",
            thin: {
              light: "#eff0f1",
              dark: "#2a2a2a"
            },
            light: {
              light: "#f7f8f9",
              dark: "#1a1a1a"
            },
            dark: {
              light: "#1a1a1a",
              dark: "#f7f8f9"
            },
            neutral: {
              light: "#e3e4e5",
              dark: "#232323"
            }
          }
        }),
        presetIcons({
          prefix: "icon-",
          collections: { mdi: () => icons }
        })
      ]
    }),
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
        target: "https://avatar.dcalc.cn",
        changeOrigin: true
      }
    }
  }
});
