import type { PropType } from "vue";
import { computed, inject, onDeactivated, renderSlot, watch } from "vue";
import { defineHooks } from "../define";
import type { BaseType, ElementLike } from "../types";
import { valuePropType } from "../types";
import { ActiveClassSymbol, ChangeActiveSymbol, InitSymbol, IsActiveSymbol, ItemClassSymbol, ItemLabelSymbol, UnactiveSymbol } from "./constants";

export const itemProps = {
  value: {
    type: valuePropType,
    default() {
      return Math.random().toString(16).slice(2);
    }
  },
  label: {
    type: [Function, String] as PropType<string | ((val: BaseType) => string) | ElementLike | null>
  },
  keepAlive: {
    type: Boolean,
    default: () => true
  },
  key: {
    type: [String, Number, Symbol] as PropType<string | number | symbol>
  }
};

export const useSelectionItem = defineHooks(itemProps, (props, { slots }) => {
  const parentLabel = inject(ItemLabelSymbol);

  function render() {
    return renderSlot(slots, "default", {}, () => {
      let label = props.label ?? parentLabel;
      if (label) {
        if (typeof label == "function") {
          label = label(props.value)!;
        }
      }
      return Array.isArray(label) ? label : [label];
    });
  }

  let remove = () => {};
  const init = inject(InitSymbol);
  if (init) {
    watch(
      () => props.value,
      value => {
        remove();
        remove = init({
          id: Math.random().toString(16).slice(2),
          label: typeof props.label == "string" ? props.label : undefined,
          value,
          render
        });
      },
      { immediate: true }
    );
    onDeactivated(() => remove());
  }

  const isActive = inject(IsActiveSymbol, (_: BaseType) => false);

  const changeActive = inject(ChangeActiveSymbol, (_: BaseType) => false);

  const activeClass = computed(() => inject(ActiveClassSymbol)?.value ?? "active");
  const unactiveClass = computed(() => inject(UnactiveSymbol)?.value ?? "unactive");

  const itemClass = computed(() => {
    return [inject(ItemClassSymbol)?.value ?? ""].concat(isActive(props.value) ? activeClass.value : unactiveClass.value);
  });

  return {
    change() {
      changeActive(props.value);
    },
    render,
    isActive,
    activeClass,
    unactiveClass,
    itemClass
  };
});

export interface ItemProps {}
