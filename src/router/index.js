import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login',
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresAuth: false }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('token')) {
      if (Vue.prototype.$bus.user) {
        next()
      } else {
        Vue.prototype.$http.get('/api/user')
          .then(response => {
            Vue.prototype.$bus.user = response.data

            next()
          })
      }
    } else {
      next({ path: '/login' })
    }
  } else {
    if (localStorage.getItem('token')) {
      next({ path: '/home' })
    } else {
      next()
    }
  }
})

export default router
