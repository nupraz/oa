// import { Message } from 'element-ui'
import dynamicLoadScript from './dynamic'

export function getLodop() {
  return new Promise((resolve, reject) => {
    dynamicLoadScript('http://localhost:8000/CLodopfuncs.js', () => {
      return true
    }, () => {
      let LODOP
      try {
        // eslint-disable-next-line no-undef
        LODOP = getCLodop()
        // eslint-disable-next-line no-empty
      } catch (error) { reject(error) }
      if (!LODOP) {
        this.$message({
          message: '未找到打印控件',
          type: 'error'
        })
      }
      resolve(LODOP)
    })
  })
  
  /* let LODOP
  let head = document.head || document.getElementsByTagName("head")[0] || document.documentElement
  let script = document.getElementById('lodop')
  if (!script) {
    script = document.createElement("script");
    script.id = 'lodop'
    script.src = "http://localhost:8000/CLodopfuncs.js"
    head.appendChild(script)
  } */
}
