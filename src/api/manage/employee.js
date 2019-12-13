import http from '@/utils/http'

export function fetchAllEmployees() {
  return http.get('/api/employees/deptId')
}
export function fetchEmployees(query) {
  return http.get('/api/employees', {
    params: query
  })
}
export function fetchEmployeesByDeptId(data) {
  return http.post('/api/employees/notInUser',data)
}
export function createEmployee(data) {
  return http.post('/api/employees', data)
}
export function modifyEmployee(data) {
  return http.put('/api/employees', data)
}
export function removeEmployees(ids) {
  return http.delete('/api/employees/' + ids)
}
//下载模板
export function downloadTemplate(data) {
  return http.download('/api/employees/template',data)
}
//导入数据
export function importEmpInfo(file,data){
  return http.upload('/api/employees/import',file,data)
}
export function fetchEmpAssessRecord(query) {
  return http.get('/api/empAssessRecord', {
    params: query
  })
}
//查询部门所属员工
export function deptEmployees(){
  return http.get('/api/deptEmployees')
}
//暂存、保存
export function saveAssessRecord(data) {
  return http.post('/api/empAssessRecord/save',data)
}
//查询用户部门最终得分
export function fetchDeptScore(){
  return http.get('/api/dept/score')
}
