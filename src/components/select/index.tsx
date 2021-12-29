/**
 * @Author: Kritsu
 * @Date:   2021/11/09 15:31:30
 * @Last Modified by:   Kritsu
 * @Last Modified time: 2021/11/17 18:49:23
 */
import { defineComponent, ref, computed, watch, h, useSlots, Teleport, onDeactivated, renderSlot } from "vue"
import { listProps, useSelectionList } from "../selection/list"
import { onClickOutside } from "@vueuse/core"
import "./style.scss"

export default defineComponent({
    name: "i-select",
    props: {
        ...listProps,
        disabled: {
            type: Boolean,
            default: false
        },
        width: {
            type: Number,
            default: 120
        },
        emptyLabel: {
            type: String
        }
    },
    setup(props, context) {
        const { active } = useSelectionList(props, context)

        const isOpen = ref(false)
        const triggerRef = ref<HTMLElement>()

        watch(isOpen, onResize)

        function collapse() {
            isOpen.value = !isOpen.value && !isDisabled.value
        }

        // 下拉框位置
        const dropdownPosition = ref({ x: 0, y: 0, w: 0 })
        // 下拉框位置
        const dropdownStyle = computed(() => {
            return {
                left: `${dropdownPosition.value.x}px`,
                top: `${dropdownPosition.value.y}px`,
                width: `${dropdownPosition.value.w}px`,
                visibility: isOpen.value ? undefined : "hidden"
            }
        })

        function onResize() {
            if (!!triggerRef.value) {
                const { width, height, left, top } = triggerRef.value.getBoundingClientRect()
                dropdownPosition.value = {
                    w: width,
                    x: left,
                    y: top + height + 4
                }
            }
        }

        const isDisabled = computed(() => !!props.disabled)

        onClickOutside(triggerRef, () => (isOpen.value = false))

        window.addEventListener("resize", onResize)
        window.addEventListener("scroll", onResize)

        onDeactivated(() => {
            window.removeEventListener("resize", onResize)
            window.removeEventListener("scroll", onResize)
        })

        return function render() {
            function renderTrigger() {
                return h(
                    "div",
                    {
                        class: {
                            "i-select-trigger": true,
                            disabled: props.disabled
                        },
                        ref: triggerRef
                    },
                    [
                        h(
                            "span",
                            {
                                class: "i-select-label"
                            },
                            active?.value?.key ?? props.emptyLabel
                        ),
                        h("div", {
                            class: "i-select-down-icon"
                        })
                    ]
                )
            }

            const renderDropDown = () => {
                const { slots } = context
                return h(
                    Teleport,
                    {
                        to: "body"
                    },
                    [
                        h(
                            "div",
                            {
                                class: "i-select-dropdown",
                                style: dropdownStyle.value
                            },
                            renderSlot(slots, "default")
                        )
                    ]
                )
            }

            return h(
                "div",
                {
                    class: "i-select",
                    onClick: collapse,
                    style: {
                        width: props.width == 0 ? 0 : `${props.width}px`
                    }
                },
                [renderTrigger(), renderDropDown()]
            )
        }
    }
})
