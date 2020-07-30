import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'

Vue.config.productionTip = false

let headers = {}

if (localStorage.getItem('token')) {
  headers.Authorization = `Bearer ${localStorage.getItem('token')}`
}

Vue.prototype.$http = axios.create({ 
  baseURL: 'http://messaging-app-api.test', 
  headers
})

Vue.mixin({
  methods: {
    /**
     * Format the given errors.
     */
    formatErrors(errors) {
      for (let key in errors) {
        errors[key] = errors[key][0]
      }

      return errors
    },
  },
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
