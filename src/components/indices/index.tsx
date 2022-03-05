import { useVModel } from "@vueuse/core"
import { defineComponent, PropType, renderSlot, VNode } from "vue"
import { valuePropType } from "../hooks/selection/types"
import ISelection from "../selection"

export default defineComponent({
	name: "i-indices",
	components: { ISelection },
	props: {
		modelValue: {
			type: valuePropType
		},
		label: {
			type: String
		}
	},
	setup(props, { slots, emit }) {
		const modelValue = useVModel(props, "modelValue", emit)
		return () => {
			return (
				<i-selection
					v-model={modelValue.value}
					class="flex flex-wrap"
					active-class="text-white bg-primary-72 hover:bg-primary-62 rounded-1"
					unactive-class="text-dark hover:bg-primary hover:text-primary hover:bg-primary-12"
					item-class="mr-2 px-2 text-center h-8 leading-8 duration-300 cursor-pointer"
				>
					{renderSlot(slots, "default")}
				</i-selection>
			)
		}
	}
})
