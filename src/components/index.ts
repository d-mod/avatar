import { App } from "vue"
import AptButton from "./button"
import AptSelect from "./select"
import AptOption from "./option"
import AptIndices from "./indices"
import AptInput from "./input"
import AptDialog from "./dialog/index.vue"

export default {
	install(app: App) {
		app.component("apt-button", AptButton)
		app.component("apt-select", AptSelect)
		app.component("apt-option", AptOption)
		app.component("apt-indices", AptIndices)
		app.component("apt-input", AptInput)
		app.component("apt-dialog", AptDialog)
	}
}
