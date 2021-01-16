<template>
    <div class="license">
        <p>Copyright © 2017-present <a href="//github.com/Kritsu">Kritsu</a>.All rights reserved.</p>
        <p>DMOD Avatar Ver.1.0.0</p>
    </div>
</template>

<script>
    export default {
        name: "license"
    }
</script>

<style lang="scss" scoped>

    @import "../style/theme";

    .license {
        text-align: center;
        font-size: 14px;
        color: black;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        margin: 20px;

        p {
            width: 100%;
            margin: 5px;

            a {
                color: $blue;
            }
        }
    }
</style>
