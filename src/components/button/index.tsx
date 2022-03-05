/**
 * @Author: Kritsu
 * @Date:   2021/11/16 23:07:51
 * @Last Modified by:   Kritsu
 * @Last Modified time: 2021/11/17 18:49:42
 */
import { computed, defineComponent, h, renderSlot } from "vue"
import { RouterLink } from "vue-router"
import "./style.scss"

export default defineComponent({
	name: "i-button",
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
					return "bg-primary text-white hover:bg-primary-78"
				case "outline":
					return "bg-light rounded-sm border-primary border-1 border-soild text-primary hover:text-light hover:bg-primary-78"
				case "normal":
				default:
					return "bg-light rounded-sm text-primary hover:bg-primary-12"
			}
		})

		return () => {
			return h(
				//@ts-ignore
				!!props.to ? RouterLink : "button",
				{
					to: props.to,
					class: {
						"i-button select-none outline-none": true,
						disabled: props.disabled,
						small: props.small,
						[typeClass.value]: true
					}
				},
				renderSlot(slots, "default")
			)
		}
	}
})
