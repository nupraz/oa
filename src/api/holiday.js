import http from '@/utils/http'

//查询节假日配置
export function fetchHolidayConfig(query) {
  return http.get('/api/holidays', {
    params: query
  })
}
export function modifyHolidayConfig(data) {
  return http.put('/api/holidays', data)
}
export function createHolidayConfig(data) {
  return http.post('/api/holidays', data)
}
//删除节假日配置
export function deleteHolidayConfig(id) {
  return http.delete('/api/holidays/' + id)
}
//导入节假日配置数据
export function importHolidayConfigExcel(file) {
  return http.upload('/api/holidays/upload',file)
}
//读取数据存入数据库
export function importHolidayConfigFunction(data) {
  return http.post('/api/holidays/imports',data)
}