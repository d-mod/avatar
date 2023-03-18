<script lang="tsx">
  import qs from "query-string";
  import { computed, defineComponent, reactive, ref, renderList, watch } from "vue";

  import { useMediaQuery, useScroll, useSwipe } from "@vueuse/core";
  import { useRoute } from "vue-router";
  import Profession from "./profession.vue";
  import CollocationVue from "./collocation.vue";
  import FooterVue from "./footer.vue";
  import DEFAULT_SRC from "@/assets/default.png";
  import EMPTY_SRC from "@/assets/empty.png";

  import CanvasBox from "@/components/canvas-box.vue";

  import { useDressingStore } from "@/store";
  import api from "@/api";

  export default defineComponent({
    name: "App",
    components: {
      CanvasBox,
      Profession
    },
    setup() {
      const code_query = reactive<CodeQuery>({
        part: "skin"
      });
      const isMobile = useMediaQuery("(max-width: 640px)");

      const canvas_props = computed(() => {
        return {
          scale: 100,
          width: 240,
          height: 240
        };
      });

      const store = useDressingStore();

      //   const $weapon_list = computed(() => store.profession?.weapons || []);
      //   const $weapon = computed(() => $weapon_list.value.find(e => e.name === code_query.weapon));

      const current_part = computed(() => {
        let part = code_query.part;
        if (part === "weapon" && !!code_query.weapon) {
          part = code_query.weapon;
        }
        return part;
      });

      const scale = computed(() => canvas_props.value.scale / 100);

      const keyword = ref("");

      const icons = ref<DressIcon[]>([]);

      const weapon = ref("");

      const images = computed(() => {
        const profession_name = store.profession_name;

        const images: DressImage[] = [];
        for (const part in store.parts) {
          const array = store.parts[part].images || [];
          let p: string | undefined = part;
          if (p === "weapon") {
            p = code_query.weapon;
          }
          if (!p) {
            continue;
          }
          array.forEach(e => (e.url = `/image/${profession_name}/${p}/${e.name}`));
          images.push(...array);
        }

        return images;
      });

      const dress_list = ref<Dress[]>([]);

      function validateCode(code: string) {
        return !!code && parseInt(code) > -1;
      }

      /**
       *
       * 图标加载出错的处理
       *
       */
      function error(event: Event) {
        // 如果图标不存在,则使用默认图标
        if (event && event.target) {
          const image = event.target as HTMLImageElement;
          image.setAttribute("data-src", image.src);
          image.src = DEFAULT_SRC;
        }
      }

      // function handleSelect(value: any, item: Dress) {
      //   keyword.value = item.name;
      //   selectDress(item);
      // }

      function label(item: Dress) {
        return `${item.name || ""}[${item.code}]`;
      }

      function style(item: Dress) {
        const name = `${item.part}/${item.code}.png`;

        const index = icons.value.findIndex(e => e.name === name);
        if (index > -1) {
          const info = icons.value[index];
          return {
            backgroundImage: `url("/icon/${item.profession}/${item.part}.png")`,
            backgroundPositionX: `${info.x}px`,
            backgroundPositionY: `${info.y}px`
          };
        }

        return {
          backgroundImage: `url("${DEFAULT_SRC}") `
        };
      }

      function partStyle(index: number) {
        let x = 40;
        let y = 40;
        const step = 28 + 40;
        x += Math.floor(index / 3) * step;
        y += (index % 3) * step;
        return {
          top: `${x}px`,
          left: `${y}px`,
          backgroundImage: `url(${EMPTY_SRC})`
        };
      }

      const keyword_list = computed(() => keyword.value.split(" ").filter(e => e.length > 0));

      const show_list = computed(() => {
        let list: Dress[] = [];
        if (keyword_list.value.length === 0) {
          list = Array.from(dress_list.value);
        } else {
          list = dress_list.value.filter(match);
        }
        list.sort((a, b) => parseInt(a.code) - parseInt(b.code));
        return list;
      });

      /**
       *
       * 匹配符合条件的时装
       *
       */
      function match(item: Dress) {
        const keywords = keyword_list.value;
        for (const keyword of keywords) {
          if ((item.name && item.name.match(keyword)) || item.code.match(keyword)) {
            continue;
          }
          if (item.name && item.name.includes(keyword)) {
            continue;
          }
          if (item.code.includes(keyword)) {
            continue;
          }
          return false;
        }
        return true;
      }

      function isActive(dress: Dress) {
        const { code, part } = dress;
        return !!part && code === store.parts[part].code;
      }

      const loading = ref(false);

      /**
       *
       * 加载时装
       *
       */
      async function apply({ name, query = {} }: CodeTemplate = {}) {
        if (isMobile.value) {
          backTop();
        }
        for (const p in store.parts) {
          // 如果该部位为武器,则替换为具体的武器子类
          if (!query[p]) {
            // 如果参数中不存在该部位代码,则重置该部位
            reset(p);
          }
        }
        if (!name) {
          return;
        }
        // 切换职业
        store.setProfessionName(name);
        await refresh();
        // 获取每个部位的时装信息
        const list = await store.getDress(name, query);
        const tasks = list.map(async item => await selectDress(item));
        await Promise.all(tasks);
      }

      /**
       *
       * 刷新
       *
       */
      async function refresh() {
        const part = current_part.value;
        const profession = store.profession_name;

        // 根据职业和部位,获取时装列表
        const [icon_data, dress_data] = await Promise.all([
          api.getDressIcons({
            profession,
            part
          }),
          api.getDressList({
            profession,
            part
          })
        ]);
        icons.value = icon_data;
        dress_list.value = dress_data;
      }

      /**
       *
       * 选择部位
       *
       */
      async function selectPart(part: string) {
        if (code_query.part !== part) {
          code_query.part = part;
          await refresh();
        }
      }
      /**
       *
       * 选择时装
       *
       */
      async function selectDress(item: Dress) {
        let { part } = item;

        const num = Number(item.code);
        if (isNaN(num) || num === -1) {
          reset(part);
          return;
        }
        if (!part || !store.parts[part]) {
          // 确认具体的子武器种类
          part = "weapon";
        }
        store.parts[part] = Object.assign({ title: store.parts[part].title }, item);
      }

      function onContextmenu(part: string) {
        return (e: Event) => {
          e.preventDefault();
          reset(part);
        };
      }

      /**
       * 重置部位
       *
       */
      function reset(part: string) {
        store.parts[part] = createDefault(part);
      }

      async function clear() {
        await apply(store.profession);
      }

      const showDialog = reactive({
        imports: false,
        exports: false
      });

      const copy_success = ref(false);

      const code = ref("");

      const code_regex = /.*\?(.*=&)*/;

      /**
       * 导入时装代码
       */
      async function imports() {
        try {
          const text = await navigator.clipboard.readText();
          if (text.match(code_regex)) {
            code.value = text;
          }
        } finally {
          showDialog.imports = true;
        }
      }

      async function imports_done() {
        const text = code.value;
        window.scrollTo(0, 0);
        if (text.match(code_regex)) {
          let index = text.indexOf("?");
          if (index < 0) {
            index = text.length - 1;
          }
          const name = text.slice(0, index);
          const suffix = text.slice(index + 1);
          const query = qs.parse(suffix) as Record<string, string>;

          await apply({ name, query });
        }
      }

      async function exports(result?: string) {
        if (!result) {
          const name = store.profession_name;
          const query: Record<string, string> = {};
          for (const p in store.parts) {
            const { code } = store.parts[p];
            if (validateCode(code)) {
              const part = (p === "weapon" ? weapon.value : p) || p;
              query[part] = code;
            }
          }
          result = `${name}?${qs.stringify(query)}`;
        }
        code.value = result;
        copy_success.value = true;
        try {
          await navigator.clipboard.writeText(result);
        } catch {
          copy_success.value = false;
        } finally {
          showDialog.exports = true;
        }
        // Snackbar({ content: "导出成功，已复制到剪贴板", type: "success" })
      }

      const route = useRoute();

      store.loadProfession().then(async () => {
        let { path: name } = route;
        let query = route.query as Record<string, string>;
        name = name.replace("/", "");
        if (Object.keys(query).length === 0) {
          query = store.profession?.query ?? {};
        }

        let item: CodeTemplate = {};
        if (name?.length) {
          // 如果路由带有参数,则自动载入代码
          item = { name, query };
        } else if (store.profession) {
          // 如果没有则载入默认的职业装扮
          item = store.profession;
        }
        await apply(item);
      });

      const isCollapsed = ref(true);

      const { isSwiping, direction } = useSwipe(document.documentElement);

      watch(isSwiping, val => {
        if (val) {
          switch (direction.value) {
            case "LEFT":
              isCollapsed.value = true;
              return;
            case "RIGHT":
              isCollapsed.value = false;
          }
        }
      });

      const mainContainer = ref<HTMLElement>();
      const { y } = useScroll(mainContainer, { behavior: "smooth" });

      const showBackTop = computed(() => y.value > screen.availHeight / 2);

      function backTop() {
        y.value = 0;
      }

      return () => {
        return (
          <div class="bg-neutral h-full overflow-hidden">
            <Profession is-mobile={isMobile.value} v-model:collapsed={isCollapsed.value} onApply={apply} />
            <div ref={mainContainer} class={["duration-300 h-full overflow-hidden lt-sm:overflow-y-auto pt-6 pr-4"].concat(isCollapsed.value ? "pl-16" : "sm:pl-72")}>
              <div class={["flex duration-300 lt-sm:flex-wrap  overflow-hidden bg-light shadow h-[calc(100%-5rem)] lt-sm:h-auto"]}>
                <div class={isMobile.value ? "w-full" : "w-1/2"}>
                  <div
                    class={"flex h-16 items-center justify-center duration-300 transition"
                      .concat(" ")
                      .concat(
                        y.value > 48
                          ? "z-99 fixed  bg-light shadow-md top-0 ".concat(" ").concat(isCollapsed.value ? "w-[calc(100%-3rem)] left-12" : "sm:w-[calc(100%-16rem)] sm:left-64")
                          : "w-full my-4 bg-transparent"
                      )}
                  >
                    <div class="flex space-x-1 border-1 rounded-1 overflow-hidden items-center">
                      <apt-button class="cursor-pointer border-#f1f2f3" title="重置" onClick={clear} size="normal" color="gray">
                        <div class="text-xl icon-mdi-refresh"></div>
                      </apt-button>
                      <apt-button class="cursor-pointer border-#f1f2f3" title="导入" onClick={imports} size="normal">
                        导入
                      </apt-button>
                      <apt-button class="cursor-pointer border-#f1f2f3" onClick={() => exports()} title="导出" type="info" size="normal">
                        导出
                      </apt-button>
                    </div>
                  </div>

                  <div class="flex justify-center items-center">
                    <CanvasBox
                      class={!isMobile.value ? "border-blue-200 border-solid border-1" : ""}
                      loading={loading.value}
                      height={canvas_props.value.height}
                      width={canvas_props.value.width}
                      images={images.value}
                      scale={scale.value}
                    ></CanvasBox>
                    <div class="h-60 w-60 duration-300 lt-sm:h-auto relative">
                      {renderList(store.parts, (value, part, index) => (
                        <div
                          onClick={() => selectPart(part)}
                          onContextmenu={onContextmenu(part)}
                          key={part}
                          style={partStyle(index)}
                          class={["text-dark", "text-xs", "absolute", "lt-sm:static", "w-8", "h-8", "m-1", "border-2", "border-solid", "box-border", "hover:scale-130", "lt-sm:hover:scale-100"].concat(
                            part === code_query.part ? "border-#ff4081" : "border-transparent"
                          )}
                        >
                          {validateCode(value.code) ? (
                            <img class="flex h-7 m-0  w-7 duration-100 select-none " src={value.icon ?? DEFAULT_SRC} title={label(value)} onError={error} draggable="false" />
                          ) : (
                            <div class="flex h-7 m-0 text-xs  text-green-200 w-7  duration-100 items-center justify-center select-none" title={value.title}>
                              {value.title}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div class="bg-hex-ccc h-1px my-4 w-full scale-y-50"></div>
                  <div class="h-auto justify-end overflow-hidden sm:h-100">
                    <div class="flex h-12 items-center justify-center">
                      <apt-input class="rounded-1 h-8 w-60" placeholder="搜索" v-model={keyword.value}></apt-input>
                    </div>
                    <div class=" h-75  w-full grid grid-cols-12 overflow-y-auto overflow-x-hidden lt-sm:grid-cols-6 ">
                      <span
                        onClick={() => reset(code_query.part)}
                        class="border-solid border-transparent border-2 h-8 m-3 text-xs text-dark w-8 duration-100 box-border select-none lt-sm:scale-100 hover:scale-130"
                        style={`background-image:url(${DEFAULT_SRC})`}
                      ></span>
                      {renderList(show_list.value, dress => (
                        <span
                          class={["w-8 h-8 border-2 border-solid box-border select-none text-xs text-dark m-3 hover:scale-130 lt-sm:scale-100  duration-100"].concat(
                            isActive(dress) ? "border-primary" : "border-transparent"
                          )}
                          key={dress.hash}
                          style={style(dress)}
                          title={label(dress)}
                          onClick={() => selectDress(dress)}
                        ></span>
                      ))}
                    </div>
                  </div>
                </div>
                <CollocationVue class="w-1/2 lt-sm:w-full" onExport={exports} onImport={apply} />
                <apt-button onClick={backTop} v-show={showBackTop.value} class="rounded-full bg-12 h-12 right-4 bottom-4 w-12 z-8 fixed overflow-hidden" type="primary">
                  <div class="text-xl icon-mdi-arrow-upward"></div>
                </apt-button>
              </div>
              <FooterVue />
            </div>

            <apt-dialog class="w-80 relative" cancel-button={false} v-model:visible={showDialog.exports}>
              <div class="font-bold h-12 text-dark w-full leading-12">导出</div>
              <div v-show={!copy_success.value} class="text-red-400">
                复制失败,请自行复制到剪贴板
              </div>
              <div class=" text-primary text-sm break-all select-all">{code.value}</div>
            </apt-dialog>
            <apt-dialog onOk={imports_done} class="p-4 w-80" v-model:visible={showDialog.imports}>
              <div class="font-bold h-12 text-dark w-full leading-12">导入</div>
              <apt-input multiline v-model={code.value} placeholder="请输入代码" class="h-auto text-sm w-full word-wrap"></apt-input>
            </apt-dialog>
          </div>
        );
      };
    }
  });

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
  };

  function createDefault(part: string): PartValue {
    return {
      name: "",
      part,
      icon: EMPTY_SRC,
      images: [],
      code: "-1",
      title: part_titles[part]
    };
  }
</script>

<style scoped lang="less"></style>
