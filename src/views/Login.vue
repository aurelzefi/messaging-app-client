<template>
  <div>
    <div>
      <img src="./../assets/logo.png">
    </div>

    <form @submit.prevent="login">
      <div>
        <label for="email">Email</label>
        <input id="email" type="text" v-model="form.email"> 
      </div>

      <div>
        <label for="password">Password</label>
        <input id="password" type="password" v-model="form.password"> 
      </div>

      <div>
        <button type="submit">Login</button>

        Don't have an account? <router-link to="/register">Register</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import os from 'os'

export default {
  data() {
    return {
      form: {
        email: '',
        password: '',
        device_name: os.hostname()
      },

      errors: {}
    }
  },

  methods: {
    /**
     * Log the user into the application.
     */
    login() {
      this.$http.post('/api/tokens', this.form)
        .then(response => {
          this.handleAfterAuth(response.data.token)
        })
        .catch(error => {
          this.errors = this.formatErrors(error.response.data.errors)
        })
    },
  },
}
</script>
