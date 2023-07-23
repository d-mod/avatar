<script lang="tsx">
import { asyncComputed } from "@vueuse/core";
import queryString from "query-string";
import { computed, defineComponent, reactive, ref, renderList } from "vue";
import { HiItem } from "hoci";
import { vIntersectionObserver } from "@vueuse/components";
import { useDressingStore } from "@/store/dressing";
import api from "@/api";
import { type Collocation } from "@/api/types";
import VirtualListVue from "@/components/virtual-list.vue";
export default defineComponent({
  directives: {
    intersectionObserver: vIntersectionObserver
  },
  emits: ["import", "export"],
  setup(props, { emit }) {
    const dressingStore = useDressingStore();

    const itemSize = {
      width: 140,
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
      page: 10,
      totalPages: 10
    });

    async function refresh() {
      refreshing.value = true;

      loadQuery.page = 0;

      refreshQuery.page = 0;

      refreshing.value = false;
    }

    const allList = asyncComputed(() => {
      return api.getCollocationList({
        year: refreshQuery.year || undefined,
        keyword: refreshQuery.keyword,
        type: refreshQuery.type || "",
        profession: dressingStore.currentProfessionName
      });
    }, []);

    const list = computed(() => {
      return allList.value.slice(0, (loadQuery.page + 1) * 5);
    });

    const types = asyncComputed(() => {
      return api.getCollocationTypes();
    }, []);

    const years = asyncComputed(() => {
      return api.getCollocationYears();
    }, []);

    function imports(collocation: Collocation) {
      return () => {
        const { profession, code } = collocation;
        gtag("event", "select_template", collocation);
        const query = queryString.parse(code);
        emit("import", { name: profession, query });
        window.scrollTo(0, 0);
      };
    }

    function exports({ profession, code }: Collocation) {
      return () => emit("export", `${profession}?${code}`);
    }

    function style(item: Collocation) {
      return {
        backgroundImage: `url("/cover/${item.id}.png")`,
        height: "calc(100% - 48px)"
      };
    }

    /**
       * 当元素进入视口时，移除lazy-bg 显示背景图
       * @param param0
       */
    function onIntersectionObserver([{ isIntersecting, target }]: IntersectionObserverEntry[]): void {
      if (isIntersecting) {
        target.classList.remove("lazy-bg");
      }
    }

    const actionRef = ref<HTMLElement>();

    const virtualListStyle = computed(() => {
      return {
        height: `calc(100% - ${actionRef.value?.getBoundingClientRect().height}px)`
      };
    });

    return () => {
      return (
        <div class="flex flex-col h-full">
          <div class="flex flex-col px-4" ref={actionRef}>
            <div class=" mx-auto my-5 sm:mx-0">
              <apt-input action-icon="search" class="rounded-1 h-8 w-60" placeholder="搜索" v-model={refreshQuery.keyword} onKeyup_native={refresh}></apt-input>
            </div>
            <apt-indices class="my-2" v-model={refreshQuery.type}>
              <HiItem label="全部" value={0} />
              {renderList(types.value, type => (
                <HiItem key={type.name} label={type.label} text-dark="black" value={type.name}></HiItem>
              ))}
            </apt-indices>
            <apt-indices class="my-2" v-model={refreshQuery.year}>
              <HiItem value={0}>全部</HiItem>
              {renderList(years.value, year => (
                <HiItem key={year} label={`${year}年`} value={year} />
              ))}
            </apt-indices>
          </div>
          <VirtualListVue class="min-h-58 grid duration-300 overflow-x-hidden overflow-y-auto collocation-list clear-scroll grid-cols-[repeat(auto-fill,140px)]" style={virtualListStyle.value}>
            {renderList(list.value, (item, index) => (
              <div class="py-3 duration-400 item relative box-border hover:bg-dark-24" key={index} style={itemStyle} title={item.description}>
                <div class="bg-bottom bg-no-repeat w-full top-0 z-0 absolute lazy-bg" style={style(item)} v-intersection-observer={[onIntersectionObserver, ".collocation-list"]}></div>
                <div class="h-full w-full z-1 relative">
                  <div class="h-6 text-xs text-center text-dark w-full bottom-3 leading-6 name overflow-hidden whitespace-nowrap">{item.name}</div>
                  <div class="text-sm text-white text-center w-full block invisible info">
                    <div>
                      <span>作者:</span>
                      <span class="text-primary">{item.author}</span>
                    </div>
                    <div>
                      <span>热度:</span>
                      <span>{item.amount}</span>
                    </div>

                    <div class="flex flex-col mx-auto items-center">
                      <apt-button class=" bg-white rounded mt-4 hover:bg-primary-78 hover:text-white" onClick={imports(item)}>
                        {item.custom ? "下载" : "导入"}
                      </apt-button>
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
          </VirtualListVue>
        </div>
      );
    };
  }
});
</script>

<style lang="less" scoped>
  .collocation-list {
    height: var(--collocation-list-height);

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
