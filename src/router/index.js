import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Settings from '../views/Settings.vue'
import UsersShow from '../views/Users/Show.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login',
    meta: { requiresAuth: false }
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
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/users/:id',
    name: 'users.show',
    props: true,
    component: UsersShow,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    meta: { requiresAuth: true }
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
            Vue.prototype.$bus.$emit('user-set', response.data)

            next()
          })
          .catch(() => {
            localStorage.removeItem('token')

            next({ path: '/login' })
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
