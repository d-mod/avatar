<script lang="tsx">
  import { useDark, useToggle, useVModel } from "@vueuse/core";
  import type { CSSProperties } from "vue";
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
    emits: ["apply"],
    setup(props, { emit }) {
      const store = useDressingStore();

      const isCollapsed = useVModel(props, "collapsed", emit);

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

      function changeProfession(prof: Profession) {
        emit("apply", prof);

        gtag("event", "select-profession", { label: prof.label, name: prof.name });
        if (props.isMobile) {
          toggle(true);
        }
      }

      return () => {
        return (
          <apt-selection
            value={store.profession}
            onChange={changeProfession}
            item-class="odd:flex-row-reverse text-sm flex-1 h-12 flex items-center cursor-pointer select-none  duration-200 relative"
            active-class="text-primary bg-primary-36"
            class={["h-100vh overflow-y-auto fixed left-0 top-0 bg-light float-left  text-dark duration-300 shadow z-999"].concat(isCollapsed.value ? "w-12" : "sm:w-64 w-full")}
          >
            <apt-button title={isCollapsed.value ? "展开" : "收起"} class=" font-bold h-8 text-center text-xl w-full duration-300 select-none" onClick={() => toggle()}>
              <div class={isCollapsed.value ? "icon-mdi-add" : "icon-mdi-baseline-minus"} />
            </apt-button>

            {renderList(store.profession_list ?? [], (prof, index) => (
              <apt-item title={prof.label} key={index} value={prof} class={["hover:text-primary hover:bg-primary-12"].concat(isCollapsed.value ? "justify-center" : "px-8")}>
                <div class={!isCollapsed.value && "absolute"} style={profIcon(index)}></div>
                <div class="flex-1 text-center" v-show={!isCollapsed.value}>
                  {prof.label}
                </div>
              </apt-item>
            ))}

            <apt-button title={isDark.value ? "浅色模式" : "深色模式"} onClick={() => toggleDark()} class="font-bold text-xl  w-full duration-300 select-none">
              <div class={["w-6 h-6 bg-center bg-no-repeat text-dark"].concat(isDark.value ? "icon-mdi-outline-dark-mode" : "icon-mdi-outline-light-mode")}></div>
            </apt-button>
          </apt-selection>
        );
      };
    }
  });
</script>

<style lang="scss" scoped></style>
