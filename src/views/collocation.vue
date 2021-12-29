<template>
    <div class="collocation">
        <div class="header">
            <div class="select-col">
                <apt-input placeholder="搜索" @keyup.native="debounce(refresh, 20)" action-icon="search" class="search-input" v-model="refreshQuery.keyword"> </apt-input>
            </div>
            <div class="select-col">
                <apt-indices size="small" v-model="refreshQuery.profession">
                    <apt-option :value="false" label="全部" />
                    <apt-option :key="profession.name" :label="profession.label" :value="profession.name" v-for="profession in dressingStore.profession_list" />
                </apt-indices>
            </div>
            <div class="select-col">
                <apt-indices size="small" v-model="refreshQuery.type">
                    <apt-option :value="false" label="全部" />
                    <apt-option text-color="black" :key="type.name" :label="type.label" :value="type.name" v-for="type in types" />
                </apt-indices>
            </div>
            <div class="select-col">
                <apt-indices size="small" v-model="refreshQuery.year">
                    <apt-option :value="0" label="全部"> </apt-option>
                    <apt-option :key="year" :label="`${year}年`" :value="year" v-for="year in years"> </apt-option>
                </apt-indices>
            </div>
        </div>
        <div ref="listRef" class="list">
            <div :title="item.description" class="item" :style="itemStyle" v-for="item in display_list">
                <div :style="style(item)" class="layer"> </div>
                <div class="board">
                    <div class="name" v-text="item.name"></div>
                    <div class="info">
                        <span>作者:</span>
                        <span class="text" v-text="item.author"></span>
                    </div>
                    <div class="info">
                        <span>热度:</span>
                        <span v-text="item.amount"></span>
                    </div>
                    <apt-button @click="imports(item)" type="primary">{{ item.custom ? "下载" : "导入" }}</apt-button>
                    <apt-button @click="exports(item)" type="primary" v-if="!item.custom">导出 </apt-button>
                </div>
            </div>
        </div>
        <apt-button :outline="false" class="load-more material-icons" @click="load" full-width>keyboard_arrow_down</apt-button>
    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, onDeactivated, onMounted, reactive, ref, watch } from "vue"
    import { Collocation, CollocationQuery } from "@/model"
    import { useCollocationStore } from "@/store/collocation"
    import { useDressingStore } from "@/store/dressing"
    import qs from "qs"
    import { useResizeObserver } from "@vueuse/core"
    import { debounce } from "lodash"

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
        await refresh()
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

    const emit = defineEmits(["import", "export"])

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
            collocationStore.load(query)
            loading.value = false
        }

        const y = page * itemSize.height

        await nextTick(() => {
            list.scrollTo(0, y)
        })
    }

    function style(item: Collocation) {
        return {
            backgroundImage: `url("/cover/${item.id}.png")`
        }
    }

    const display_list = computed(() => collocationStore.display_list)

    const types = computed(() => collocationStore.collocation_types)

    const years = computed(() => collocationStore.years)

    watch(
        () => dressingStore.profession,
        val => {
            if (val?.name) {
                refreshQuery.profession = val.name
            }
        }
    )

    watch(refreshQuery, refresh)

    const listRef = ref<HTMLElement>()

    useResizeObserver(listRef, entries => {
        const element = entries[0]
        if (element) {
            const width = element.contentRect.width
            const size = Math.floor(width / 156) * 2
            refreshQuery.size = size
        }
    })
</script>

<style scoped lang="scss">
    @import "../style/theme";

    .collocation {
        margin: auto;
        .header {
            height: auto;
            padding-top: 12px;

            .select-col {
                height: 32px;
                display: flex;
                align-items: center;

                .search-input {
                    width: 240px;
                    height: 32px;
                    border-radius: 4px 0 0 4px;
                }
            }
        }

        .list {
            transition: all 0.3s;
            overflow-y: auto;
            height: 240px;
            display: flex;
            flex-wrap: wrap;

            .item {
                position: relative;
                padding: 12px 0;
                box-sizing: border-box;
                transition: all 0.4s ease;

                .layer {
                    position: absolute;
                    width: 100%;
                    background-position: bottom;
                    background-repeat: no-repeat;
                    height: calc(100% - 48px);
                    z-index: 0;
                    top: 0;
                }

                .board {
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                    position: relative;

                    .info {
                        font-size: 14px;
                        width: 100%;
                        display: block;
                        color: white;
                        text-align: center;
                        visibility: hidden;

                        .text {
                            color: $light-blue;
                        }
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
                    }

                    button {
                        display: block;
                        margin: 1rem auto;
                        border-radius: 3px;
                        visibility: hidden;
                        transition-duration: 0s;
                    }
                }

                &:hover {
                    background-color: rgba(0, 0, 0, 0.48);

                    .board {
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
        }

        .load-more {
            width: 100%;
            font-size: 24px;
            height: 32px;
            line-height: 32px;
        }
    }
</style>
