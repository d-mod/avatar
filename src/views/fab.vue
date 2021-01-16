<!--
    @author kritsu
    @date 2019/4/6 4:32
-->
<template>
    <mu-flex class="fab">
        <mu-button @click="screenToTop"
                   color="red"
                   fab
                   title="回到顶端"
                   v-if="backToTop">
            <mu-icon value="arrow_upward"></mu-icon>
        </mu-button>
    </mu-flex>
</template>

<script>

    export default {
        name: "fab",
        data() {
            return {
                backToTop: false
            }
        },
        mounted() {
            window.addEventListener("scroll", this.scroll)
        },
        methods: {
            scroll() {
                let scrollTop =
                    window.pageYOffset ||
                    document.documentElement.scrollTop ||
                    document.body.scrollTop
                let offsetHeight = document.documentElement.offsetHeight
                this.backToTop = scrollTop > offsetHeight
            },
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
        position: fixed;
        right: 96px;
        bottom: 96px;
        z-index: 101;

        & > * {
            margin-right: 20px;
        }
    }
</style>
