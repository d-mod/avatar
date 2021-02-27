import {get} from "axios"
import {GET_DRESS_LIST, GET_ICON, GET_PROFESSION} from "@/constants/dressing"

export default {
  [GET_PROFESSION]() {
    return get("/profession.json")
  },
  [GET_DRESS_LIST](profession, part) {
    return get(`/${profession}/${part}.json`)
  },
  [GET_ICON](profession, part) {
    return get(`/${profession}/${part}.json`, {
      baseURL: "/icon"
    })
  }
}
