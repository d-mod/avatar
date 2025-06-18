<script lang="tsx">
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "IInput",
  props: {
    modelValue: {
      type: String
    },
    placeholder: {
      type: String
    },
    multiline: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const modelValue = computed<string>({
      get() {
        return props.modelValue ?? "";
      },
      set(val) {
        emit("update:modelValue", val);
      }
    });

    function onInput(e: Event) {
      const el = e.target as HTMLElement;
      if (el) {
        modelValue.value = el.textContent ?? "";
      }
    }

    const className = "bg-light border-solid rounded-md outline-none  border-1 border-hex-c0c0c0 h-7 break-all text-dark py-1 px-2 w-50 i-input box-border focus:border-primary focus:text-primary";

    return () => {
      return props.multiline
        ? (
            <div class={className} contenteditable placeholder={props.placeholder} onInput={onInput}>
              {modelValue.value}
            </div>
          )
        : (
            <input class={className} placeholder={props.placeholder} v-model={modelValue.value} />
          );
    };
  }
});
</script>

<style lang="scss"></style>
