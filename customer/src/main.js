// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import './common/sass/index.scss'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueSocketio from 'vue-socket.io'
import socketio from 'socket.io-client'

Vue.use(VueSocketio, socketio('http://172.20.10.2:3000'))

// Vue.prototype.$axios = axios  // 将axios配置到Vue中不能使用use方法,只能通过原型模式添加axios的对象
Vue.use(VueAxios, axios) // 通过小插件使用use方法添加axios模块

Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
})

Vue.prototype.deskId = window.location.hash.slice(3, 5)
