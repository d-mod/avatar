import { createApp } from "vue"
import { defineComponent } from "vue"
import "./style.scss"

const Toast = defineComponent({
    name: "i-toast",
    props: {
        message: String
    },

    setup(props) {
        return () => {
            return (
                <div class="i-toast">
                    <div class="i-toast-content" v-text={props.message}></div>
                </div>
            )
        }
    }
})

export async function showToast(message: string, timeout = 3000) {
    const toast = document.createElement("div")
    toast.className = "i-toast-wrapper"
    const app = createApp(Toast, { message })
    app.mount(toast)
    document.body.appendChild(toast)

    await new Promise<void>(resolve => {
        setTimeout(() => {
            app.unmount()
            document.body.removeChild(toast)
            resolve()
        }, timeout)
    })
}
