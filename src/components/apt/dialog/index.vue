<script lang="tsx">
	import { onClickOutside, useVModel } from "@vueuse/core"
	import { defineComponent, h, ref, renderSlot, Teleport, Transition } from "vue"

	import NButton from "../button/index.vue"

	function renderTeleport(to = "body", children: JSX.Element[]) {
		return h(Teleport, { to }, children)
	}

	export default defineComponent({
		name: "i-dialog",
		components: {
			NButton
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
			},
			closeOnYes: {
				type: Boolean,
				default: () => true
			},
			closeOnCancel: {
				type: Boolean,
				default: () => true
			}
		},
		emits: ["close", "yes", "cancel", "update:visible"],
		setup(props, { emit, slots }) {
			const dialogRef = ref<HTMLElement>()

			const visible = useVModel(props, "visible", emit)

			onClickOutside(dialogRef, () => emit("update:visible", false))

			function onYesClick() {
				emit("yes")
				if (props.closeOnYes) {
					visible.value = false
				}
			}

			function onCancelClick() {
				emit("cancel")
				if (props.closeOnCancel) {
					visible.value = false
				}
			}

			function renderAction() {
				if (props.yesButton || props.cancelButton) {
					const buttons: JSX.Element[] = []
					if (props.cancelButton) {
						buttons.push(<apt-button onClick={onCancelClick}>{props.cancelButton}</apt-button>)
					}
					if (props.yesButton) {
						buttons.push(
							<apt-button type="primary" onClick={onYesClick}>
								{props.yesButton}
							</apt-button>
						)
					}
					return <div class="flex mt-8 justify-end">{buttons}</div>
				}
			}

			return () => {
				return renderTeleport("body", [
					<Transition name="dialog" mode="out-in">
						<div v-show={visible.value} class={["dialog-mask bg-#00000066 w-full h-full fixed top-0 left-0 z-999 flex justify-center items-center duration-300 ease-in-out"]}>
							<div ref={dialogRef} class={["bg-light h-auto shadow-sm rounded p-4 dialog", props.class]}>
								<div class="w-full">
									<div class="h-auto"> {renderSlot(slots, "default")}</div>
									{renderAction()}
								</div>
							</div>
						</div>
					</Transition>
				])
			}
		}
	})
</script>
<style lang="scss" scoped>
	.dialog-enter-active {
		animation: fade-in 400ms;
	}
	.dialog-leave-active {
		animation: fade-in reverse 400ms;
	}

	.dialog-enter-active > .dialog {
		animation: zoom-in 400ms;
	}
	.dialog-leave-active > .dialog {
		animation: zoom-out 400ms;
	}
</style>