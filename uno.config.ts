import { icons } from "@iconify-json/ic";
import { defineConfig, presetIcons, presetUno } from "unocss";
import presetPalette from "unocss-preset-palette";

export default defineConfig({
  presets: [
    presetUno(),
    presetPalette({
      colorMode: {
        attribute: "data-theme",
        selector: ":root"
      },
      cssVarName: "color-[name]",
      themeColors: {
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
});
