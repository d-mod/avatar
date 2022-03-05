<script lang="tsx">
	/**
	 * @Author: Kritsu
	 * @Date:   2021/11/09 15:31:30
	 * @Last Modified by:   Kritsu
	 * @Last Modified time: 2021/11/17 18:49:23
	 */
	import { defineComponent, ref, computed, watch, h, useSlots, Teleport, onDeactivated, renderSlot, Transition } from "vue"
	import { listProps, useSelectionList } from "../hooks/selection/list"
	import { onClickOutside } from "@vueuse/core"

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
					width: `${dropdownPosition.value.w}px`
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

			return () => {
				const { slots } = context

				return (
					<div class="i-select" onClick={collapse} style={{ width: props.width == 0 ? 0 : `${props.width}px` }}>
						<div class={["i-select-trigger"].concat(props.disabled ? "disabled" : "")} ref={triggerRef}>
							<span class="i-select-label">{active?.value?.key ?? props.emptyLabel}</span>
							<div class="i-select-down-icon"></div>
						</div>
						<Teleport to="body">
							<Transition name="dropdown">
								<div class="i-select-dropdown" style={dropdownStyle.value} v-show={isOpen.value}>
									{renderSlot(slots, "default")}
								</div>
							</Transition>
						</Teleport>
					</div>
				)
			}
		}
	})
</script>
<style lang="scss">
	/**
 * @Author: Kritsu
 * @Date:   2021/11/09 15:43:10
 * @Last Modified by:   Kritsu
 * @Last Modified time: 2021/11/17 18:03:08
 */

	.i-select {
		min-width: 160px;
		width: 160px;
		user-select: none;
		outline: none;
		height: 32px;
		min-height: 32px;
		line-height: 100%;
		font-size: 12px;
		color: var(--black);
		background-color: white;
		border: 1px solid #dcdfe6;
		border-radius: 2px;
		padding: 0;
		margin: 0;
		display: block;

		&:hover {
			border: 1px soild #c0c4cc;
		}

		.i-select-trigger {
			padding: 0;
			display: flex;
			height: 100%;

			justify-content: space-between;
			align-items: center;

			.i-select-label {
				padding-left: 5px;
			}

			.i-select-down-icon {
				background-size: cover;
				background-repeat: no-repeat;
				background-position: center;
				width: 18px;
				height: 17px;
			}

			&.disabled {
				color: gray;
			}
		}
	}

	.i-select-dropdown {
		position: fixed;
		background: white;
		border: 1px solid var(--primary-color);
		font-size: 12px;
		max-height: 200px;
		overflow-y: auto;
		z-index: 888;

		$hoverColor: #f5f7fa;
		$activeColor: lighten($hoverColor, 5%);
		color: var(--black);

		&::-webkit-scrollbar {
			//滚动条的宽度
			width: 6px;
		}

		&::-webkit-scrollbar-thumb {
			background-color: #c8c9cc;
			border-radius: 2px;
		}

		.i-option {
			font-size: 12px;
			height: 32px;
			line-height: 32px;
			margin: 0;
			padding: 0 8px;
			border: none;
			outline: none;
			appearance: none;
			display: block;
			cursor: pointer;

			&.active {
				background-color: $activeColor;
			}
		}

		.i-option:hover:not(.active) {
			font-size: 12px;
			background-color: $hoverColor;
			border: 0px;
		}
	}
</style>
