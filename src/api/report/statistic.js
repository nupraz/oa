import http from '@/utils/http'

//我所属部门或我的下级部门(只有二级部门才有记录)
export function fetchdepReportData(query) {
  return http.get('/api/depreport', {
    params: query
  })
}
//我的评价记录
export function fetchdepRecordData(query) {
  return http.get('/api/deprecord', {
    params: query
  })
}

//数据导出
export function exportDepReportExcel(data) {
  return http.post('/api/depreport/exports',data)
}
export function exportDepRecordExcel(data) {
  return http.post('/api/deprecord/exports',data)
}
export function exportEmpRecordExcel(data) {
  return http.post('/api/emprecord/exports',data)
}
export function exportEmpReportExcel(data) {
  return http.post('/api/allemprecord/exports',data)
}
//部门绩效导入模板下载
export function downloadTemplate(data) {
  return http.download('/api/dep/template',data)
}
//员工绩效导入模板下载
export function downloadEmpTemplate(data) {
  return http.download('/api/emp/template',data)
}
//导入部门绩效
export function importDepFile(file,data) {
  return http.upload('/api/dep/imports',file,data)
}
//导入员工绩效
export function importEmpFile(file,data) {
  return http.upload('/api/emp/imports',file,data)
}
//查询员工评价记录报表
export function fetchempRecordData(query) {
  return http.get('/api/emprecord', {
    params: query
  })
}
//查询部门得分记录报表
export function fetchListData(query) {
  return http.get('/api/sectoral/fetchSelfDept', {
    params: query
  })
}
//确认导入部门评价记录
export function insertReport(data) {
  return http.post('/api/dept/insert',data)
}
//确认导入员工评价记录
export function insertEmpRecord(data) {
  return http.post('/api/emp/insert',data)
}
//查询评价进度
export function fetchProgressData(query) {
  return http.get('/api/sectoral/evaluationProgress', {
    params: query
  })
}
//员工考核上报
export function fetchEmpReportData(query) {
  return http.get('/api/empAssessRecord', {
    params: query
  })
}
export function creatPost(data) {
  return http.post('/api/postInfos', data)
}
//员工考核修改
export function modifyPost(data) {
  return http.put('/api/empAssessRecord/updateEmpAssRecord', data)
}
//员工考核上报
export function submitEmpReportData(data) {
  return http.post('/api/emprecord/save',data)
}
//员工考核测算
export function empReportCalculation(data) {
  return http.post('/api/empAssessRecord/reportingMeasurement',data)
}
