import { computed, defineComponent } from "vue"
import "./style.scss"

export default defineComponent({
	name: "i-input",
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
	setup(props, { emit }) {
		const modelValue = computed({
			get() {
				return props.modelValue
			},
			set(val) {
				emit("update:modelValue", val)
			}
		})

		function onInput(e: Event) {
			const el = e.target as HTMLElement
			if (el) {
				modelValue.value = el.textContent
			}
		}

		return () => {
			return props.multiline ? (
				<div contenteditable class="i-input" placeholder={props.placeholder} v-text={modelValue.value} onInput={onInput}></div>
			) : (
				<input class="i-input" placeholder={props.placeholder} v-model={modelValue.value} />
			)
		}
	}
})
