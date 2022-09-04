import { asyncLock, defineFourze } from "@fourze/core"
import axios from "axios"

export default defineFourze(fourze => {
	const axiosInstance = axios.create({
		baseURL: "https://avatar.kritsu.net"
	})

	const getCollocation = asyncLock<{
		types: CollocationType[]
		list: Collocation[]
	}>(() => axiosInstance.get("/api/collocation.json").then(r => r.data))

	/**
	 *  时装列表数据缓存
	 */
	const dressList: Record<string, any> = {}

	const icons: Record<string, Record<string, DressIcon[]>> = {}

	fourze("/api/profession/list", () => {
		return axiosInstance.get("/api/profession.json").then(r => r.data)
	})

	fourze("/api/collocation/list", async () => {
		const collecationState = await getCollocation()
		return collecationState?.list
	})

	fourze("/api/collocation/types", async () => {
		const collecationState = await getCollocation()
		return collecationState?.types
	})

	async function getDressList(profession: string, part: string) {
		if (!dressList[profession] || !dressList[profession][part]) {
			let list: Dress[] = await axiosInstance.get(`/api/${profession}/${part}.json`).then(r => r.data)
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
			let list: DressIcon[] = await axiosInstance.get(`/icon/${profession}/${part}.json`).then(r => r.data)
			icons[profession] = icons[profession] || {}
			icons[profession][part] = list
		}
		return icons[profession][part]
	})
})
