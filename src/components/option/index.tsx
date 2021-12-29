/**
 * @Author: Kritsu
 * @Date:   2021/11/12 10:09:29
 * @Last Modified by:   Kritsu
 * @Last Modified time: 2021/11/17 18:03:06
 */
import { defineComponent, h } from "vue"
import { itemProps, useSelectionItem } from "../selection/item"

export default defineComponent({
    name: "i-option",
    props: itemProps,
    setup(props) {
        const { active, activeClass, isActive, current, label } = useSelectionItem(props)

        return () => {
            return h(
                "span",
                {
                    class: {
                        "i-option": true,
                        [activeClass?.value ?? "active"]: isActive.value
                    },
                    onClick() {
                        if (!!active) {
                            active.value = current.value
                        }
                    }
                },
                label.value
            )
        }
    }
})
