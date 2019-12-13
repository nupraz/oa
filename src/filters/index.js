import i18n from '@/lang'

/**
 * 路由名称翻译
 * @param router 路由配置
 */
export function translate (meta) {
  if (!meta) {
    return null
  }
  if (meta.title.indexOf('${') === 0 && meta.title.indexOf('}') === meta.title.length - 1 ) {
    const titleName = meta.title.substring(2, meta.title.length - 1)
    return i18n.t(`route.${titleName}`)
  }
  return meta.title
}

export function key(item) {
  for (let p in item) {
    return p
  }
}
export function value(item, key) {
  for (let p in item) {
    if (!key) {
      return item[p]
    }
    return item[p][key]
  }
}

export function selection(item) {
  return item && item.selection
}
export function one(arr) {
  return arr && arr.length === 1
}

/**
 * Upper case first char
 * @param {String} string
 */
export function uppercaseFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * 弹窗考勤时间格式化
 * @param val
 * @returns {string}
 */
export function formatDateByAttendDialog(val) {
  let unixTime = val.toString()
  let a = unixTime.replace("/Date(", "").replace(")/", "");
  let date = new Date(parseInt(a));
  let h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  let minute = date.getMinutes();
  let second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return h + ':' + minute + ':' + second;
}

/**
 * 组合显示代码和名称
 */
export function comboShow(code, name) {
  if (!code) {
    return name
  }
  return '（' + code + '）' + name
}

export function file(value) {
  var unitArr = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  var index = 0
  var srcSize = parseFloat(value)
  index = Math.floor(Math.log(srcSize) / Math.log(1024))
  var size = srcSize / Math.pow(1024, index)
  size = size.toFixed(2)
  return size + unitArr[index]
}

export function ellipsis(value, length) {
  if (!value || value.length <= length) {
    return value
  }
  return value.slice(0, length - 3) + '...'
}
