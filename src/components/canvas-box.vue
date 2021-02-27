<!--
    @author kritsu
    @date 2018/9/20 12:03
-->
<template>
    <canvas
            ref="canvas"
            :style="canvasStyle"
            :width="width"
            :height="height"
            @mouseleave="mouseUp"
            @mousedown="mouseDown"
            @mouseup="mouseUp"
            @mousemove="mouseMove"
    ></canvas>
</template>

<script>
    export default {
        name: "canvas-box",
        props: {
            width: {
                type: Number,
                default: 300
            },
            height: {
                type: Number,
                default: 200
            },
            images: {
                type: Array,
                default: () => []
            },
            x: {
                type: Number,
                default: 0
            },
            y: {
                type: Number,
                default: 0
            },
            canvasStyle: {
                type: String || Object
            },
            scale: {
                type: Number,
                default: 0
            },
            offset: {
                type: Object,
                default() {
                    return {x: 0, y: 0}
                }
            }
        },
        data() {
            return {
                startOffset: {
                    x: 0,
                    y: 0
                },
                location: {
                    x: 0,
                    y: 0
                },
                movable: false
            }
        },
        watch: {
            images() {
                this.draw()
            },
            scale() {
                this.draw()
            }
        },
        methods: {
            draw() {
                const width = this.width
                const height = this.height
                const canvas = this.$refs.canvas
                const context = canvas.getContext("2d")
                context.clearRect(0, 0, width, height)
                const offsetX = this.location.x - this.offset.x
                const offsetY = this.location.y - this.offset.y
                const scale = this.scale
                this.images.forEach(e => context.drawImage(e.img, (e.x + offsetX) * scale, (e.y + offsetY) * scale, e.width * scale, e.height * scale))
            },
            mouseDown({x, y}) {
                this.movable = true
                this.startOffset = {x, y}
            },
            mouseUp() {
                this.movable = false
            },
            mouseMove(e) {
                if (this.movable) {
                    this.location.x += (e.clientX - this.startOffset.x) / this.scale
                    this.location.y += (e.clientY - this.startOffset.y) / this.scale
                    this.startOffset.x = e.clientX
                    this.startOffset.y = e.clientY
                    this.draw()
                }
            }
        }
    }
</script>

<style scoped>
    canvas {
        cursor: move;
        user-select: none;
    }
</style>
