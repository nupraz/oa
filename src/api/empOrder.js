import http from '@/utils/http'

//查询员工订餐信息
export function queryEmpOrderInfo(query) {
  return http.get('/api/empOrderInfo', {
    params: query
  })
}
//新增员工订餐信息
export function addEmpOrderInfo(data) {
  return http.post('/api/empOrderInfo', data)
}
//修改员工订餐信息
export function editEmpOrderInfo(data) {
  return http.put('/api/empOrderInfo', data)
}
//删除员工订餐信息
export function deleteEmpOrderInfo(ids) {
  return http.delete('/api/empOrderInfo/' + ids)
}
//导出Excel员工订餐信息
export function exportEmpOrderData(query) {
  return http.post('/api/empOrderInfo/exportOrdersExcel', {
    params: query
  })
}
//是否显示添加按钮
export function fetchIsShowAddAndEmpOptions(query) {
  return http.get('/api/empOrderInfo/fetchIsShowAddAndEmpOptions', {
    params: query
  })
}
//获取员工姓名List
export function fetchEmpData(query) {
  return http.get('/api/empOrderInfo/fetchEmpData', {
    params: query
  })
}
//获取可用餐厅信息
export function fetchRestaurantsInUse(query) {
  return http.get('/api/empOrderInfo/restaurants', {
    params: query
  })
}
//通过餐厅id 拉取可用菜单
export function fetchMenusInUseByRestId(id) {
  return http.get('/api/empOrderInfo/' + id + '/menus')
}
