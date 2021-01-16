<template>
    <div
            v-loading="value<total"
            :element-loading-text="text">
        <slot/>
    </div>
</template>

<script>
    export default {
        name: "loading",
        props: {
            "total": Number,
            "value": Number,
            "label": Function
        },
        computed: {
            text() {
                return (this.label || this.defaultLabels)(this.progress)
            },
            progress() {
                if (this.total === 0) {
                    return 100
                }
                return ((this.value / this.total) * 100).toFixed(2)
            }
        },
        methods: {
            defaultLabels(progress) {
                return `加载中...(${progress}%)`
            }
        }
    }
</script>

<style scoped>

</style>
