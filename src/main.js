import Vue from 'vue'
import axios from 'axios'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import App from './App.vue'
import router from './router'
import API_URL from './api-url'
import mixin from './mixin'

Vue.config.productionTip = false

if (localStorage.getItem('token')) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`
}

Vue.prototype.$http = axios.create({ baseURL: API_URL })

Vue.prototype.$bus = new Vue({
  data: {
    user: null,
    activeUser: null,
    onlineUsers: [],
    chats: [],
    messages: [],
    scroll: null
  }
})

window.Pusher = Pusher

Vue.prototype.$echo = new Echo({
  broadcaster: 'pusher',
  key: 'key',
  forceTLS: false,
  wsHost: 'localhost',
  wsPort: 6001,
  disableStats: true,
  authEndpoint: `${API_URL}/api/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }
})

Vue.mixin(mixin)

Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})

Vue.directive('scroll-messages', {
  inserted: function (el, method) {
    method.value()
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
