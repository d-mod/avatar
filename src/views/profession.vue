<template>
    <div class="h-full bg-white text-hex-212121 float-left duration-300 shadow" :class="hidden ? 'w-10' : 'w-48'">
        <div class="h-8 text-center">
            <apt-button :outline="false" class="w-full duration-300 text-xl font-bold select-none" @click="change">
                <div :class="hidden ? 'i-mdi-add' : 'i-mdi-remove'" />
            </apt-button>
        </div>
        <div
            :title="prof.label"
            :class="{ active: prof == store.profession }"
            :key="index"
            @click="apply(prof)"
            class="item text-sm w-full h-10 flex items-center cursor-pointer select-none duration-200"
            v-for="(prof, index) in store.profession_list"
        >
            <div class="absolute" :style="profIcon(index)"></div>
            <div class="w-full text-center" :class="{ hidden }" v-text="prof.label"></div>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { Profession } from "@/model"
    import { useDressingStore } from "@/store"
    import { CSSProperties, ref } from "vue"

    const store = useDressingStore()

    const emit = defineEmits(["apply"])

    const hidden = ref(true)

    function apply(profesion: Profession) {
        emit("apply", profesion)
    }

    function change() {
        hidden.value = !hidden.value
    }

    function profIcon(index: number): CSSProperties {
        return {
            width: "26px",
            height: "26px",
            margin: "0 7px",
            backgroundImage: `url("/icon/profession.png")`,
            backgroundPositionX: `-${index * 26}px`,
            backgroundPositionY: `${0}px`
        }
    }
</script>
<style scoped lang="scss">
    @import "@/style/theme";

    .item {
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
</style>
