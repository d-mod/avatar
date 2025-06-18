<script lang="tsx">
import { useVModel } from "@vueuse/core";
import { HiSelection } from "hoci";
import { defineComponent, renderSlot } from "vue";

export default defineComponent({
  name: "IIndices",
  props: {
    modelValue: {
      type: [String, Number]
    },
    label: {
      type: String
    }
  },
  setup(props, { slots }) {
    const modelValue = useVModel(props, "modelValue");
    return () => {
      return (
        <HiSelection
          v-model={modelValue.value}
          class="flex flex-wrap"
          active-class="text-white bg-primary/72 hover:bg-primary/62"
          unactive-class="text-dark hover:bg-primary hover:text-primary hover:bg-primary/12"
          item-class="mr-2 mb-1  rounded-1 py-1 px-2 text-center text-sm  duration-300 cursor-pointer"
        >
          {renderSlot(slots, "default")}
        </HiSelection>
      );
    };
  }
});
</script>
