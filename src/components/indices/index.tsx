import { defineComponent, renderSlot, VNode } from "vue"
import { listProps, useSelectionList } from "../selection/list"
import "./style.scss"

export default defineComponent({
    name: "i-indices",
    props: {
        ...listProps,
        label: {
            type: String
        }
    },
    setup(props, context) {
        useSelectionList(props, context)
        const { slots } = context
        return () => {
            const children: VNode[] = []
            if (props.label) {
                children.push(<span class="i-indices-label" v-text={props.label}></span>)
            }
            children.push(renderSlot(slots, "default"))
            return <div class="i-indices">{children}</div>
        }
    }
})
