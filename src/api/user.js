import http from '@/utils/http'

//分页查询
export function fetchUserInfo(query){
  return http.get('/api/post',{
    params:query
  })
}
//新增
export function addUserInfo(data){
  return http.post('/api/post',data)
}
//修改
export function updateUserInfo(data){
  return http.put('/api/post',data)
}
//删除
export function deleteUserInfo(id){
  return http.delete('/api/post/'+id)
}
