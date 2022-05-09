import { App } from "vue"
import AptButton from "./button/index.vue"
import AptSelect from "./select/index.vue"
import AptItem from "./item"
import AptSelection from "./selection"

import AptIndices from "./indices"
import AptInput from "./input/index.vue"
import AptDialog from "./dialog/index.vue"
import NLoading from "./loading/index.vue"

export default {
	install(app: App) {
		app.component("n-button", AptButton)
		app.component("n-select", AptSelect)
		app.component("n-selection", AptSelection)
		app.component("n-item", AptItem)

		app.component("n-indices", AptIndices)
		app.component("n-input", AptInput)
		app.component("n-dialog", AptDialog)
		app.component("n-loading", NLoading)
	}
}
