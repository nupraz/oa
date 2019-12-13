// import Vue from 'vue'
import { constantRoutes, errorRoutes } from '@/router'
// import { fetchRoutes } from '@/api/authority'

const _import = process.env.NODE_ENV === 'production' ? file => () => import('@/views/' + file) : file => require('@/views/' + file).default
import Layout from '@/layout'

/*function filterAsyncRoutes(routes, authorityRoutes) {
  let results = []
  routes.forEach(route => {
    let tmp = {}
    for (let p in route) {
      if (p === 'meta') {
        tmp.meta = {...route.meta}
      } else if (p !== 'children' && p !== 'component') {
        tmp[p] = route[p]
      }
    }
    if (route.component === 'Layout') { //Layout组件特殊处理
      route.component = Layout
    } else {
      route.component = _import(route.component)
    }
    if (route.children) {
      tmp.children = filterAsyncRoutes(route.children, authorityRoutes)
    }
    if (authorityRoutes[tmp.id] && authorityRoutes[tmp.id].length > 0) {
      if (!tmp.meta) {
        tmp.meta = {}
      }
      tmp.meta.authoritiedOperates__ = [...(authorityRoutes[tmp.id])]
      // Vue.set(tmp.meta, 'authoritiedOperates__', [...authorityRoutes[tmp.id]])
    }
    
    if (authorityRoutes[tmp.id] !== undefined || (tmp.meta && tmp.meta.authority === false) || (tmp.children && tmp.children.length > 0)) {
      results.push(tmp)
    }
  })
  
  return results
}*/

function initAsyncRoutes(routes) {
  let results = []
  routes.forEach(route => {
    let tmp = {}
    for (let p in route) {
      if (p === 'meta') {
        tmp.meta = {...route.meta}
      } else if (p !== 'children' && p !== 'component') {
        tmp[p] = route[p]
      }
    }
    if (route.component) {
      if (route.component === 'Layout') { //Layout组件特殊处理
        tmp.component = Layout
      } else {
        tmp.component = _import(route.component)
      }
    }
    if (route.children && route.children.length) {
      tmp.children = initAsyncRoutes(route.children)
    }
    results.push(tmp)
  })

  return results
}

const state = {
  routes: [],
  asyncRoutes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
    state.asyncRoutes = routes
  }
}

const actions = {
  /*fetchRoutes() {
    return new Promise((resolve, reject) => {
      fetchRoutes().then(res => {
        const { data } = res
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },*/
  generateRoutes({ commit }, routes) {
    return new Promise(resolve => {
      // const { data } = await fetchRoutes()
      let accessedRoutes = initAsyncRoutes(routes)
      accessedRoutes = accessedRoutes.concat(errorRoutes)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
