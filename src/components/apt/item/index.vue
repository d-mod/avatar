<script lang="tsx">
  import { defineComponent } from "vue";
  import { itemProps, useSelectionItem } from "@/components/hooks/selection/item";

  export default defineComponent({
    name: "IItem",
    props: itemProps,
    setup(props, context) {
      const { itemClass, change, render } = useSelectionItem(props, context);
      return () => (
        <div key={props.keepAlive && !props.key ? props.value?.toString() : props.key} onClick={change} class={itemClass.value}>
          {render()}
        </div>
      );
    }
  });
</script>
