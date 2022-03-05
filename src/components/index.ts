import { App } from "vue"
import AptButton from "./button"
import AptSelect from "./select/index.vue"
import AptItem from "./item"
import AptSelection from "./selection"

import AptIndices from "./indices"
import AptInput from "./input/index.vue"
import AptDialog from "./dialog/index.vue"

export default {
	install(app: App) {
		app.component("apt-button", AptButton)
		app.component("apt-select", AptSelect)
		app.component("apt-selection", AptSelection)
		app.component("apt-item", AptItem)

		app.component("apt-indices", AptIndices)
		app.component("apt-input", AptInput)
		app.component("apt-dialog", AptDialog)
	}
}
