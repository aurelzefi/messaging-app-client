import _ from 'lodash'
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
      return _.mapValues(errors, error => error[0])
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
     * Handle the after logout actions.
     */
    handleAfterLogout() {
      this.$echo.leave(`typing.${this.$bus.user.id}`)
      this.$echo.leave(`App.User.${this.$bus.user.id}`)

      this.$bus.user = null
      
      localStorage.removeItem('token')
      
      delete this.$http.defaults.headers.Authorization
      
      this.$router.push('/')
    },

    /** 
     * Get the full URL for the given picture.
    */
    picture(user) {
      if (user.picture) {
        return `${API_URL}/${user.picture}`
      }

      return '/user.png'
    },

    /**
     * Get the URL for the given file.
     */
    getFile(file) {
      return `${API_URL}/api/files/${file.id}?api_token=${localStorage.getItem('token')}`
    },

    /**
     * Get the date from now.
     */
    dateFromNow(timestamp) {
      return moment(timestamp).fromNow()
    },

    /**
     * Get the date from the given timestamp.
     */
    date(timestamp) {
      return moment(timestamp).format('YYYY-MM-DD')
    },

    /** 
     * Get the time from the given timestamp. 
     */
    time(timestamp) {
      return moment(timestamp).format('HH:mm')
    },

    /** 
     * Get the date and time from the given timestamp. 
     */
    dateTime(timestamp) {
      return moment(timestamp).format('YYYY-MM-DD HH:mm')
    }
  }
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
