<template>
    <div class="license">
        <div class="line">Copyright © 2017-present <a href="//github.com/Kritsu">Kritsu</a>.All rights reserved.</div>
        <div class="line"><a href="//github.com/d-mod/avatar">DMOD Avatar Ver.1.0.0</a> </div>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from "vue"

    export default defineComponent({
        name: "license"
    })
</script>

<style lang="scss" scoped>
    @import "@/style/theme";

    .license {
        text-align: center;
        font-size: 14px;
        color: black;
        display: flex;
        flex-wrap: wrap;
        align-items: center;

        .line {
            width: 100%;
            margin-top: 12px;
            height: 18px;
            line-height: 18px;

            a {
                color: $blue;
            }
        }
    }
</style>
