import { computed, defineComponent } from "vue"
import "./style.scss"

export default defineComponent({
    name: "i-input",
    props: {
        modelValue: {
            type: String
        },
        placeholder: {
            type: String
        }
    },
    setup(props, { emit }) {
        const modelValue = computed({
            get() {
                return props.modelValue
            },
            set(val) {
                emit("update:modelValue", val)
            }
        })

        return () => {
            return <input class="i-input" placeholder={props.placeholder} v-model={modelValue.value}></input>
        }
    }
})
