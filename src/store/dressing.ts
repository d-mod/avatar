import { defineStore } from "pinia"

const PARTS = ["hair", "cap", "face", "neck", "coat", "skin", "belt", "pants", "shoes"]
export interface DressingState {
	profession_list?: Profession[]
	profession?: Profession
	dresses: any
	icons: Record<string, Record<string, DressIcon[]>>
}

export const useDressingStore = defineStore("dressing", {
	state: (): DressingState => {
		return {
			profession_list: undefined,
			profession: undefined,
			dresses: {},
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
				this.profession_list = await fetch("/api/profession.json").then(r => r.json())
				this.profession = this.profession_list?.[0]
			}
			return this.profession_list ?? []
		},
		async setProfession(profession: Profession) {
			this.profession = profession
			localStorage.setItem("last-profession", profession.name)
			let tasks = []
			for (let part of PARTS) {
				tasks.push(this.getDressList(part))
				tasks.push(this.getIcon(part))
			}
			await Promise.all(tasks)
		},
		setProfessionName(name: string) {
			this.profession = this.profession_list?.find(e => e.name == name)
		},
		async getIcon(part: string) {
			let profession = this.profession_name
			if (!this.icons[profession] || !this.icons[profession][part]) {
				let list: DressIcon[] = await fetch(`/icon/${profession}/${part}.json`).then(r => r.json())
				this.icons[profession] = this.icons[profession] || {}
				this.icons[profession][part] = list
			}
			return this.icons[profession][part]
		},
		async getDressList(part: string) {
			let profession = this.profession_name

			if (!this.dresses[profession] || !this.dresses[profession][part]) {
				let list: Dress[] = await fetch(`/api/${profession}/${part}.json`).then(r => r.json())
				list = list.map(e =>
					Object.assign(e, {
						profession,
						part,
						icon: `/icon/${profession}/${part}/${e.code}.png`
					})
				)
				this.dresses[profession] = this.dresses[profession] || {}
				this.dresses[profession][part] = list
			}
			return this.dresses[profession][part]
		},
		async getDress(query: Record<string, string>) {
			let array = []
			for (let part in query) {
				if (query[part] === "-1") {
					continue
				}
				let list: Dress[] = await this.getDressList(part)
				let dress = list.find(e => e.code === query[part])
				if (dress) {
					array.push(dress)
				}
			}
			return array
		}
	}
})
