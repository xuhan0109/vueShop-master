import Vue from 'vue'
import App from './App.vue'

import VueRouter from 'vue-router'
import router from './router'
// 引用axios
import axios from 'axios'
// 引用element-ui组件
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// 引用tree-Table插件
import TreeTable from 'vue-table-with-tree-grid'
// 引用日期格式化插件
import moment from 'moment'
// 导入全局样式表
import './assets/css/global.css'
// 引用富文本编辑器插件
import VueQuillEditor from 'vue-quill-editor'
// 引用富文本编辑器样式文件
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'


Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.use(VueQuillEditor)
Vue.component('tree-table', TreeTable)
moment.locale('zh-cn')
Vue.prototype.$moment = moment

new Vue({
  render: h => h(App),
  router,
  beforeCreate() {
    Vue.prototype.$bus = this
    Vue.prototype.$http = axios
    axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    // 通过axios请求拦截器添加token
    axios.interceptors.request.use(config => {
      config.headers.Authorization = sessionStorage.getItem('token')
      return config
    })
  }
}).$mount('#app')
