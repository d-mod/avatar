import { onClickOutside } from "@vueuse/core"
import { defineComponent, h, ref, renderSlot, Teleport } from "vue"
import "./style.scss"

function renderTeleport(to = "body", children: JSX.Element[]) {
    return h(Teleport, { to }, children)
}

export default defineComponent({
    name: "i-dialog",
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        dialogClass: {
            type: String
        }
    },
    setup(props, { emit, slots }) {
        const dialogRef = ref<HTMLElement>()

        onClickOutside(dialogRef, () => emit("update:visible", false))

        return () => {
            const mask = props.visible ? (
                <div class={{ "i-dialog-mask": true, visible: props.visible }}>
                    <div ref={dialogRef} class={["i-dialog", props.dialogClass]}>
                        {renderSlot(slots, "default")}
                    </div>
                </div>
            ) : (
                <div></div>
            )

            return renderTeleport("body", [mask])
        }
    }
})
