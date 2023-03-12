<script lang="tsx">
  import { asyncComputed, debouncedWatch, useResizeObserver, useWindowScroll } from "@vueuse/core";
  import qs from "query-string";
  import { computed, defineComponent, nextTick, reactive, ref, renderList } from "vue";
  import { HiItem } from "hoci";
  import { useDressingStore } from "@/store/dressing";
  import api from "@/api";
  import type { Collocation } from "@/api/types";

  export default defineComponent((props, { emit }) => {
    const dressingStore = useDressingStore();

    const itemSize = {
      width: 150,
      height: 232
    };

    const itemStyle = {
      width: `${itemSize.width}px`,
      height: `${itemSize.height}px`
    };

    const refreshing = ref(false);

    const refreshQuery = reactive<CollocationQuery>({
      year: 0,
      keyword: "",
      type: 0,
      page: 0,
      size: 16
    });

    const loadQuery = reactive({
      page: 0,
      totalPages: 1
    });

    async function refresh() {
      refreshing.value = true;

      loadQuery.page = 0;

      refreshQuery.page = 0;

      refreshing.value = false;
    }

    const allList = asyncComputed(() => {
      return api.getCollocationList({
        year: !refreshQuery.year ? undefined : refreshQuery.year,
        keyword: refreshQuery.keyword,
        type: !refreshQuery.type ? "" : refreshQuery.type,
        profession: dressingStore.profession_name
      });
    }, []);

    const types = asyncComputed(() => {
      return api.getCollocationTypes();
    }, []);

    const years = asyncComputed(() => {
      return api.getCollocationYears();
    }, []);

    const list = computed(() => {
      const { size, page } = Object.assign({}, refreshQuery, loadQuery);
      return allList.value.slice(0, (page + 1) * size);
    });

    const loading = ref(false);

    function imports(collocation: Collocation) {
      return () => {
        const { profession, code } = collocation;
        gtag("event", "select_template", collocation);
        const query = qs.parse(code);
        emit("import", { name: profession, query });
        window.scrollTo(0, 0);
      };
    }

    function exports({ profession, code }: Collocation) {
      return () => emit("export", `${profession}?${code}`);
    }

    const { y } = useWindowScroll();

    async function load() {
      const page = Math.floor(y.value / itemSize.height) + 1;

      if (page > loadQuery.page * 2) {
        loading.value = true;
        loadQuery.page = Math.floor(page / 2);
        loading.value = false;
      }

      await nextTick(() => (y.value += itemSize.height));
    }

    function style(item: Collocation) {
      return {
        backgroundImage: `url("/cover/${item.id}.png")`,
        height: "calc(100% - 48px)"
      };
    }

    debouncedWatch(refreshQuery, refresh, {
      debounce: 100,
      immediate: true
    });

    const listRef = ref<HTMLElement>();

    useResizeObserver(listRef, entries => {
      const element = entries[0];
      if (element) {
        const width = element.contentRect.width;
        const size = Math.floor(width / 156) * 2;
        refreshQuery.size = size;
      }
    });

    return () => {
      return (
        <div class="flex flex-col h-full">
          <div class="flex flex-col px-4">
            <div class=" mx-auto my-5 sm:mx-0">
              <apt-input placeholder="搜索" onKeyup_native={refresh} action-icon="search" class="rounded-1 h-8 w-60" v-model={refreshQuery.keyword}></apt-input>
            </div>
            <apt-indices class="my-2" v-model={refreshQuery.type}>
              <HiItem value={0} label="全部" />
              {renderList(types.value, type => (
                <HiItem text-dark="black" key={type.name} label={type.label} value={type.name}></HiItem>
              ))}
            </apt-indices>
            <apt-indices class="my-2" v-model={refreshQuery.year}>
              <HiItem value={0}>全部</HiItem>
              {renderList(years.value, year => (
                <HiItem key={year} label={`${year}年`} value={year} />
              ))}
            </apt-indices>
          </div>
          <div class="flex-1 overflow-hidden">
            <div onTouchend={load} ref={listRef} class="h-120 grid grid-cols-5  duration-300  items-start overflow-y-auto collocations clear-scroll">
              {renderList(list.value, item => (
                <div title={item.description} class="py-3 duration-400 item relative box-border hover:bg-dark-24" style={itemStyle}>
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
                        <apt-button class=" bg-white rounded mt-4 hover:bg-primary-78 hover:text-white" onClick={imports(item)} v-text={item.custom ? "下载" : "导入"}></apt-button>
                        {!item.custom && (
                          <apt-button class=" bg-white rounded  mt-4 hover:bg-primary-78 hover:text-white" onClick={exports(item)}>
                            导出
                          </apt-button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <apt-button title="查看更多" class="text-xl w-full duration-200 hover:bg-primary-24" onClick={load} full-width>
            <div class="text-2xl icon-mdi-baseline-keyboard-arrow-down"></div>
          </apt-button>
        </div>
      );
    };
  });
</script>

<style lang="less" scoped>
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
