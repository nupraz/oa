const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  size: state => state.app.size,
  theme: state => state.app.theme,
  device: state => state.app.device,
  screenfull: state => state.app.screenfull,
  dicts: state => state.app.dicts,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  id: state => state.user.id,
  name: state => state.user.name,
  userId: state => state.user.userId,
  settings: state => state.user.settings,
  roles: state => state.user.roles,
  routes: state => state.user.routes,
  asyncRoutes: state => state.permission.asyncRoutes,
  needLogin: state => state.app.needLogin,
  // 是否需要校验码
  needValidateCode: state => state.user.needValidateCode,
  needRefreshValidateCode: state => state.user.needRefreshValidateCode,
  permissionRoutes: state => state.permission.routes
}
export default getters
