<script lang="tsx">
  import { asyncComputed, useDark, useToggle, useVModel, watchOnce } from "@vueuse/core";
  import type { CSSProperties } from "vue";
  import { defineComponent, renderList } from "vue";
  import { HiItem, HiSelection } from "hoci";
  import api from "@/api";
  import { useDressingStore } from "@/store";

  export default defineComponent({
    props: {
      collapsed: {
        type: Boolean,
        default: () => true
      },
      isMobile: {
        type: Boolean,
        default: () => false
      }
    },
    emits: ["apply", "update:collapsed"],
    setup(props, { emit }) {
      const isCollapsed = useVModel(props, "collapsed", emit);
      const dressingStore = useDressingStore();

      const list = asyncComputed(() => {
        return api.getProfessionList();
      }, []);

      watchOnce(list, () => {
        dressingStore.setProfession(list.value[0]);
      });

      const toggle = useToggle(isCollapsed);

      function profIcon(index: number): CSSProperties {
        return {
          width: "26px",
          height: "26px",
          backgroundImage: "url('/icon/profession.png')",
          backgroundPositionX: `-${index * 26}px`,
          backgroundPositionY: `${0}px`
        };
      }

      const isDark = useDark({
        selector: "html",
        attribute: "data-theme",
        valueLight: "light",
        valueDark: "dark"
      });

      const toggleDark = useToggle(isDark);

      function changeProfession(name: string) {
        const prof = list.value.find(item => item.name === name);
        if (prof) {
          emit("apply", prof);
          gtag("event", "select-profession", { label: prof.label, name: prof.name });
          if (props.isMobile) {
            toggle(true);
          }
        }
      }

      return () => {
        return (
          <HiSelection
            modelValue={dressingStore.profession_name}
            onChange={changeProfession}
            item-class="odd:flex-row-reverse text-sm flex-1 h-12 flex items-center cursor-pointer select-none  duration-200 relative hover:text-primary hover:bg-primary-12"
            active-class="text-primary bg-primary-24"
            class={["h-full pt-2 fixed left-0 top-0 bottom-0 bg-light float-left space-y-1 text-dark duration-300 shadow z-999 overflow-hidden lt-sm:overflow-y-auto"].concat(
              isCollapsed.value ? "w-12" : "sm:w-64 w-full px-4"
            )}
          >
            <apt-button title={isCollapsed.value ? "展开" : "收起"} class=" bg-transparent font-bold text-center text-xl min-h-8 w-full duration-300 select-none" onClick={() => toggle()}>
              <div class={isCollapsed.value ? "icon-mdi-add" : "icon-mdi-baseline-minus"} />
            </apt-button>

            {renderList(list.value, (prof, index) => (
              <HiItem title={prof.label} key={index} value={prof.name} class={isCollapsed.value ? "justify-center" : "px-8 rounded"}>
                <div class={!isCollapsed.value && "absolute"} style={profIcon(index)}></div>
                <div class="flex-1 text-center" v-show={!isCollapsed.value}>
                  {prof.label}
                </div>
              </HiItem>
            ))}

            <apt-button title={isDark.value ? "浅色模式" : "深色模式"} onClick={() => toggleDark()} class="bg-transparent font-bold  text-xl w-full duration-300 select-none">
              <div class={["w-6 h-6 bg-center bg-no-repeat text-dark"].concat(isDark.value ? "icon-mdi-outline-dark-mode" : "icon-mdi-outline-light-mode")}></div>
            </apt-button>
          </HiSelection>
        );
      };
    }
  });
</script>

<style lang="less" scoped></style>
