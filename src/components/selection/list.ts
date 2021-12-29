import { computed, provide, ref, SetupContext, ComponentPropsOptions } from "vue"
import { AciveClassSymbol, AciveSymbol, InitSymbol, Option } from "./constants"

interface SelectionProps {
    activeClass: string
}

export const listProps: ComponentPropsOptions = {
    modelValue: {
        type: [String, Number, Object, Boolean]
    },
    activeClass: {
        type: String
    }
}

export function useSelectionList(props: Readonly<any>, context: SetupContext) {
    const active = computed<Option | undefined>({
        set(val: Option | undefined) {
            context.emit("update:modelValue", val?.value)
        },
        get() {
            return options.find(e => e.value == props.modelValue)
        }
    })

    provide(AciveSymbol, active)

    provide(
        AciveClassSymbol,
        computed(() => props.activeClass)
    )

    const options: Option[] = []

    provide(InitSymbol, (option: Option) => {
        options.push(option)
        if (active.value == undefined || active.value == null) {
            active.value = option.value
        }
    })

    return {
        active
    }
}
