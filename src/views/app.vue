<script lang="tsx">
	import { computed, ref, onMounted, reactive, defineComponent, renderList, watch } from "vue"
	import { useRoute, useRouter } from "vue-router"
	import qs from "qs"

	import DEFAULT_SRC from "@/assets/default.png"
	import EMPTY_SRC from "@/assets/empty.png"

	import CanvasBox from "@/components/canvas-box.vue"
	import Profession from "./profession.vue"

	import Collocation from "./collocation.vue"

	import { CodeTemplate, Dress, DressIcon, DressImage } from "@/model"
	import { useDressingStore } from "@/store"
	import { useMediaQuery, useSwipe } from "@vueuse/core"

	export default defineComponent({
		name: "app",
		components: {
			CanvasBox,
			Profession,
			Collocation
		},
		setup() {
			const code_query = reactive<CodeQuery>({
				part: "skin"
			})

			const canvas_props = reactive<CanvasProps>({
				width: 300,
				height: 300,
				scale: 100
			})

			const store = useDressingStore()

			const $weapon_list = computed(() => store.profession?.weapons || [])
			const $weapon = computed(() => $weapon_list.value.find(e => e.name == code_query.weapon))

			const current_part = computed(() => {
				let part = code_query.part
				if (part == "weapon" && !!code_query.weapon) {
					part = code_query.weapon
				}
				return part
			})

			const scale = computed(() => canvas_props.scale / 100)

			const keyword = ref("")

			const icons = ref<DressIcon[]>([])

			const weapon = ref("")

			const images = computed(() => {
				const profession_name = store.profession?.name

				let images: DressImage[] = []
				if (profession_name) {
					for (let part in parts) {
						let array = parts[part].images || []
						let p: string | undefined = part
						if (p === "weapon") {
							p = code_query.weapon
						}
						if (!p) {
							continue
						}
						array.forEach(e => (e.url = `/image/${profession_name}/${p}/${e.name}`))
						images.push(...array)
					}
				}
				return images
			})

			const dress_list = ref<Dress[]>([])

			const parts = reactive<PartList>({
				hair: createDefault("hair"),
				cap: createDefault("cap"),
				face: createDefault("face"),
				//   weapon: createDefault("weapon","武器"),
				neck: createDefault("neck"),
				coat: createDefault("coat"),
				skin: createDefault("skin"),
				belt: createDefault("belt"),
				pants: createDefault("pants"),
				shoes: createDefault("shoes")
			})

			function validateCode(code: string) {
				return !!code && parseInt(code) > -1
			}

			/**
			 *
			 * 图标加载出错的处理
			 *
			 */
			function error(event: Event) {
				//如果图标不存在,则使用默认图标
				if (event && event.target) {
					const image = event.target as HTMLImageElement
					image.src = DEFAULT_SRC
				}
			}

			function handleSelect(value: any, item: Dress) {
				keyword.value = item.name
				selectDress(item)
			}

			function label(item: Dress) {
				return `${item.name || ""}[${item.code}]`
			}

			function style(item: Dress) {
				let name = `${item.part}/${item.code}.png`

				let index = icons.value.findIndex(e => e.name === name)
				if (index > -1) {
					let info = icons.value[index]
					return {
						backgroundImage: `url("/icon/${item.profession}/${item.part}.png")`,
						backgroundPositionX: `${info.x}px`,
						backgroundPositionY: `${info.y}px`
					}
				}

				return {
					backgroundImage: `url("${DEFAULT_SRC}") `
				}
			}

			function partStyle(index: number) {
				let x = 40
				let y = 40
				let step = 28 + 40
				x += Math.floor(index / 3) * step
				y += (index % 3) * step
				return {
					top: `${x}px`,
					left: `${y}px`,
					backgroundImage: `url(${EMPTY_SRC})`
				}
			}

			const keyword_list = computed(() => keyword.value.split(" ").filter(e => e.length > 0))

			const show_list = computed(() => {
				let list: Dress[] = []
				if (keyword_list.value.length === 0) {
					list = Array.from(dress_list.value)
				} else {
					list = dress_list.value.filter(match)
				}
				list.sort((a, b) => parseInt(a.code) - parseInt(b.code))
				return list
			})

			/**
			 *
			 * 匹配符合条件的时装
			 *
			 */
			function match(item: Dress) {
				const keywords = keyword_list.value
				for (let keyword of keywords) {
					if ((item.name && item.name.match(keyword)) || item.code.match(keyword)) {
						continue
					}
					if (item.name && item.name.indexOf(keyword) > -1) {
						continue
					}
					if (item.code.indexOf(keyword) > -1) {
						continue
					}
					return false
				}
				return true
			}

			function isActive(dress: Dress) {
				let { code, part } = dress
				return !!part && code === parts[part].code
			}

			/**
			 *
			 * 加载时装
			 *
			 */
			async function apply({ name, query = {} }: CodeTemplate = {}) {
				for (let p in parts) {
					//如果该部位为武器,则替换为具体的武器子类
					if (!query[p]) {
						//如果参数中不存在该部位代码,则重置该部位
						reset(p)
					}
				}
				if (!name) {
					return
				}
				//切换职业
				store.setProfessionName(name)
				await refresh()
				//获取每个部位的时装信息
				let list = await store.getDress(query)
				const tasks = list.map(async item => await selectDress(item))
				await Promise.all(tasks)
			}

			/**
			 *
			 * 刷新
			 *
			 */
			async function refresh() {
				let part = current_part.value

				//根据职业和部位,获取时装列表
				const [icon_data, dress_data] = await Promise.all([store.getIcon(part), store.getDressList(part)])
				icons.value = icon_data
				dress_list.value = dress_data
			}

			/**
			 *
			 * 选择部位
			 *
			 */
			async function selectPart(part: string) {
				if (code_query.part !== part) {
					code_query.part = part
					await refresh()
				}
			}
			/**
			 *
			 * 选择时装
			 *
			 */
			async function selectDress(item: Dress) {
				let { code, part } = item

				const num = parseInt(code)
				if (isNaN(num) || num === -1) {
					reset(part)
					return
				}
				if (!part || !parts[part]) {
					//确认具体的子武器种类
					part = "weapon"
				}
				parts[part] = Object.assign({ title: parts[part].title }, item)
			}

			function onContextmenu(part: string) {
				return (e: Event) => {
					e.preventDefault()
					reset(part)
				}
			}

			/**
			 * 重置部位
			 *
			 */
			function reset(part: string) {
				parts[part] = createDefault(part)
			}

			async function clear() {
				await apply(store.profession)
			}

			const showDialog = reactive({
				imports: false,
				exports: false
			})

			const copy_success = ref(false)

			const code = ref("")

			const code_regex = /.*\?(.*=&)*/

			/**
			 * 导入时装代码
			 */
			async function imports() {
				try {
					let text = await navigator.clipboard.readText()
					if (text.match(code_regex)) {
						code.value = text
					}
				} finally {
					showDialog.imports = true
				}
			}

			async function imports_done() {
				showDialog.imports = false

				const text = code.value
				if (text.match(code_regex)) {
					let index = text.indexOf("?")
					if (index < 0) {
						index = text.length - 1
					}
					let name = text.substring(0, index)
					let suffix = text.substring(index + 1)
					let query = qs.parse(suffix) as Record<string, string>
					await apply({ name, query })
				}
			}

			async function exports(result?: string) {
				if (!result) {
					let name = store.profession_name
					let query: Record<string, string> = {}
					for (let p in parts) {
						let { code } = parts[p]
						if (validateCode(code)) {
							let part = (p === "weapon" ? weapon.value : p) || p
							query[part] = code
						}
					}
					result = `${name}?${qs.stringify(query)}`
				}
				code.value = result
				copy_success.value = true
				try {
					await navigator.clipboard.writeText(result)
				} catch {
					copy_success.value = false
				} finally {
					showDialog.exports = true
				}
				//Snackbar({ content: "导出成功，已复制到剪贴板", type: "success" })
			}

			onMounted(async () => {
				const route = useRoute()
				const router = useRouter()
				const list = await store.loadProfession()

				if (list && list.length > 0) {
					let { path: name } = route
					let query = route.query as Record<string, string>
					name = name.replace("/", "")

					let item: CodeTemplate = {}
					if (name && name.length > 0) {
						// 如果路由带有参数,则自动载入代码
						item = { name, query }
						await router.replace("/")
					} else if (store.profession) {
						//如果没有则载入默认的职业装扮
						item = store.profession
					}
					await apply(item)
				}
			})

			const isCollapsed = ref(true)

			const { isSwiping, direction } = useSwipe(document.documentElement)

			watch(isSwiping, val => {
				if (val) {
					switch (direction.value) {
						case "LEFT":
							isCollapsed.value = true
							return
						case "RIGHT":
							isCollapsed.value = false
							return
					}
				}
			})
			return () => {
				return (
					<>
						<profession v-model:collapsed={isCollapsed.value} onApply={apply} />
						<div class={["flex justify-center duration-300 pr-4"].concat(isCollapsed.value ? "pl-16" : "sm:pl-64")}>
							<div class="flex flex-wrap my-4 mx-2 max-w-400 justify-center items-start overflow-x-hidden ">
								<div class="flex flex-wrap">
									<div class="flex-wrap flex card justify-center items-center ">
										<div class="flex h-20 w-full items-center justify-center">
											<apt-button class="border-1" title="重置" onClick={clear} size="normal" color="gray">
												<div class="text-xl i-mdi-refresh"></div>
											</apt-button>
											<apt-button class="border-1" onClick={imports} size="normal" type="primary">
												导入
											</apt-button>
											<apt-button class="border-1" onClick={() => exports()} type="info" size="normal">
												导出
											</apt-button>
										</div>
										<canvas-box height={canvas_props.height} width={canvas_props.width} images={images.value} scale={scale.value}></canvas-box>
										<div class="h-60 w-60 part relative">
											{renderList(parts, (value, part, index) => (
												<div
													onClick={() => selectPart(part as string)}
													onContextmenu={onContextmenu(part as string)}
													key={part}
													style={partStyle(index)}
													class={["item", "text-xs", "absolute", "w-8", "h-8", "border-2", "border-transparent", "box-border"].concat(
														part === code_query.part ? "active" : ""
													)}
												>
													{validateCode(value.code) ? (
														<img class="flex h-7 m-0 w-7 icon" src={value.icon ?? DEFAULT_SRC} title={label(value)} onError={error} draggable="false" />
													) : (
														<div class="icon" title={value.title}>
															{value.title}
														</div>
													)}
												</div>
											))}
										</div>
										<div class="h-auto justify-end overflow-hidden sm:h-93">
											<div class="flex h-12 items-center justify-center">
												<apt-input placeholder="搜索" v-model={keyword.value}></apt-input>
											</div>
											<div class="flex flex-wrap h-auto w-75 select overflow-y-auto justify-start sm:h-75 ">
												<div onClick={() => reset(code_query.part)} class="icon default"></div>
												{renderList(show_list.value, dress => (
													<div
														class={{ active: isActive(dress), icon: true }}
														key={dress.hash}
														style={style(dress)}
														title={label(dress)}
														onClick={() => selectDress(dress)}
													></div>
												))}
											</div>
										</div>
									</div>
									<collocation class="mt-4 card" onExport={exports} onImport={apply} />
								</div>

								<div class="flex flex-wrap mt-4 text-center text-sm text-color mb-12 items-center">
									<p class="m-0 w-full">
										<a class="text-blue-400" href="//gitee.com/davatar/davatar">
											DAvatar&nbsp;Ver&nbsp;2.0.0
										</a>
									</p>
									<p class="m-0 w-full">
										Copyright&nbsp;©&nbsp;2017-present&nbsp;
										<a class="text-blue-400" href="//gitee.com/apateat">
											Apateat
										</a>
										.
									</p>
									<p class="m-0 w-full">All&nbsp;rights&nbsp;reserved.</p>
								</div>
							</div>
						</div>

						<apt-dialog class="h-30 p-4 w-80 relative" onYes={() => (showDialog.exports = false)} cancel-button={false} v-model:visible={showDialog.exports}>
							<div class="h-8 w-full leading-8">导出</div>
							<div v-show={!copy_success.value} class="text-red-400">
								复制失败,请自行复制到剪贴板
							</div>
							<div class=" text-blue-300 break-all select-all ">{code.value}</div>
						</apt-dialog>
						<apt-dialog onYes={imports_done} onCancel={() => (showDialog.imports = false)} class="p-4 w-80" v-model:visible={showDialog.imports}>
							<div class="h-8 w-full leading-8">导入</div>
							<apt-input multiline v-model={code.value} placeholder="请输入代码" class="h-auto w-full word-wrap"></apt-input>
						</apt-dialog>
					</>
				)
			}
		}
	})

	interface PartValue extends Dress {
		title?: string
	}

	interface PartList {
		[key: string]: PartValue
	}

	interface CodeQuery {
		part: string
		code?: string
		weapon?: string
	}

	interface CanvasProps {
		width: number
		height: number
		scale: number
	}

	const part_titles: Record<string, string> = {
		hair: "头部",
		cap: "帽子",
		face: "脸部",
		neck: "胸部",
		coat: "上衣",
		skin: "皮肤",
		belt: "腰带",
		pants: "下装",
		shoes: "鞋"
	}

	function createDefault(part: string): PartValue {
		return {
			name: "",
			part,
			icon: EMPTY_SRC,
			images: [],
			code: "-1",
			title: part_titles[part]
		}
	}
</script>
<style scoped lang="scss">
	@import "@/assets/style/theme";

	.card {
		width: 100%;
		background-color: var(--content-color);
		box-shadow: 0 1px 3px rgb(18 18 18 / 10%);
	}

	.part {
		.item {
			color: $text-inner-color;

			.icon {
				margin: 0;
				width: 28px;
				height: 28px;
				display: flex;
				align-items: center;
				justify-content: center;
				user-select: none;
			}

			&:hover {
				transition-duration: 100ms;
				transform: scale(1.3);
			}

			&.active {
				border: #ff4081 2px solid;
			}
		}
	}

	.select {
		.icon {
			width: 32px;
			height: 32px;
			border: 2px solid transparent;
			margin: 10px;
			box-sizing: border-box;
			float: left;
			user-select: none;
			font-size: 12px;
			color: $text-inner-color;
			display: flex;
			align-items: center;
			justify-content: center;

			&:hover {
				transition-duration: 100ms;
				transform: scale(1.3);
			}

			&.default {
				background-image: url("@/assets/default.png");
			}
		}
	}

	@media screen and (min-width: 320px) and (max-width: 750px) {
		.dress-list {
			height: auto;
		}
	}
</style>
