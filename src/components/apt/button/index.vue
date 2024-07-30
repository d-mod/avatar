<script lang="tsx">
/**
 * @Author: chizuki
 * @Date:   2021/11/16 23:07:51
 * @Last Modified by:   chizuki
 * @Last Modified time: 2021/11/17 18:49:42
 */
import { computed, defineComponent, h, renderSlot } from "vue";

export default defineComponent({
  name: "IButton",
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    to: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: "normal"
    }
  },
  setup(props, { slots }) {
    const typeClass = computed(() => {
      switch (props.type) {
        case "primary":
          return "bg-primary text-white hover:bg-primary/78";
        case "outline":
          return "rounded-sm border-primary border-1 border-solid text-primary hover:text-light hover:bg-primary/78";
        case "normal":
        default:
          return "rounded-sm bg-thin text-primary hover:bg-primary/12";
      }
    });

    return () => {
      return h(
        "button",
        {
          class: {
            "i-button select-none outline-none": true,
            "disabled": props.disabled,
            "small": props.small,
            [typeClass.value]: true
          }
        },
        renderSlot(slots, "default")
      );
    };
  }
});
</script>

<style lang="scss">
  /**
 * @Author: chizuki
 * @Date:   2021/11/16 23:09:01
 * @Last Modified by:   chizuki
 * @Last Modified time: 2021/11/17 18:02:58
 */

  .i-button {
    outline: none;
    width: 80px;
    height: 32px;
    line-height: 32px;

    font-size: 12px;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    user-select: none;

    &.disabled {
      color: #696969;
      background: linear-gradient(#353535, #1c1c1c);
      border: 1px solid #414141;
      border-radius: 4px;
    }

    &.small {
      min-width: 60px;
      height: 24px;
      line-height: 24px;
      font-size: 12px;
    }

    &.outline {
      border: 1px solid var(--color-primary);
    }
  }

  .i-href {
    display: block;
    text-decoration: none;
  }
</style>
