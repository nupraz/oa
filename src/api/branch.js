import http from '@/utils/http'

export function fetchListAreas(query) {
  return http.get('/api/branches', {
    params: query
  })
}

export function modifyAreaNode(data) {
  return http.put('/api/branches', data)
}

export function deleteBranch(id) {
  return http.delete('/api/branches/' + id)
}

export function empListByBranch(id) {
  return http.get('/api/branches/' + id + '/employees')
}

export function toFindDeptEmpSetting(data) {
  return http.post('/api/branches/charts',data)
}