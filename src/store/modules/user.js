import Cookies from 'js-cookie'
import { login as loginApi, logout as logoutApi, getInfo as getInfoApi } from '@/api/authority'
import { modifyAvatar } from '@/api/authority/user'
import { auth } from '@bestvike/utils'
import { resetRouter } from '@/router'

const defaultSettings = {
  tagsView: true,
  fixedHeader: true,
  sidebarLogo: true,
  // 每页显示条数
  tableLimit: 10,
  // 标签页样式 default legacy
  tabsStyle: 'default'
}

const state = {
  token: auth.getToken(),
  needValidateCode: Cookies.get('needValidateCode') || false,
  needRefreshValidateCode: true,
  id: '',
  name: '',
  avatar: '',
  settings: {
    ...defaultSettings
  },
  roles: [],
  userId: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NEED_VALIDATE_CODE: (state, needValidateCode) => {
    if (state.needValidateCode && needValidateCode) {
      // 需要刷新验证码
      state.needRefreshValidateCode = true
    } else {
      state.needRefreshValidateCode = false
    }
    state.needValidateCode = needValidateCode
    if (needValidateCode) {
      Cookies.set('needValidateCode', true)
    } else {
      Cookies.remove('needValidateCode')
    }
  },
  SET_SETTINGS: (state, { settings, clearFirst }) => {
    if (clearFirst) {
      state.settings = {
        ...defaultSettings
      }
    }
    for (let p in settings) {
      state.settings[p] = settings[p]
    }
  },
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.settings.hasOwnProperty(key)) {
      state.settings[key] = value
    }
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_USERID: (state, userId) => {
    state.userId = userId
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      loginApi(userInfo).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        auth.setToken(data.token)
        // auth.setRefreshToken(data.refreshToken)
        setTimeout(() => {
          commit('SET_NEED_VALIDATE_CODE', false)
        }, 2000)
        resolve()
      }).catch(error => {
        if (error && error.response && error.response.status === 403) {
          commit('SET_NEED_VALIDATE_CODE', true)
        } else {
          commit('SET_NEED_VALIDATE_CODE', false)
        }
        reject(error)
      })
    })
  },

  refreshToken({ commit }, token) {
    commit('SET_TOKEN', token)
    auth.setToken(token)
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfoApi(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { roles, id, name, avatar, settingsMap, userId } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        commit('SET_ROLES', roles)
        commit('SET_ID', id)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_USERID', userId)
        commit('SET_SETTINGS', {
          settings: settingsMap || {},
          clearFirst: true
        })
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  needValidateCode({ commit, needValidateCode }) {
    commit('SET_NEED_VALIDATE_CODE', needValidateCode)
  },

  // 登出
  logout({ commit, dispatch, state }) {
    return new Promise((resolve, reject) => {
      logoutApi(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        dispatch('tagsView/delAllViews', null, { root: true })
        auth.removeToken()
        auth.removeRefreshToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit, dispatch }, token) {
    return new Promise(resolve => {
      if (!token) {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        dispatch('tagsView/delAllViews', null, { root: true })
        auth.removeToken()
        auth.removeRefreshToken()
      } else {
        commit('SET_TOKEN', token)
        auth.setToken(token)
      }
      resolve()
    })
  },

  // 设置头像
  setAvatar({ commit }, avatar) {
    modifyAvatar(avatar).then(() => {
      commit('SET_AVATAR', avatar)
    }).catch(() => {})
  },
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  changeSettings({ commit }, settings) {
    commit('SET_SETTINGS', {
      settings
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
