import api from "../api/collocation"
import {GET_COLLOCATION, GET_COLLOCATION_TYPE, INIT_COLLOCATION, LOAD_COLLOCATION} from "@/constants/collocation"

export const state = {
  list: [],
  display_list: [],
  collocation_types: []
}

export const getters = {
  list: state => state.list,
  display_list: state => state.display_list,
  collocation: state => state.collocation,
  collocation_types: state => state.collocation_types,
  years() {
    let current = new Date().getFullYear()
    let years = new Array(current - 2007)
    for (let i = 0; i < years.length; i++) {
      years[i] = current - i
    }
    return years
  }
}

export const actions = {
  async [INIT_COLLOCATION]({commit}) {
    let {list, types} = await api[INIT_COLLOCATION]()
    commit(GET_COLLOCATION_TYPE, types)
    commit(INIT_COLLOCATION, list)
  },
  async [GET_COLLOCATION]({state, commit}, {profession, query}) {
    let {keyword, size, page, type} = query
    let list = state.list.filter(e => {
      if (keyword && !e.name.contains(keyword) && !e.description.contains(keyword)) {
        return false
      }
      if (profession && e.profession !== profession) {
        return false
      }
      return !(type && e.type !== type);

    })
    list = list.slice(0, size * (page + 1))
    commit(GET_COLLOCATION, list)
  },
  async [LOAD_COLLOCATION]({commit}, {profession, query}) {
    return []
  }
}

export const mutations = {
  [INIT_COLLOCATION](state, list) {
    state.list = list
  },
  [GET_COLLOCATION](state, list) {
    state.display_list = list
  },
  [LOAD_COLLOCATION](state, list) {
    state.display_list.push(...list)
  },
  [GET_COLLOCATION_TYPE](state, list) {
    state.collocation_types = list
  }
}
