import Vue from 'vue'
import { Icon } from '@bestvike/components'// svg组件

// register globally
Vue.component('BvIcon', Icon)

const req = require.context('./svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
