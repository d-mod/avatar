import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import jsx from "@vitejs/plugin-vue-jsx"
import { VitePWA } from "vite-plugin-pwa"

import uno from "unocss/vite"
import presetDefault from "@unocss/preset-uno"
import presetIcons from "@unocss/preset-icons"
import { icons } from "@iconify-json/ic"

import { resolve } from "path"

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
	plugins: [
		vue(),
		jsx(),
		uno({
			rules: [
				[
					/^bg-(.*)-([1-9]|[1-9]\d)$/,
					([, c, o], { theme }: { theme: any }) => {
						console.log(c, o)
						let opacity = Number(o)
						if (!!opacity && opacity > 0 && opacity < 100) {
							if (theme.colors[c] && !theme.colors[`${c}-${o}`]) {
								let colorValue = theme.colors[c]
								colorValue = /^rgba?\((.*)\)$/.exec(colorValue)[1] as string
								if (colorValue) {
									colorValue = colorValue.split(",").slice(0, 3).join(",")
									return { background: `rgba(${colorValue}, ${opacity / 100})` }
								}
							}
						}
					}
				],
				[
					/^text-(.*)-([1-9]|[1-9]\d)$/,
					([, c, o], { theme }: { theme: any }) => {
						console.log(c, o)
						let opacity = Number(o)
						if (!!opacity && opacity > 0 && opacity < 100) {
							if (theme.colors[c] && !theme.colors[`${c}-${o}`]) {
								let colorValue = theme.colors[c]
								colorValue = /^rgba?\((.*)\)$/.exec(colorValue)[1] as string
								if (colorValue) {
									colorValue = colorValue.split(",").slice(0, 3).join(",")
									return { color: `rgba(${colorValue}, ${opacity / 100})` }
								}
							}
						}
					}
				]
			],
			theme: {
				colors: {
					primary: "rgb(var(--primary))",
					light: "var(--white)",
					dark: "var(--black)",
					neutral: "var(--neutral)"
				}
			},
			presets: [
				presetDefault(),
				presetIcons({
					collections: { mdi: icons }
				})
			]
		}),
		VitePWA({
			registerType: "autoUpdate",
			strategies: "injectManifest",
			srcDir: "src",
			filename: "sw.ts",
			manifest: {
				name: "davatar",
				short_name: "davatar",
				icons: [
					{
						src: "icon_32.webp",
						sizes: "32x32",
						type: "images/webp"
					},

					{
						src: "icon_48.png",
						sizes: "48x48"
					},
					{
						src: "icon_128.png",
						sizes: "128x128"
					},
					{
						src: "icon_256.png",
						sizes: "256x256"
					}
				]
			}
		})
	],
	server: {
		host: "0.0.0.0",
		open: true,
		fs: {
			deny: ["dist/**"]
		},

		proxy: {
			"^/(api|icon|image|cover)/.*": {
				target: "https://davatar.gitee.io",
				changeOrigin: true
			}
		}
	}
})
