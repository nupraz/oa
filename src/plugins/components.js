import Vue from 'vue'

import { Loading } from 'element-ui'
import {
  Help, Button, Col, Form, FormItem, Hamburger, Input, Row, Scrollbar, Table, TableColumn, Tree, Pagination, Dialog, Tabs, TabPane,
  Select, RadioGroup, CheckboxGroup
} from '@bestvike/components'
import Ellipsis from '@bestvike/components/lib/directives/ellipsis'
import captureReadyImage from '@/assets/capture-ready.png'
import { showLoading } from '@bestvike/utils/lib/element'

Vue.use(Help)
Vue.use(Button)
Vue.use(Col)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Hamburger)
Vue.use(Input)
Vue.use(Row)
Vue.use(Scrollbar)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Tree)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Select)
Vue.use(RadioGroup)
Vue.use(CheckboxGroup)

Vue.use(Ellipsis)

Vue.prototype.$loading = param => {
  if (!param) {
    return Loading.service()
  }
  return showLoading(param)
}

Vue.prototype.$APP_ROOT = process.env.VUE_APP_ROOT === '/' ? '' : process.env.VUE_APP_ROOT
Vue.prototype.$APP_CODE = process.env.VUE_APP_CODE || ''
Vue.prototype.$HELP_BASE = '@/assets/help/'
// 全局上传地址
Vue.prototype.$COMPONENTS = {
  uploadAction: '/api/file/uploads',
  captureReadyImage: captureReadyImage
}
import '@bestvike/lightgallery/src/sass/lightgallery.scss'
///// 注意 下面常量计划删除 /////
Vue.prototype.$CONST = {
  form: {
    labelWidth: '90px'
  },
  row: {
    gutter: 20
  },
  col: {
    // 默认
    // :xs="24" :sm="12" :md="12" :lg="6" :xl="6"
    layout: {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 6,
      xl: 6
    },
    //设置一行三列
    layout1: {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 8,
      xl: 8
    },
    // 占两列宽度
    // :xs="24" :sm="24" :md="12" :lg="12" :xl="12"
    layout2: {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12
    },
    //设置一行一列
    layout3: {
      xs: 24,
      sm: 24,
      md: 24,
      lg: 24,
      xl: 24
    },
    // 弹窗每行2列
    dialog2: {
      xs: 24,
      sm: 24,
      md: 12,
      lg: 12,
      xl: 12
    },
    // 弹窗每行3列
    dialog3: {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 8,
      xl: 8
    },
    layout4: {
      xs: 24,
      sm: 24,
      md: 24,
      lg: 16,
      xl: 16
    }
  }
};
