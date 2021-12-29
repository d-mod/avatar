import { ImageManager } from "@/image-manager"
import { computed, CSSProperties, defineComponent, PropType, reactive, ref, watch } from "vue"
import { debounce } from "lodash"
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
async function loadImage(src: string): Promise<HTMLImageElement | undefined> {
    return new Promise(resolve => {
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
        x: {
            type: Number,
            default: () => 0
        },
        y: {
            type: Number,
            default: () => 0
        },
        canvasStyle: {
            type: [String, Object],
            default: ""
        },
        scale: {
            type: Number,
            default: () => 1.0
        },
        offset: {
            type: Object as PropType<Point>,
            default: () => ({ x: 0, y: 0 })
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

        watch([() => props.images, () => props.scale], debounce(draw, 20))

        async function draw() {
            const width = props.width
            const height = props.height

            const tasks = props.images.map(async e => {
                if (!e.img) {
                    e.img = await loadImage(e.url)
                }
                return e
            })

            const images = await Promise.all(tasks)
            images.sort((a, b) => a.z - b.z)

            const context = canvas.value?.getContext("2d")

            if (context) {
                const offsetX = location.x - props.offset.x
                const offsetY = location.y - props.offset.y
                const scale = props.scale
                context.clearRect(0, 0, width, height)

                images.forEach(e => {
                    if (e.img) {
                        context.drawImage(e.img, (e.x + offsetX) * scale, (e.y + offsetY) * scale, e.width * scale, e.height * scale)
                    }
                })
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

        return () => {
            return (
                <canvas
                    ref={canvas}
                    style={props.canvasStyle}
                    width={props.width}
                    height={props.height}
                    onMouseleave={mouseUp}
                    onMousedown={mouseDown}
                    onMouseup={mouseUp}
                    onMousemove={mouseMove}
                ></canvas>
            )
        }
    }
})
