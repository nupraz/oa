import http from '@/utils/http'

export function fetchPosts(query) {
  return http.get('/api/postInfos', {
    params: query
  })
}
//查询全部岗级信息
export function fetchPostsAll() {
  return http.get('/api/postInfos/all')
}
export function creatPost(data) {
  return http.post('/api/postInfos', data)
}
export function modifyPost(data) {
  return http.put('/api/postInfos', data)
}
export function removePost(ids) {
  return http.delete('/api/postInfos/' + ids)
}

