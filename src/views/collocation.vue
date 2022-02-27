<script lang="tsx">
	import { nextTick, defineComponent, onMounted, reactive, ref, watch, watchEffect, renderList } from "vue"
	import { Collocation, CollocationQuery } from "@/model"
	import { useCollocationStore } from "@/store/collocation"
	import { useDressingStore } from "@/store/dressing"
	import { useResizeObserver, useWindowScroll } from "@vueuse/core"
	import { debounce } from "lodash"
	import qs from "qs"

	export default defineComponent((props, { emit }) => {
		const dressingStore = useDressingStore()
		const collocationStore = useCollocationStore()

		const itemSize = {
			width: 156,
			height: 240
		}

		const itemStyle = {
			width: `${itemSize.width}px`,
			height: `${itemSize.height}px`
		}

		onMounted(async () => {
			await collocationStore.fetchData()
		})

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

			await collocationStore.load(refreshQuery)

			loadQuery.page = 0

			refreshing.value = false
		}

		const loading = ref(false)

		function imports(collocation: Collocation) {
			const { profession, code } = collocation
			gtag("event", "select_template", collocation)
			let query = qs.parse(code)
			emit("import", { name: profession, query })
			window.scrollTo(0, 0)
		}

		function exports({ profession, code }: Collocation) {
			emit("export", `${profession}?${code}`)
		}

		const { x, y } = useWindowScroll()

		async function load() {
			const page = Math.floor(y.value / itemSize.height) + 1

			if (page > loadQuery.page * 2) {
				loading.value = true
				loadQuery.page = page / 2
				let query = Object.assign({}, refreshQuery, loadQuery)
				await collocationStore.load(query)
				loading.value = false
			}

			await nextTick(() => (y.value += itemSize.height))
		}

		function style(item: Collocation) {
			return {
				backgroundImage: `url("/cover/${item.id}.png")`
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

		watchEffect(refresh)

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
					<div class="flex flex-wrap h-auto px-4 pt-2">
						<div class="select-col justify-center sm:justify-start">
							<apt-input placeholder="搜索" onKeyup_native={debounce(refresh, 20)} action-icon="search" class="search-input" v-model={refreshQuery.keyword}></apt-input>
						</div>
						<div class="select-col">
							<apt-indices size="small" v-model={refreshQuery.profession}>
								<apt-option value={false} label="全部" />
								{renderList(dressingStore.profession_list, profession => (
									<apt-option key={profession.name} label={profession.label} value={profession.name} />
								))}
							</apt-indices>
						</div>
						<div class="select-col">
							<apt-indices size="small" v-model={refreshQuery.type}>
								<apt-option value={false} label="全部" />
								{renderList(collocationStore.collocation_types, type => (
									<apt-option text-dark="black" key={type.name} label={type.label} value={type.name}></apt-option>
								))}
							</apt-indices>
						</div>
						<div class="select-col">
							<apt-indices size="small" v-model={refreshQuery.year}>
								<apt-option value={0} label="全部" />
								{renderList(collocationStore.years, year => (
									<apt-option key={year} label={`${year}年`} value={year} />
								))}
							</apt-indices>
						</div>
					</div>
					<div onTouchend={load} ref={listRef} class="flex flex-wrap duration-300 collocations">
						{renderList(collocationStore.display_list, item => (
							<div title={item.description} class="py-3 duration-400 item relative box-border" style={itemStyle}>
								<div style={style(item)} class="bg-bottom bg-no-repeat w-full layer absolute"></div>
								<div class="h-full w-full z-1 relative">
									<div class="name" v-text={item.name}></div>
									<div class="info">
										<span>作者:</span>
										<span class="text-primary" v-text={item.author}></span>
									</div>
									<div class="info">
										<span>热度:</span>
										<span v-text={item.amount}></span>
									</div>
									<apt-button class="border-1" onClick={() => imports(item)} type="primary" v-text={item.custom ? "下载" : "导入"}></apt-button>
									{!item.custom && (
										<apt-button class="border-1" onClick={() => exports(item)} type="primary">
											导出
										</apt-button>
									)}
								</div>
							</div>
						))}
					</div>
					<apt-button class="text-xl w-full" onClick={load} full-width>
						<div class="text-2xl i-mdi-baseline-keyboard-arrow-down"></div>
					</apt-button>
				</div>
			)
		}
	})
</script>
<style lang="scss" scoped>
	.select-col {
		height: auto;
		width: 100%;
		margin: 4px 0;
		display: flex;
		align-items: center;

		.search-input {
			width: 240px;
			height: 32px;
			border-radius: 4px 0 0 4px;
		}
	}

	.collocations {
		.item {
			.layer {
				position: absolute;
				width: 100%;
				background-position: bottom;
				background-repeat: no-repeat;
				height: calc(100% - 48px);
				z-index: 0;
				top: 0;
			}

			.info {
				font-size: 14px;
				width: 100%;
				display: block;
				color: white;
				text-align: center;
				visibility: hidden;
			}

			.name {
				width: 100%;
				height: 24px;
				line-height: 24px;
				font-size: 12px;
				text-align: center;
				overflow: hidden;
				white-space: nowrap;
				position: absolute;
				bottom: 12px;
				color: var(--black);
			}

			button {
				display: block;
				margin: 1rem auto;
				border-radius: 3px;
				visibility: hidden;
				transition-duration: 0s;
			}

			&:hover {
				background-color: rgba(0, 0, 0, 0.48);

				.info,
				button {
					visibility: visible;
				}

				.name {
					color: white;
				}
			}
		}
	}
</style>
