<script lang="tsx">
	import { useVModel } from "@vueuse/core"
	import { defineComponent, renderSlot } from "vue"
	import { valuePropType } from "../../hooks/selection/types"
	import ISelection from "../selection/index.vue"

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
		setup(props, { slots }) {
			const modelValue = useVModel(props, "modelValue")
			return () => {
				return (
					<i-selection
						v-model={modelValue.value}
						class="flex flex-wrap"
						active-class="text-white bg-primary-72 hover:bg-primary-62 rounded-1"
						unactive-class="text-dark hover:bg-primary hover:text-primary hover:bg-primary-12"
						item-class="mr-2 py-1 px-2 text-center text-sm  duration-300 cursor-pointer"
					>
						{renderSlot(slots, "default")}
					</i-selection>
				)
			}
		}
	})
</script>
