<script lang="tsx">
import type { CSSProperties } from "vue";
import { useDark, useToggle, useVModel } from "@vueuse/core";
import { HiItem, HiSelection } from "hoci";
import { cls } from "tslx";
import { defineComponent, renderList } from "vue";
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
      const prof = dressingStore.professionList.find((item) => item.name === name);
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
          active-class="text-primary bg-primary/24"
          class={cls(
            "h-full pt-2 fixed left-0 top-0 bottom-0 bg-light float-left space-y-1 text-dark duration-300 shadow z-999 overflow-hidden overflow-y-auto",
            isCollapsed.value ? "w-12" : "sm:w-64 w-full px-4"
          )}
          item-class="odd:flex-row-reverse text-sm flex-1 h-12 flex items-center cursor-pointer select-none  duration-200 relative hover:text-primary hover:bg-primary/12"
          modelValue={dressingStore.currentProfessionName}
          onChange={changeProfession}
        >
          <apt-button class="min-h-8 w-full select-none bg-transparent text-center text-xl font-bold duration-300" title={isCollapsed.value ? "展开" : "收起"} onClick={() => toggle()}>
            <div class={isCollapsed.value ? "icon-mdi-add" : "icon-mdi-baseline-minus"} />
          </apt-button>

          {renderList(dressingStore.professionList, (prof, index) => (
            <HiItem class={isCollapsed.value ? "justify-center" : "px-8 rounded"} key={index} value={prof.name}>
              <div
                class={cls({
                  absolute: !isCollapsed.value
                })}
                style={profIcon(index)}
              >
              </div>
              <div class="flex-1 text-center" v-show={!isCollapsed.value}>
                {prof.label}
              </div>
            </HiItem>
          ))}

          <apt-button class="w-full select-none bg-transparent text-xl font-bold duration-300" title={isDark.value ? "浅色模式" : "深色模式"} onClick={() => toggleDark()}>
            <div class={cls(["w-6 h-6 bg-center bg-no-repeat text-dark"], isDark.value ? "icon-mdi-outline-dark-mode" : "icon-mdi-outline-light-mode")}></div>
          </apt-button>
        </HiSelection>
      );
    };
  }
});
</script>

<style lang="less" scoped></style>
