import { defineComponent, h, renderSlot } from "vue"
import { itemProps, useSelectionItem } from "./hooks/selection/item"

export default defineComponent({
	name: "i-item",
	props: itemProps,
	setup(props, { slots }) {
		const { itemClass, change, current } = useSelectionItem(props)

		return () => (
			<div onClick={change} class={itemClass.value}>
				{current.value.key ?? renderSlot(slots, "default")}
			</div>
		)
	}
})
