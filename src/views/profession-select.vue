<template>
    <mu-select :value="value"
               @input="input"
               @change="change"
               title="选择职业"
               :label="label"
               action-icon="lock"
    >
        <span slot="prepend" v-if="$index>-1" :style="style($index)"></span>
        <mu-option
                v-if="showAll"
                label="全部"
                :value="null"
        />
        <mu-option v-for="(prof,index) in $list"
                   :key="index"
                   :value="prof.name"
                   :label="prof.label"
        >
            <span :style="style(index)"></span>
            <span v-text="prof.label"></span>
        </mu-option>
    </mu-select>
</template>

<script>
    export default {
        name: "profession-select",
        model:{
          prop:"value",
          event:"change"
        },
        props: {
            value: String,
            showAll: Boolean,
            label: {
                type: String,
                default: "职业"
            }
        },
        computed: {
            $list() {
                return this.$store.getters.prof_array
            },
            $index() {
                return this.$list.findIndex(e => e.name === this.value)
            }
        },
        methods: {
            input(val) {
                this.$emit("input", val)
            },
            change(val) {
                this.$emit("change", val)
            },
            style(index) {
                return {
                    float: "left",
                    width: "26px",
                    height: "26px",
                    marginRight: "14px",
                    backgroundImage: `url("/icon/profession.png")`,
                    backgroundPositionX: `-${index * 26}px`,
                    backgroundPositionY: `${0}px`
                }
            }
        }
    }
</script>

