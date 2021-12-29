import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue"
import VarButton from "../button"
import type { Ref } from "vue"

export default defineComponent({
    name: "i-backtop",
    components: {
        VarButton
    },
    setup(props) {
        return <div></div>
    }
})
