import { defineStore } from "pinia"

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
		async getList(): Promise<Collocation[]> {
			return (this.list = await fetch("/api/collocation/list").then(r => r.json()))
		},
		async getTypes(): Promise<CollocationType[]> {
			return (this.collocation_types = await fetch("/api/collocation/types").then(r => r.json()))
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
