import Vue from 'vue'
import {
  Aside, Header, Container, Scrollbar, Slider, Progress,
  Alert, Dialog, Tooltip,
  Tabs, TabPane, Breadcrumb, BreadcrumbItem,
  Menu, Submenu, MenuItem,
  Input, Button, Link, Select, Option, Radio, RadioGroup, RadioButton, Checkbox, CheckboxGroup, Switch,
  Form, FormItem, Table, TableColumn, Pagination,
  Upload, Tree,
  Card, Row, Col,
  Dropdown, DropdownMenu, DropdownItem, Tag, ColorPicker,DatePicker,TimePicker,Autocomplete,Steps,Step,Cascader,
  Loading, Popover, Message, MessageBox, Transfer } from 'element-ui'
import Cookies from 'js-cookie'

Vue.prototype.$ELEMENT = { size: Cookies.get('size') || 'medium' }

Vue.use(Aside)
Vue.use(Header)
Vue.use(Container)
Vue.use(Scrollbar)
Vue.use(Slider)
Vue.use(Progress)
Vue.use(Alert)
Vue.use(Dialog)
Vue.use(Tooltip)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Select)
Vue.use(Option)
Vue.use(Input)
Vue.use(Button)
Vue.use(Link)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(RadioButton)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Switch)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Pagination)
Vue.use(Upload)
Vue.use(Tree)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Tag)
Vue.use(ColorPicker)
Vue.use(DatePicker)
Vue.use(TimePicker)
Vue.use(Autocomplete)
Vue.use(Steps)
Vue.use(Step)
Vue.use(Cascader)
Vue.use(Loading.directive)
Vue.use(Popover)
Vue.use(Transfer)
//Vue.prototype.$loading = Loading.service
Vue.prototype.$message = Message
const MsgBox = MessageBox;
Vue.prototype.$msgbox = MsgBox;
Vue.prototype.$alert = MsgBox.alert;
Vue.prototype.$confirm = (message, title, options) => {
  if (!options) {
    options = {}
  }
  options.cancelButtonClass = 'confirm-cancel-normal'
  options.closeOnClickModal = false
  options.closeOnPressEscape = false
  return MsgBox.confirm(message, title, options)
};
Vue.prototype.$prompt = MsgBox.prompt;
