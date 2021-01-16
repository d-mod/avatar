<!--
    @author kritsu
    @date 2019/1/1 16:49
-->
<template>
    <mu-button @click="$refs.file.click()" :color="color" :small="small">
        <slot></slot>
        <input style="display: none" type="file" ref="file" @change="change">
    </mu-button>
</template>

<script>
    export default {
        name: "upload-button",
        props: {
            color: {
                type: String,
                default: "secondary"
            },
            small: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            change(event) {
                let files = event.srcElement.files
                if (files.length > 0) {
                    this.$emit("change", files[0])
                }
            }
        }
    }
</script>

<style scoped>

</style>
