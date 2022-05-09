<script lang="tsx">
	import { useDressingStore } from "@/store"
	import { useDark, useMediaQuery, useToggle, useVModel } from "@vueuse/core"
	import { CSSProperties, defineComponent, renderList } from "vue"

	export default defineComponent({
		props: {
			collapsed: {
				type: Boolean,
				default: () => true
			}
		},
		setup(props, { emit }) {
			const store = useDressingStore()

			const isCollapsed = useVModel(props, "collapsed", emit)

			const toggle = useToggle(isCollapsed)

			function profIcon(index: number): CSSProperties {
				return {
					width: "26px",
					height: "26px",
					backgroundImage: `url("/icon/profession.png")`,
					backgroundPositionX: `-${index * 26}px`,
					backgroundPositionY: `${0}px`
				}
			}

			const isDark = useDark({
				selector: "html",
				attribute: "data-theme",
				valueLight: "light",
				valueDark: "dark"
			})

			const toggleDark = useToggle(isDark)

			const isMobile = useMediaQuery("(max-width: 640px)")

			function changeProfssion(prof: Profession) {
				emit("apply", prof)

				gtag("event", "select-profession", { label: prof.label, name: prof.name })
				if (isMobile.value) {
					toggle(true)
				}
			}

			return () => {
				return (
					<n-selection
						value={store.profession}
						onChange={changeProfssion}
						item-class="odd:flex-row-reverse text-sm flex-1 h-12 flex items-center cursor-pointer select-none  duration-200 relative"
						active-class="text-primary bg-primary-36"
						class={["h-full fixed left-0 top-0 bg-light float-left  text-dark duration-300 shadow z-999"].concat(isCollapsed.value ? "w-12" : "sm:w-64 w-full")}
					>
						<n-button title={isCollapsed.value ? "展开" : "收起"} class=" font-bold h-8 text-center text-xl w-full duration-300 select-none" onClick={() => toggle()}>
							<div class={isCollapsed.value ? "icon-mdi-add" : "icon-mdi-baseline-minus"} />
						</n-button>

						{renderList(store.profession_list ?? [], (prof, index) => (
							<n-item title={prof.label} key={index} value={prof} class={["hover:text-primary hover:bg-primary-12"].concat(isCollapsed.value ? "justify-center" : "px-8")}>
								<div class={!isCollapsed.value && "absolute"} style={profIcon(index)}></div>
								<div class="flex-1 text-center" v-show={!isCollapsed.value}>
									{prof.label}
								</div>
							</n-item>
						))}

						<n-button title={isDark.value ? "浅色模式" : "深色模式"} onClick={() => toggleDark()} class="font-bold text-xl  w-full duration-300 select-none">
							<div class={["w-6 h-6 bg-center bg-no-repeat text-dark"].concat(isDark.value ? "icon-mdi-outline-dark-mode" : "icon-mdi-outline-light-mode")}></div>
						</n-button>
					</n-selection>
				)
			}
		}
	})
</script>
<style lang="scss" scoped></style>
