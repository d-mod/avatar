import { defineStore } from "pinia"
import { request } from "@/request"

interface CollocationState {
	list: Collocation[]
	display_list: Collocation[]
	collocation?: Collocation
	collocation_types: CollocationType[]
}

export const useCollocationStore = defineStore("collocation", {
	state(): CollocationState {
		return {
			list: [],
			display_list: [],
			collocation_types: []
		}
	},

	actions: {
		async fetchData() {
			let { list = [], types = [] } = await request("/api/collocation.json").then(r => r.json())
			this.list = list
			this.collocation_types = types
		}
	},

	getters: {
		years(): number[] {
			let current = new Date().getFullYear()
			let years = new Array(current - 2007)
			for (let i = 0; i < years.length; i++) {
				years[i] = current - i
			}
			return years
		}
	}
})
