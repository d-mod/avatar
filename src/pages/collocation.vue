<script lang="tsx">
	import { nextTick, defineComponent, onMounted, reactive, ref, watch, renderList, computed } from "vue"
	import { useCollocationStore } from "@/store/collocation"
	import { useDressingStore } from "@/store/dressing"
	import { useResizeObserver, useWindowScroll, debouncedWatch } from "@vueuse/core"
	import qs from "qs"

	export default defineComponent((props, { emit }) => {
		const dressingStore = useDressingStore()
		const collocationStore = useCollocationStore()

		const itemSize = {
			width: 150,
			height: 232
		}

		const itemStyle = {
			width: `${itemSize.width}px`,
			height: `${itemSize.height}px`
		}

		collocationStore.fetchData()

		const refreshing = ref(false)

		const refreshQuery = reactive<CollocationQuery>({
			profession: "swordman",
			year: 0,
			keyword: "",
			type: false,
			page: 0,
			size: 16
		})

		const loadQuery = reactive({
			page: 0,
			totalPages: 1
		})

		async function refresh() {
			refreshing.value = true

			loadQuery.page = 0

			refreshQuery.page = 0

			refreshing.value = false
		}

		const list = computed(() => {
			let { profession, keyword, size, page, type, year } = Object.assign({}, refreshQuery, loadQuery)
			const keywords = keyword.split(" ")
			return collocationStore.list
				.filter(e => {
					if (!keywords.every(kw => e.name?.includes(kw) || e.description?.includes(kw))) {
						return false
					}
					if (profession && e.profession !== profession) {
						return false
					}
					if (type && e.type !== type) {
						return false
					}
					if (year && e.year !== year) {
						return false
					}
					return true
				})
				.slice(0, (page + 1) * size)
		})

		const loading = ref(false)

		function imports(collocation: Collocation) {
			return () => {
				const { profession, code } = collocation
				gtag("event", "select_template", collocation)
				let query = qs.parse(code)
				emit("import", { name: profession, query })
				window.scrollTo(0, 0)
			}
		}

		function exports({ profession, code }: Collocation) {
			return () => emit("export", `${profession}?${code}`)
		}

		const { x, y } = useWindowScroll()

		async function load() {
			const page = Math.floor(y.value / itemSize.height) + 1

			console.log(page, loadQuery.page)

			if (page > loadQuery.page * 2) {
				loading.value = true
				loadQuery.page = Math.floor(page / 2)
				loading.value = false
			}

			await nextTick(() => (y.value += itemSize.height))
		}

		function style(item: Collocation) {
			return {
				backgroundImage: `url("/cover/${item.id}.png")`,
				height: "calc(100% - 48px)"
			}
		}

		watch(
			() => dressingStore.profession,
			val => {
				if (val?.name) {
					refreshQuery.profession = val.name
				}
			}
		)

		debouncedWatch(refreshQuery, refresh, {
			debounce: 100,
			immediate: true
		})

		const listRef = ref<HTMLElement>()

		useResizeObserver(listRef, entries => {
			const element = entries[0]
			if (element) {
				const width = element.contentRect.width
				const size = Math.floor(width / 156) * 2
				refreshQuery.size = size
			}
		})

		return () => {
			return (
				<div>
					<div class="flex flex-col h-auto px-4 pt-2">
						<div class=" mx-auto my-1 sm:mx-0">
							<n-input placeholder="搜索" onKeyup_native={refresh} action-icon="search" class="rounded-1 h-8 w-60" v-model={refreshQuery.keyword}></n-input>
						</div>
						<n-indices class="my-1" v-model={refreshQuery.profession}>
							<n-item value={0} label="全部" />
							{renderList(dressingStore.profession_list ?? [], profession => (
								<n-item key={profession.name} label={profession.label} value={profession.name} />
							))}
						</n-indices>
						<n-indices class="my-1" v-model={refreshQuery.type}>
							<n-item value={0} label="全部" />
							{renderList(collocationStore.collocation_types, type => (
								<n-item text-dark="black" key={type.name} label={type.label} value={type.name}></n-item>
							))}
						</n-indices>
						<n-indices class="my-1" v-model={refreshQuery.year}>
							<n-item value={0}>全部</n-item>
							{renderList(collocationStore.years, year => (
								<n-item key={year} label={`${year}年`} value={year} />
							))}
						</n-indices>
					</div>
					<div onTouchend={load} ref={listRef} class="flex flex-wrap duration-300 collocations">
						{renderList(list.value, item => (
							<div title={item.description} class="py-3 duration-400 item relative box-border hover:bg-dark-12" style={itemStyle}>
								<div style={style(item)} class="bg-bottom bg-no-repeat w-full top-0 z-0 absolute"></div>
								<div class="h-full w-full z-1 relative">
									<div class="h-6 text-xs text-center text-dark w-full bottom-3 leading-6 name overflow-hidden whitespace-nowrap" v-text={item.name}></div>
									<div class="text-sm text-white text-center w-full block invisible info">
										<div>
											<span>作者:</span>
											<span class="text-primary" v-text={item.author}></span>
										</div>
										<div>
											<span>热度:</span>
											<span v-text={item.amount}></span>
										</div>

										<div class="flex flex-col mx-auto items-center">
											<n-button class=" bg-white mt-4  hover:bg-primary-78 hover:text-white" onClick={imports(item)} v-text={item.custom ? "下载" : "导入"}></n-button>
											{!item.custom && (
												<n-button class=" bg-white mt-4  hover:bg-primary-78 hover:text-white" onClick={exports(item)}>
													导出
												</n-button>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
					<n-button title="查看更多" class="text-xl w-full duration-200 hover:bg-primary-24" onClick={load} full-width>
						<div class="text-2xl icon-mdi-baseline-keyboard-arrow-down"></div>
					</n-button>
				</div>
			)
		}
	})
</script>
<style lang="scss" scoped>
	.collocations {
		.item {
			&:hover {
				.info {
					visibility: visible;
				}

				.name {
					color: white;
				}
			}
		}
	}
</style>
