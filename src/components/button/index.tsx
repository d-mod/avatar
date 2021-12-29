/**
 * @Author: Kritsu
 * @Date:   2021/11/16 23:07:51
 * @Last Modified by:   Kritsu
 * @Last Modified time: 2021/11/17 18:49:42
 */
import { defineComponent, h, renderSlot } from "vue"
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
        outline: {
            type: Boolean,
            default: true
        }
    },
    setup(props, { slots }) {
        return () => {
            return h(
                //@ts-ignore
                !!props.to ? RouterLink : "button",
                {
                    to: props.to,
                    class: {
                        "i-button": true,
                        disabled: props.disabled,
                        small: props.small,
                        outline: props.outline
                    }
                },
                renderSlot(slots, "default")
            )
        }
    }
})
