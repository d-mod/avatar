import { defineFourze } from "@fourze/core"
import axios from "axios"

export default defineFourze((fourze, context) => {
	axios.defaults.baseURL = `//${context.origin}`

	console.log("server origin", context.origin)

	/**
	 *  时装列表数据缓存
	 */
	const dressList: Record<string, any> = {}

	const icons: Record<string, Record<string, DressIcon[]>> = {}

	fourze("/api/profession/list", () => {
		return axios.get("/api/profession.json").then(r => r.data)
	})
	fourze("/api/collocation/list", async (req, res) => {
		return axios.get("/api/collocation.json").then(r => r.data)
	})

	async function getDressList(profession: string, part: string) {
		if (!dressList[profession] || !dressList[profession][part]) {
			let list: Dress[] = await axios.get(`/api/${profession}/${part}.json`).then(r => r.data)
			list = list.map(e =>
				Object.assign(e, {
					profession,
					part,
					icon: `/icon/${profession}/${part}/${e.code}.png`
				})
			)
			dressList[profession] = dressList[profession] || {}
			dressList[profession][part] = list
		}
		return dressList[profession][part]
	}

	fourze("/api/dress/get/{profession}", async (req, res) => {
		const profession: string = req.params.profession
		const query: Record<string, string> = req.query
		let array = []
		for (let part in query) {
			const code = Number(query[part])
			if (code === -1) {
				continue
			}
			let list: Dress[] = await getDressList(profession, part)
			let dress = list.find(e => Number(e.code) === code)
			if (dress) {
				array.push(dress)
			}
		}
		return array
	})

	fourze("/api/dress/{profession}/{part}", (req, res) => {
		const { profession, part } = req.params
		return getDressList(profession, part)
	})

	fourze("/api/icon/{profession}/{part}", async (req, res) => {
		const { profession, part } = req.params
		if (!icons[profession] || !icons[profession][part]) {
			let list: DressIcon[] = await axios.get(`/icon/${profession}/${part}.json`).then(r => r.data)
			icons[profession] = icons[profession] || {}
			icons[profession][part] = list
		}
		return icons[profession][part]
	})
})
