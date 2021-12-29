import { ComponentPropsOptions, computed, ComputedRef, inject, Ref, SetupContext, watch } from "vue"
import { AciveClassSymbol, AciveSymbol, InitSymbol, Option } from "./constants"

export const itemProps: ComponentPropsOptions = {
    value: {
        type: [Object, String, Number, Boolean]
    },
    label: {
        type: [Function, String]
    }
}

export function useSelectionItem(props: any) {
    const active = inject<Ref<Option>>(AciveSymbol)
    const init = inject<(obj: any) => void>(InitSymbol)

    const isActive = computed<boolean>(() => {
        return props.value == active?.value?.value
    })

    const label = computed(() => {
        let lab: string | Function = props.label
        if (typeof lab == "function") {
            lab = lab(props.value) as string
        }
        return lab ?? props.value
    })

    const current = computed(() => {
        return {
            key: label.value,
            value: props.value
        }
    })

    if (!!init) {
        init(current.value)
    }

    watch(current, () => {
        if (isActive.value && active) {
            active.value = current.value
        }
    })

    const activeClass = inject<ComputedRef<string>>(AciveClassSymbol)

    return {
        active,
        isActive,
        current,
        label,
        activeClass
    }
}

export interface ItemProps {}
