import http from '@/utils/http'

export function fetchAllDepartments(){
  return http.get('/api/departments/all')
}
export function fetchDepartments(query) {
  return http.get('/api/departments', {
    params: query
  })
}
export function createDepartment(data) {
  return http.post('/api/departments', data)
}
export function modifyDepartment(data) {
  return http.put('/api/departments', data)
}
export function removeDepartments(ids) {
  return http.delete('/api/departments/' + ids)
}



export function showData() {
  return http.post('/api/sectoral/primaryShow')
}
export function submitData(score) {
  return http.post('/api/sectoral/primaryEvaluation',score)
}
export function showDataTwo() {
  return http.post('/api/sectoral/twoLevelEvaluation')
}
export function showDataFinal() {
  return http.post('/api/sectoral/topLevel')
}
export function submitDataTwo(score) {
  return http.post('/api/sectoral/SecondaryToSubmit',score)
}
export function Calculation(score) {
  return http.post('/api/sectoral/topEvaluation',score)
}
export function finalToSubmit(score) {
  return http.post('/api/sectoral/finalToSubmit',score)
}
