import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

//import recordRouter from './modules/record'
/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if `redirect:noRedirect` will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
    authority: ''                设置false则不校验权限
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/layout/login'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/layout/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/layout/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/layout/errorPage/401'),
    hidden: true
  },
  {
    path: '/user',
    component: Layout,
    redirect: 'profile',
    hidden: true,
    children: [
      {
        path: 'profile',
        component: () => import('@/layout/userProfile'),
        name: 'UserProfile',
        meta: {
          title: '用户中心'
        }
      }
    ]
  },
  {
    path: '',
    component: Layout,
    hidden: true,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard'),
        name: 'Dashboard',
        meta: { title: '${dashboard}', icon: 'dashboard', noCache: true, affix: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
*/
export const errorRoutes = [
  {
    path: '/error',
    component: Layout,
    redirect: 'noRedirect',
    name: 'ErrorPages',
    hidden: true,
    meta: {
      title: '${errorPages}',
      icon: '404',
      authority: false
    },
    children: [
      {
        path: '401',
        component: () => import('@/layout/errorPage/401'),
        name: 'Page401',
        meta: { title: '${page401}', noCache: true }
      },
      {
        path: '404',
        component: () => import('@/layout/errorPage/404'),
        name: 'Page404',
        meta: { title: '${page404}', noCache: true }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true, meta: { authority: false } }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
