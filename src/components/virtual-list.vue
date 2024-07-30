<script lang="tsx">
// 写一个虚拟列表组件
import { defineComponent, renderSlot } from "vue";

export default defineComponent({
  emits: ["load"],
  setup(props, { emit, slots }) {
    function onScroll() {
      // 触发load事件
      emit("load");
    }

    return () => {
      return (
        <div onScroll={onScroll} class="virtual-list">
          {renderSlot(slots, "default")}
        </div>
      );
    };
  }
});
</script>
