import { classPropType, valuePropType } from "./types"
import { computed, provide, ref, SetupContext, ComponentPropsOptions, Ref } from "vue"
import { AciveClassSymbol, AciveSymbol, InitSymbol, ItemClassSymbol, ModelValueSymbol, Option, UnactiveSymbol } from "./constants"

export const listProps: ComponentPropsOptions = {
	value: {
		type: valuePropType,
		default: () => null
	},
	modelValue: {
		type: valuePropType,
		default: () => null
	},
	defaultValue: {
		type: valuePropType,
		default: () => null
	},
	activeClass: {
		type: classPropType
	},
	itemClass: {
		type: classPropType
	},
	unactiveClass: {
		type: classPropType
	}
}

export function useSelectionList(props: Readonly<any>, context: SetupContext) {
	const current = ref<Option>()

	const modelValue = computed(() => props.value ?? props.modelValue)

	const active = computed<Option | undefined>({
		set(val: Option | undefined) {
			context.emit("update:modelValue", val?.value)
			context.emit("change", val?.value)
			current.value = val
		},
		get() {
			return options.find(e => e.value.value == modelValue.value)?.value ?? current.value
		}
	})

	provide(ModelValueSymbol, modelValue)

	provide(AciveSymbol, active)

	provide(
		AciveClassSymbol,
		computed(() => props.activeClass)
	)

	provide(
		UnactiveSymbol,
		computed(() => props.unactiveClass)
	)

	provide(
		ItemClassSymbol,
		computed(() => props.itemClass)
	)

	const options: Ref<Option>[] = []

	provide(InitSymbol, (option: Ref<Option>) => {
		options.push(option)
		if (option.value.value == modelValue.value || active.value == undefined) {
			current.value = option.value
		}
		return () => {
			options.splice(options.indexOf(option), 1)
		}
	})

	return {
		active,
		modelValue
	}
}
