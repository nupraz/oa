import http from '@/utils/http'

//查询餐厅信息
export function queryRestaurantInfo(query) {
  return http.get('/api/restaurantInfo', {
    params: query
  })
}
//新增餐厅信息
export function addRestaurantInfo(data) {
  return http.post('/api/restaurantInfo', data)
}
//修改餐厅信息
export function editRestaurantInfo(data) {
  return http.put('/api/restaurantInfo', data)
}
//删除餐厅信息
export function deleteRestaurantInfo(id) {
  return http.delete('/api/restaurantInfo/' + id)
}
//查询菜单信息
export function queryMenuInfo(data) {
  return http.get('/api/menuInfo', {
    params: data
  })
}
//新增菜单信息
export function addMenuInfo(data) {
  return http.post('/api/menuInfo', data)
}
//修改菜单信息
export function editMenuInfo(data) {
  return http.put('/api/menuInfo', data)
}
//删除菜单信息
export function deleteMenuInfo(id) {
  return http.delete('/api/menuInfo/' + id)
}
//发起订餐
export function addOrderInfo(data) {
  return http.post('/api/orderInfo', data)
}
//取消订餐
export function deleteOrderInfo() {
  return http.delete('/api/orderInfo/')
}
//是否正在订餐
export function isHaveOrder() {
  return http.get('/api/isHaveOrder/')
}
//查询所有预设订餐信息
export function queryAllPresetTime(query) {
  return http.get('/api/startOrderInfo/',{
    params: query
  })
}
//删除预设订餐信息
export function deletePresetTimeInfo(ids) {
  return http.delete('/api/startOrderInfo/' + ids)
}
