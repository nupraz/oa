import http from '@/utils/http'

export function fetchRoles(query) {
  return http.get('/api/roles', {
    params: query
  })
}
export function createRole(data) {
  return http.post('/api/roles', data)
}
export function modifyRole(data) {
  return http.put('/api/roles', data)
}
export function removeRoles(ids) {
  return http.delete('/api/roles/' + ids)
}
export function removeShow(id) {
  return http.get('/api/roles/' + id + '/show')
}
export function fetchAllRoles(query) {
  return http.get('/api/roles/all', {
    params: query
  })
}
export function fetchRoleRoutes(id) {
  return http.get('/api/roles/' + id + '/routes')
}
export function saveRoleRoutes(id, data) {
  return http.post('/api/roles/' + id + '/routes', data)
}