import { nextTick, defineComponent, onMounted, reactive, ref, watch, watchEffect } from "vue"
import { Collocation, CollocationQuery } from "@/model"
import { useCollocationStore } from "@/store/collocation"
import { useDressingStore } from "@/store/dressing"
import { useResizeObserver } from "@vueuse/core"
import { debounce } from "lodash"
import qs from "qs"

import "./collocation.scss"

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

    function imports({ profession, code }: Collocation) {
        let query = qs.parse(code)
        emit("import", { name: profession, query })
        window.scrollTo(0, 0)
    }

    function exports({ profession, code }: Collocation) {
        emit("export", `${profession}?${code}`)
    }

    async function load() {
        const list = listRef.value
        if (!list) {
            return
        }

        const { scrollTop } = list

        const page = Math.floor(scrollTop / itemSize.height) + 1

        if (page > loadQuery.page * 2) {
            loading.value = true
            loadQuery.page = page / 2
            let query = Object.assign({}, refreshQuery, loadQuery)
            await collocationStore.load(query)
            loading.value = false
        }

        const y = page * itemSize.height

        await nextTick(() => list.scrollTo(0, y))
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
                <div class="h-auto pt-2 px-4 flex flex-wrap">
                    <div class="select-col">
                        <apt-input placeholder="搜索" onKeyup_native={debounce(refresh, 20)} action-icon="search" class="search-input" v-model={refreshQuery.keyword}></apt-input>
                    </div>
                    <div class="select-col">
                        <apt-indices size="small" v-model={refreshQuery.profession}>
                            <apt-option value={false} label="全部" />
                            {dressingStore.profession_list.map(profession => (
                                <apt-option key={profession.name} label={profession.label} value={profession.name} />
                            ))}
                        </apt-indices>
                    </div>
                    <div class="select-col">
                        <apt-indices size="small" v-model={refreshQuery.type}>
                            <apt-option value={false} label="全部" />
                            {collocationStore.collocation_types.map(type => (
                                <apt-option text-color="black" key={type.name} label={type.label} value={type.name}></apt-option>
                            ))}
                        </apt-indices>
                    </div>
                    <div class="select-col">
                        <apt-indices size="small" v-model={refreshQuery.year}>
                            <apt-option value={0} label="全部" />
                            {collocationStore.years.map(year => (
                                <apt-option key={year} label={`${year}年`} value={year} />
                            ))}
                        </apt-indices>
                    </div>
                </div>
                <div onTouchend={load} ref={listRef} class="collocations duration-300 overflow-y-auto h-60 flex flex-wrap">
                    {collocationStore.display_list.map(item => (
                        <div title={item.description} class="item relative py-3 box-border duration-400" style={itemStyle}>
                            <div style={style(item)} class="layer"></div>
                            <div class="w-full h-full relative z-1">
                                <div class="name" v-text={item.name}></div>
                                <div class="info">
                                    <span>作者:</span>
                                    <span class="text-blue-400" v-text={item.author}></span>
                                </div>
                                <div class="info">
                                    <span>热度:</span>
                                    <span v-text={item.amount}></span>
                                </div>
                                <apt-button class="border-1" onClick={() => imports(item)} type="primary" v-text={item.custom ? "下载" : "导入"}></apt-button>
                                {item.custom ? (
                                    <div></div>
                                ) : (
                                    <apt-button class="border-1" onClick={() => exports(item)} type="primary">
                                        导出
                                    </apt-button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <apt-button class="w-full text-xl" onClick={load} full-width>
                    <div class="i-mdi-chevron-down text-2xl"></div>
                </apt-button>
            </div>
        )
    }
})
