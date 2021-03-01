<!--
    @author kritsu
    @date 2019/4/6 4:32
-->
<template>
    <mu-flex class="fab">
        <mu-button full-width @click="screenToTop"
                   color="white"
                   text-color="primary"
                   title="回到顶端">
            <mu-icon value="keyboard_arrow_up"></mu-icon>
        </mu-button>
    </mu-flex>
</template>

<script>

    export default {
        name: "fab",
        methods: {
            screenToTop() {
                window.scrollTo(0, 0)
            },
        }
    }
</script>

<style lang="scss" scoped>
    .fab {
        user-select: none;
        outline: none;
        z-index: 101;

        & > * {
            margin-right: 20px;
        }
    }
</style>
