import { defineStore } from "pinia"
import { stringifyUrl } from "query-string"

const PARTS = ["hair", "cap", "face", "neck", "coat", "skin", "belt", "pants", "shoes"]
export interface DressingState {
	profession_list?: Profession[]
	profession?: Profession
	icons: Record<string, Record<string, DressIcon[]>>
}

export const useDressingStore = defineStore("dressing", {
	state: (): DressingState => {
		return {
			profession_list: undefined,
			profession: undefined,
			icons: {}
		}
	},
	getters: {
		profession_name(): string {
			return this.profession?.name ?? "swordman"
		}
	},
	actions: {
		async loadProession() {
			if (!this.profession_list?.length) {
				this.profession_list = await fetch("/api/profession/list").then(r => r.json())
				this.profession = this.profession_list?.[0]
			}
			return this.profession_list ?? []
		},
		async setProfession(profession: Profession) {
			this.profession = profession
			localStorage.setItem("last-profession", profession.name)
		},
		setProfessionName(name: string) {
			this.profession = this.profession_list?.find(e => e.name == name)
		},
		async getIcon(part: string): Promise<DressIcon[]> {
			return fetch(`/api/icon/${this.profession_name}/${part}`).then(r => r.json())
		},
		async getDressList(part: string): Promise<Dress[]> {
			let profession = this.profession_name
			return await fetch(`/api/dress/${profession}/${part}`).then(r => r.json())
		},
		async getDress(query: Record<string, string>): Promise<Dress[]> {
			return await fetch(
				stringifyUrl({
					url: `/api/dress/get/${this.profession_name}`,
					query
				})
			).then(r => r.json())
		}
	}
})
