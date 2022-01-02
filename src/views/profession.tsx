import { useDressingStore } from "@/store"
import { CSSProperties, ref, defineComponent } from "vue"
import "./profession.scss"

export default defineComponent((props, { emit }) => {
    const store = useDressingStore()

    const hidden = ref(true)

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

    return () => {
        return (
            <div class={"h-full bg-white text-hex-212121 float-left duration-300 shadow".concat(" ").concat(hidden.value ? "w-10" : "w-48")}>
                <div class="h-8 text-center">
                    <apt-button class="w-full duration-300 text-xl font-bold select-none" onClick={change}>
                        <div class={hidden.value ? "i-mdi-add" : "i-mdi-remove"} />
                    </apt-button>
                </div>
                {store.profession_list.map((prof, index) => (
                    <div
                        title={prof.label}
                        key={index}
                        onClick={() => emit("apply", prof)}
                        class={"prof-item text-sm w-full h-10 flex items-center cursor-pointer select-none duration-200".concat(" ").concat(prof == store.profession ? "active" : "")}
                    >
                        <div class="absolute" style={profIcon(index)}></div>
                        <div class={"w-full text-center".concat(" ").concat(hidden.value ? "hidden" : "")} v-text={prof.label}></div>
                    </div>
                ))}
            </div>
        )
    }
})
