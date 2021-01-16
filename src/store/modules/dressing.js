import api from "../api/dressing"
import {GET_DRESS, GET_DRESS_LIST, GET_ICON, GET_PROFESSION, SET_PROFESSION} from "@/constants/dressing"

const PARTS = ['hair', 'cap', 'face', 'neck', 'coat', 'skin', 'belt', 'pants', 'shoes']

export const state = {
  prof_array: [],
  profession: null,
  dresses: {},
  icons: {}
}

export const getters = {
  prof_array: state => state.prof_array,
  profession: state => state.profession,
  icons: state => state.icons,
  $profession(state) {
    let name = state.profession
    let index = state.prof_array.findIndex(e => e.name === name)
    if (index > -1) {
      return state.prof_array[index]
    }
    return null
  },
  $weapons: () => getters.$profession.weapons
}

export const actions = {
  async [GET_PROFESSION]({state, commit, dispatch}) {
    if (state.prof_array.length === 0) {
      let list = await api[GET_PROFESSION]()
      commit(GET_PROFESSION, list)
      if (state.prof_array.length > 0) {
        await dispatch(SET_PROFESSION, state.prof_array[0].name)
      }
      return list
    }
  },
  async [SET_PROFESSION]({commit, dispatch}, profession) {
    let tasks = []
    for (let part of PARTS) {
      tasks.push(dispatch(GET_DRESS_LIST, {profession, part}))
      tasks.push(dispatch(GET_ICON, {profession, part}))
    }
    await Promise.all(tasks)
    return commit(SET_PROFESSION, profession)
  },
  async [GET_ICON]({state, commit}, {profession, part}) {
    if (!state.icons[profession] || !state.icons[profession][part]) {
      let list = await api[GET_ICON](profession, part)
      commit(GET_ICON, {profession, part, list})
    }
    return state.icons[profession][part]
  },
  async [GET_DRESS_LIST]({state, commit}, {profession, part}) {
    if (!state.dresses[profession] || !state.dresses[profession][part]) {
      let list = await api[GET_DRESS_LIST](profession, part)
      commit(GET_DRESS_LIST, {profession, part, list})
    }
    return state.dresses[profession][part]
  },
  async [GET_DRESS]({state, commit}, {name, query = {}}) {
    let array = []
    for (let key in query) {
      if (state.dresses[name] && state.dresses[name][key]) {
        //如果已存在了该数据，从参数中去除
        let list = state.dresses[name][key]
        let avatar = list.find(e => e.code === query[key])
        array.push(avatar)
      }
    }
    return array
  }
}

export const mutations = {
  [GET_PROFESSION](state, array) {
    state.prof_array = array
  },
  [SET_PROFESSION](state, profession) {
    state.profession = profession
  },
  [GET_DRESS_LIST](state, {profession, part, list}) {
    state.dresses[profession] = state.dresses[profession] || {}
    state.dresses[profession][part] = list
  },
  [GET_ICON](state, {profession, part, list}) {
    state.icons[profession] = state.icons[profession] || {}
    state.icons[profession][part] = list
  }
}
