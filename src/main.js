import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'
import moment from 'moment'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

Vue.config.productionTip = false

const API_URL = 'http://messaging-app-api.test'

if (localStorage.getItem('token')) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`
}

Vue.prototype.$http = axios.create({ baseURL: API_URL })

Vue.prototype.$bus = new Vue()

window.Pusher = Pusher

Vue.prototype.$echo = new Echo({
  broadcaster: 'pusher',
  key: 'key',
  forceTLS: false,
  wsHost: window.location.hostname,
  wsPort: 6001,
  disableStats: true,
  authEndpoint: `${API_URL}/api/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }
})

Vue.mixin({
  methods: {
    /**
     * Format the given errors.
     */
    formatErrors(errors) {
      const items = {}

      for (let key in errors) {
        items[key] = errors[key][0]
      }

      return items
    },

    /**
     * Handle the after authentication actions.
     */
    handleAfterAuth(token) {
      localStorage.setItem('token', token)

      this.$http.defaults.headers.common.Authorization = `Bearer ${token}`
      this.$echo.connector.pusher.config.auth.headers.Authorization = `Bearer ${token}`

      this.$router.push('/home')
    },

    /** 
     * Get the full URL for the given picture.
    */
    picture(name) {
      return `${API_URL}/pictures/${name}`
    },

    /**
     * Get the full URL for the given file.
     */
    filePath(id) {
      return `${API_URL}/api/files/${id}?api_token=${localStorage.getItem('token')}`
    },

    /**
     * Get a human readable date.
     */
    dateFromNow(date) {
      return moment(date).fromNow()
    },

    /**
     * Format the given date.
     */
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD HH:mm')
    },

    time(date) {
      return moment(date).format('HH:mm')
    }
  },
})

Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
