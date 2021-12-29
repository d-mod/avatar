<template>
    <div class="profession-list" :class="{ collapse }">
        <div class="top">
            <apt-button :outline="false" class="resize-button material-icons" @click="change">{{ collapse ? "add" : "remove" }}</apt-button>
        </div>
        <div :title="prof.label" :class="{ active: prof == store.profession }" :key="index" @click="apply(prof)" class="item" v-for="(prof, index) in store.profession_list">
            <div :style="profIcon(index)"></div>
            <div class="label">{{ prof.label }}</div>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { Profession } from "@/model"
    import { useDressingStore } from "@/store"
    import { CSSProperties, ref } from "vue"

    const store = useDressingStore()

    const emit = defineEmits(["apply"])

    const collapse = ref(true)

    function apply(profesion: Profession) {
        emit("apply", profesion)
    }

    function change() {
        collapse.value = !collapse.value
    }

    function profIcon(index: number): CSSProperties {
        return {
            width: "26px",
            height: "26px",
            margin: "0 7px",
            position: "absolute",
            backgroundImage: `url("/icon/profession.png")`,
            backgroundPositionX: `-${index * 26}px`,
            backgroundPositionY: `${0}px`
        }
    }
</script>
<style scoped lang="scss">
    @import "@/style/theme";

    .profession-list {
        width: 200px;
        min-width: 200px;
        height: 100%;
        background: white;
        color: #212121;
        float: left;
        transition: all 0.3s;
        box-shadow: 1px 0px 1px rgb(18 18 18 / 10%);

        .top {
            text-align: center;
            height: 40px;
            line-height: 40px;
            display: flex;
            align-items: center;
            position: relative;

            .resize-button {
                font-size: 20px;
                font-weight: bolder;

                width: 100%;
                height: 40px;
                line-height: 40px;
                position: absolute;
                right: 0;
                transition: all 0.3s;
                user-select: none;
            }
        }

        &.collapse {
            width: 40px;
            min-width: 40px;

            .item {
                .label {
                    display: none;
                }
            }
        }

        .item {
            font-size: 14px;
            width: 100%;
            line-height: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            cursor: pointer;
            user-select: none;
            transition: 0.2s all ease-in;

            .label {
                width: 100%;
                text-align: center;
            }

            &:nth-child(odd) {
                flex-direction: row-reverse;
            }

            &:hover {
                color: $blue;
                background: rgba($blue, 0.12);
            }

            &.active {
                background: rgba($blue, 0.36);
            }
        }
    }
</style>
