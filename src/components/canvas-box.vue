<script lang="tsx">
	import { debouncedWatch } from "@vueuse/core"
	import { computed, defineComponent, PropType, reactive, ref, watch } from "vue"
	interface Point {
		x: number
		y: number
	}

	interface Image {
		url: string
		x: number
		y: number
		z: number
		width: number
		height: number
		img?: HTMLImageElement
	}

	/**
 @author kritsu
 @date 2018/9/20 12:03
 */
	export default defineComponent({
		name: "canvas-box",
		props: {
			width: {
				type: Number,
				default: () => 300
			},
			height: {
				type: Number,
				default: () => 200
			},
			images: {
				type: Array as PropType<Image[]>,
				default: () => []
			},
			canvasClass: {
				type: [String, Array],
				default: ""
			},
			scale: {
				type: Number,
				default: () => 1.0
			}
		},
		setup(props) {
			const canvas = ref<HTMLCanvasElement>()

			const startOffset: Point = reactive({
				x: 0,
				y: 0
			})

			const location: Point = reactive({
				x: 0,
				y: 0
			})

			const movable = ref(false)

			debouncedWatch([() => props.images, () => props.scale], draw, { debounce: 10 })

			const loading = ref(false)

			const time = ref(0)

			async function loadImage(src: string, now: number): Promise<HTMLImageElement | undefined> {
				return new Promise(resolve => {
					if (now != time.value) {
						resolve(undefined)
						return
					}
					const img = new Image()
					img.onload = () => {
						resolve(img)
					}
					img.onerror = () => {
						resolve(undefined)
					}
					img.src = src
				})
			}

			async function draw() {
				loading.value = true
				try {
					const width = props.width
					const height = props.height

					const now = new Date().getTime()
					time.value = now

					let images = Array.from(props.images)

					images.sort((a, b) => a.z - b.z)

					const tasks = images.map(async e => {
						if (!e.img) {
							e.img = await loadImage(e.url, now)
							e.width = e.img?.width ?? e.width
							e.height = e.img?.height ?? e.height
						}
						return e
					})

					images = await Promise.all(tasks)

					let x = props.width
					let y = props.height
					let w = 0
					let h = 0
					for (let image of images) {
						x = Math.min(image.x, x)
						y = Math.min(image.y, y)
						w = Math.max(image.width, w)
						h = Math.max(image.height, h)
					}

					images = images.map(e => {
						return {
							...e,
							x: e.x - x,
							y: e.y - y
						}
					})

					let offsetX = Math.round((props.width - w) / 2 + location.x)
					let offsetY = Math.round((props.height - h) / 2 + location.y)

					const context = canvas.value?.getContext("2d")

					if (context) {
						const scale = props.scale
						context.clearRect(0, 0, width, height)

						images.forEach(e => {
							const lx = Math.round((e.x + offsetX) * scale)
							let ly = Math.round((e.y + offsetY) * scale)
							const lw = Math.round(e.width * scale)
							const lh = Math.round(e.height * scale)
							if (e.img) {
								context.drawImage(e.img, lx, ly, lw, lh)
							}
						})
					}
				} finally {
					loading.value = false
				}
			}

			function mouseDown({ x, y }: MouseEvent) {
				movable.value = true
				startOffset.x = x
				startOffset.y = y
			}

			function mouseUp() {
				movable.value = false
			}

			function mouseMove(e: MouseEvent) {
				if (movable.value) {
					location.x += (e.clientX - startOffset.x) / props.scale
					location.y += (e.clientY - startOffset.y) / props.scale
					startOffset.x = e.clientX
					startOffset.y = e.clientY
					draw()
				}
			}

			const canvasStyle = computed(() => {
				return {
					width: props.width ? `${props.width}px` : "0",
					height: props.height ? `${props.height}px` : "0"
				}
			})

			return () => {
				return (
					<div class="relative">
						<div class={"bg-light h-full w-full z-99 absolute items-center justify-center".concat(" ").concat(loading.value ? "flex" : "hidden")}>
							<div class="text-primary loading"></div>
						</div>
						<canvas
							ref={canvas}
							style={canvasStyle.value}
							class={[props.canvasClass].concat("cursor-move", "select-none")}
							width={props.width}
							height={props.height}
							onMouseleave={mouseUp}
							onMousedown={mouseDown}
							onMouseup={mouseUp}
							onMousemove={mouseMove}
						></canvas>
					</div>
				)
			}
		}
	})
</script>
<style>
	.loading {
		border: 4px solid transparent;
		border-radius: 50%;
		border-top: 4px solid currentColor;
		width: 48px;
		height: 48px;
		animation: spin 1.2s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
