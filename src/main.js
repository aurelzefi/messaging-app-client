import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'
import moment from 'moment'

Vue.config.productionTip = false

const API_URL = 'http://messaging-app-api.test'

if (localStorage.getItem('token')) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`
}

Vue.prototype.$http = axios.create({ baseURL: API_URL })

Vue.prototype.$bus = new Vue()

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
    file(id) {
      return `${API_URL}/api/files/${id}?api_token=${localStorage.getItem('token')}`
    },

    /**
     * Truncate the given string.
     */
    truncate(string, size = 100) {
      return string.length > size ? `${string.substr(0, size)}...` : string;
    },

    formatDate(timestamp) {
      return moment(timestamp).format('YYYY-MM-DD HH:mm');
    }
  },
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
