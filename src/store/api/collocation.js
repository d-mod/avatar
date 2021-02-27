import {get} from "axios"
import {INIT_COLLOCATION} from "@/constants/collocation"

export default {
  [INIT_COLLOCATION]() {
    return get('/collocation.json')
  }
}
