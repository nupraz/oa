import http from '@/utils/http'
import MD5 from 'crypto-js/md5'
import Base64 from 'crypto-js/enc-base64'
import Utf8 from 'crypto-js/enc-utf8'

export function fetchRoutes() {
  return http.get('/api/authority/routes')
}

export function login(authority) {
  let authorityRequest = {...authority}
  authorityRequest.loginType = process.env.VUE_APP_LOGINTYPE
  if (authority.password) {
    authorityRequest.password = Base64.stringify(Utf8.parse(MD5(authority.password).toString()))
  }
  return http.post('/api/authority/login', authorityRequest)
}

/*export function validateCode() {
  return http.get('/api/authority/code')
}*/

export function logout() {
  return http.post('/api/authority/logout', null, {
    ignoreToken: true
  })
}

export function modifyPassword(data) {
  data.password = Base64.stringify(Utf8.parse(MD5(data.password).toString()))
  data.newPassword = Base64.stringify(Utf8.parse(MD5(data.newPassword).toString()))
  return http.put('/api/authority/password', data)
}

export function getInfo(/*token*/) {
  return http.get('/api/authority/info'/*, {
    params: {
      token
    }
  }*/)
}
