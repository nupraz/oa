import http from '@/utils/http'

export function fetchUsers(query) {
  return http.get('/api/users', {
    params: query
  })
}
// 保存用户头像
export function modifyAvatar(avatar) {
  return http.put('/api/users/avatar', avatar)
}
export function modifySettings(settings) {
  return http.put('/api/users/settings', settings)
}
export function createUser(data) {
  return http.post('/api/users', data)
}
export function modifyUser(data) {
  return http.put('/api/users', data)
}
export function removeUsers(ids) {
  return http.delete('/api/users/' + ids)
}
export function resetPass(id) {
  return http.put('/api/users/' + id + '/password/reset')
}
//查询用户权限
export function fetchGrants(id) {
  return http.get('/api/users/' + id + '/roles')
}
//保存用户授权角色
export function saveGrants(id, data) {
  return http.put('/api/users/' + id + '/roles', data)
}