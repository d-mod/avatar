<script lang="tsx">
	import { onClickOutside } from "@vueuse/core"
	import { defineComponent, h, ref, renderSlot, Teleport } from "vue"

	import IButton from "@/components/button"

	function renderTeleport(to = "body", children: JSX.Element[]) {
		return h(Teleport, { to }, children)
	}

	export default defineComponent({
		name: "i-dialog",
		components: {
			IButton
		},
		props: {
			visible: {
				type: Boolean,
				default: false
			},
			class: {
				type: String
			},
			yesButton: {
				type: [String, Boolean],
				default: "确定"
			},
			cancelButton: {
				type: [String, Boolean],
				default: "取消"
			}
		},
		emits: ["close", "yes", "cancel", "update:visible"],
		setup(props, { emit, slots }) {
			const dialogRef = ref<HTMLElement>()

			onClickOutside(dialogRef, () => emit("update:visible", false))

			function onYesClick() {
				emit("yes")
			}

			function onCancelClick() {
				emit("cancel")
			}

			function renderAction() {
				if (props.yesButton || props.cancelButton) {
					const buttons: JSX.Element[] = []
					if (props.cancelButton) {
						buttons.push(<i-button onClick={onCancelClick}>{props.cancelButton}</i-button>)
					}
					if (props.yesButton) {
						buttons.push(
							<i-button class="bg-blue-300 text-white" onClick={onYesClick}>
								{props.yesButton}
							</i-button>
						)
					}
					return <div class="flex mt-8 justify-end">{buttons}</div>
				}
			}

			return () => {
				return renderTeleport("body", [
					<div
						v-show={props.visible}
						class={["bounce-in-down bg-#00000066 w-full h-full fixed top-0 left-0 z-999 flex justify-center items-center duration-300  "].concat(props.visible ? " " : "hidden")}
					>
						<div ref={dialogRef} class={["bg-white h-auto shadow-sm round-1 p-4", props.class]}>
							<div class="w-full">
								<div class="h-auto"> {renderSlot(slots, "default")}</div>
								{renderAction()}
							</div>
						</div>
					</div>
				])
			}
		}
	})
</script>
<style lang="scss" scoped></style>
