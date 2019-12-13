import Cookies from 'js-cookie'
import { getLanguage } from '@/lang/index'
import { initDicts } from '@/api/manage/dictionary'

const state = {
  sidebar: {
    opened: Cookies.get('sidebar') ? Cookies.get('sidebar') === 'opened' : true,
    withoutAnimation: false
  },
  device: 'desktop',
  language: getLanguage(),
  size: Cookies.get('size') || 'medium',
  theme: Cookies.get('theme') || '#409EFF',
  // 字典配置
  dicts: {},
  needLogin: false,
  loginHandler: {},
  loginPromise: null
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebar', 'opened')
    } else {
      Cookies.set('sidebar', 'closed')
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebar', 'closed')
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  TOGGLE_SCREENFULL: (state, screenfull) => {
    if (screenfull === undefined) {
      state.screenfull = !state.screenfull
    } else {
      state.screenfull = screenfull
    }
  },
  SET_LANGUAGE: (state, language) => {
    state.language = language
    Cookies.set('language', language)
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  },
  SET_THEME: (state, theme) => {
    state.theme = theme
    Cookies.set('theme', theme)
  },
  SET_DICTS: (state, data) => {
    const { code, dicts } = data
    state.dicts[code] = dicts
  },
  SET_NEED_LOGIN: (state, needLogin) => {
    state.needLogin = needLogin
  },
  SET_LOGIN_HANDLER: (state, loginHandler) => {
    state.loginHandler = loginHandler
  },
  SET_LOGIN_PROMISE: (state, loginPromise) => {
    state.loginPromise = loginPromise
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  toggleScreenfull({ commit }, screenfull) {
    commit('TOGGLE_SCREENFULL', screenfull)
  },
  setLanguage({ commit }, language) {
    commit('SET_LANGUAGE', language)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  },
  setTheme({ commit }, theme) {
    commit('SET_THEME', theme)
  },
  triggerLogin({ commit, state }, needLogin) {
    if (!needLogin) {
      commit('SET_NEED_LOGIN', false)
    } else {
      commit('SET_NEED_LOGIN', true)
      if (!state.loginPromise) {
        let loginPromise = new Promise((resolve, reject) => {
          commit('SET_LOGIN_HANDLER', {
            resolve: resolve,
            reject: reject
          })
        })
        commit('SET_LOGIN_PROMISE', loginPromise)
        return loginPromise
      }
      return state.loginPromise
    }
  },
  confirmLogin({ commit, state }) {
    commit('SET_NEED_LOGIN', false)
    state.loginHandler.resolve('成功')
    commit('SET_LOGIN_HANDLER', {})
    commit('SET_LOGIN_PROMISE', null)
  },
  cancelLogin({ commit }) {
    commit('SET_NEED_LOGIN', false)
    state.loginHandler.reject({
      response: {
        data: {
          message: '取消登录'
        }
      }
    })
    commit('SET_LOGIN_HANDLER', {})
    commit('SET_LOGIN_PROMISE', null)
  },
  fetchDicts({ commit, state }, code) {
    return new Promise((resolve, reject) => {
      if (state.dicts[code]) {
        resolve(state.dicts[code])
      } else {
        initDicts(code).then(response => {
          const { data } = response
          commit('SET_DICTS', {
            code,
            dicts: data
          })
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
