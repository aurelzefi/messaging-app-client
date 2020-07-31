import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'

Vue.config.productionTip = false

const headers = {}

if (localStorage.getItem('token')) {
  headers.Authorization = `Bearer ${localStorage.getItem('token')}`
}

Vue.prototype.$http = axios.create({ 
  baseURL: 'http://messaging-app-api.test', 
  headers
})

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
  },
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
