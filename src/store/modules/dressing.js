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
  icons: state => state.icons,
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
    localStorage.setItem('last-profession',profession)
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
  async [GET_DRESS]({state,dispatch, commit}, {name, query = {}}) {
    let array = []
    for (let part in query) {
      if(query[part]===-1){
        continue
      }
      let list = await dispatch(GET_DRESS_LIST, {profession: name, part})
      let dress = list.find(e => e.code === query[part])
      if(dress) {
        array.push(dress)
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
    list = list.map(e => Object.assign(e, {
      profession,
      part,
      icon: `/icon/${profession}/${part}/${e.code}.png`
    }))
    state.dresses[profession] = state.dresses[profession] || {}
    state.dresses[profession][part] = list
  },
  [GET_ICON](state, {profession, part, list}) {
    state.icons[profession] = state.icons[profession] || {}
    state.icons[profession][part] = list
  }
}
