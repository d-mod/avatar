<script lang="tsx">
import type { Collocation } from "@/api/types";
import { vIntersectionObserver } from "@vueuse/components";
import { asyncComputed } from "@vueuse/core";
import { HiItem } from "hoci";
import queryString from "query-string";
import { computed, defineComponent, reactive, ref, renderList, shallowRef } from "vue";
import api from "@/api";
import VirtualListVue from "@/components/virtual-list.vue";
import { useDressingStore } from "@/store/dressing";

export default defineComponent({
  directives: {
    intersectionObserver: vIntersectionObserver
  },
  emits: ["import", "export"],
  setup(_, { emit }) {
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
     */
    function onIntersectionObserver([{ isIntersecting, target }]: IntersectionObserverEntry[]): void {
      if (isIntersecting) {
        target.classList.remove("lazy-bg");
      }
    }

    const actionRef = shallowRef<HTMLElement>();

    const virtualListStyle = computed(() => {
      return {
        height: `calc(100% - ${actionRef.value?.getBoundingClientRect().height}px)`
      };
    });

    return () => {
      return (
        <div class="h-full flex flex-col">
          <div class="flex flex-col px-4" ref={actionRef}>
            <div class="mx-auto my-5 sm:mx-0">
              <apt-input action-icon="search" class="h-8 w-60 rounded-1" placeholder="搜索" v-model={refreshQuery.keyword} onKeyup_native={refresh}></apt-input>
            </div>
            <apt-indices class="my-2" v-model={refreshQuery.type}>
              <HiItem label="全部" value={0} />
              {renderList(types.value, (type) => (
                <HiItem key={type.name} label={type.label} text-dark="black" value={type.name}></HiItem>
              ))}
            </apt-indices>
            <apt-indices class="my-2" v-model={refreshQuery.year}>
              <HiItem value={0}>全部</HiItem>
              {renderList(years.value, (year) => (
                <HiItem key={year} label={`${year}年`} value={year} />
              ))}
            </apt-indices>
          </div>
          <VirtualListVue class="collocation-list clear-scroll grid grid-cols-[repeat(auto-fill,140px)] min-h-58 overflow-x-hidden overflow-y-auto duration-300" style={virtualListStyle.value}>
            {renderList(list.value, (item, index) => (
              <div class="item hover:bg-dark-24 relative box-border py-3 duration-400" key={index} style={itemStyle} title={item.description}>
                <div class="lazy-bg absolute top-0 z-0 w-full bg-bottom bg-no-repeat" style={style(item)} v-intersection-observer={[onIntersectionObserver, ".collocation-list"]}></div>
                <div class="relative z-1 h-full w-full">
                  <div class="name bottom-3 h-6 w-full overflow-hidden whitespace-nowrap text-center text-xs text-dark leading-6">{item.name}</div>
                  <div class="info invisible block w-full text-center text-sm text-white">
                    <div>
                      <span>作者:</span>
                      <span class="text-primary">{item.author}</span>
                    </div>
                    <div>
                      <span>热度:</span>
                      <span>{item.amount}</span>
                    </div>

                    <div class="mx-auto flex flex-col items-center">
                      <apt-button class="hover:bg-primary-78 mt-4 rounded bg-white hover:text-white" onClick={imports(item)}>
                        {item.custom ? "下载" : "导入"}
                      </apt-button>
                      {!item.custom && (
                        <apt-button class="hover:bg-primary-78 mt-4 rounded bg-white hover:text-white" onClick={exports(item)}>
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
