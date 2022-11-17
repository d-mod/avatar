<script lang="tsx">
  /**
   * @Author: Chizuki
   * @Date:   2021/11/09 15:31:30
   * @Last Modified by:   Chizuki
   * @Last Modified time: 2021/11/17 18:49:23
   */
  import { onClickOutside } from "@vueuse/core";
  import { Teleport, Transition, computed, defineComponent, onDeactivated, ref, renderSlot, watch } from "vue";
  import { listProps, useSelectionList } from "../../hooks/selection/list";
  import { classPropType, labelPropType } from "@/components/hooks/types";

  export default defineComponent({
    name: "ISelect",
    props: {
      ...listProps,
      disabled: {
        type: Boolean,
        default: false
      },
      width: {
        type: Number,
        default: 120
      },
      emptyLabel: {
        type: labelPropType
      },
      labelClass: {
        type: classPropType,
        default: ""
      },
      inputClass: {
        type: classPropType,
        default: ""
      }
    },
    setup(props, context) {
      const { render } = useSelectionList(props, context);

      const isOpen = ref(false);
      const triggerRef = ref<HTMLElement>();

      watch(isOpen, onResize);

      const isDisabled = computed(() => !!props.disabled);

      function collapse() {
        isOpen.value = !isOpen.value && !isDisabled.value;
      }

      // 下拉框位置
      const dropdownPosition = ref({ x: 0, y: 0, w: 0 });
      // 下拉框位置
      const dropdownStyle = computed(() => {
        return {
          left: `${dropdownPosition.value.x}px`,
          top: `${dropdownPosition.value.y}px`,
          width: `${dropdownPosition.value.w}px`
        };
      });

      function onResize() {
        if (triggerRef.value) {
          const { width, height, left, top } = triggerRef.value.getBoundingClientRect();
          dropdownPosition.value = {
            w: width,
            x: left,
            y: top + height + 4
          };
        }
      }

      onClickOutside(triggerRef, () => (isOpen.value = false));

      window.addEventListener("resize", onResize);
      window.addEventListener("scroll", onResize);

      onDeactivated(() => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onResize);
      });

      return () => {
        const { slots } = context;
        function renderLabel() {
          const children = render();
          if (children) {
            if (!Array.isArray(children) || children.length > 0) {
              return <span class={["i-select-input"].concat(props.inputClass)}>{children}</span>;
            }
          }
          const emptyLabel = typeof props.emptyLabel == "function" ? props.emptyLabel() : props.emptyLabel;
          return <span class="w-full pl-2 i-select-input i-select-empty-label">{emptyLabel}</span>;
        }
        return (
          <div class="i-select" onClick={collapse} style={{ width: props.width === 0 ? 0 : `${props.width}px` }}>
            <div class={["i-select-trigger"].concat(props.disabled ? "disabled" : "")} ref={triggerRef}>
              <span class="i-select-label">{renderLabel()}</span>
              <div class="i-select-down-icon"></div>
            </div>
            <Teleport to="body">
              <Transition name="dropdown">
                <div class="i-select-dropdown" style={dropdownStyle.value} v-show={isOpen.value}>
                  {renderSlot(slots, "default")}
                </div>
              </Transition>
            </Teleport>
          </div>
        );
      };
    }
  });
</script>

<style lang="scss"></style>
