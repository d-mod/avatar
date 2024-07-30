<script lang="tsx">
import { useVModel } from "@vueuse/core";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    loading: {
      type: Boolean,
      default: () => false
    },
    spinClass: {
      type: String,
      default: () => "n-loading-default-spin text-primary"
    }
  },
  setup(props) {
    const loading = useVModel(props, "loading");
    return () => {
      return (
        <div class={"bg-light h-full w-full z-99 absolute items-center justify-center".concat(" ").concat(loading.value ? "flex" : "hidden")}>
          <div class={props.spinClass}></div>
        </div>
      );
    };
  }
});
</script>

<style lang="scss">
  .n-loading-default-spin {
    border: 4px solid transparent;
    border-radius: 50%;
    border-top: 4px solid currentColor;
    width: 48px;
    height: 48px;
    animation: spin 1.2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
