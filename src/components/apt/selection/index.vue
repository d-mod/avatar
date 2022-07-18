<script lang="tsx">
	import { defineComponent, renderSlot } from "vue"

	import { listProps, useSelectionList } from "../../hooks/selection/list"

	export default defineComponent({
		name: "i-selection",
		props: listProps,
		setup(props, context) {
			useSelectionList(props, context)
			const { slots } = context
			return () => {
				return <div>{renderSlot(slots, "default")}</div>
			}
		}
	})
</script>
