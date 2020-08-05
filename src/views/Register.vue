<template>
  <div>
    <div>
      <img src="./../assets/logo.png">
    </div>

    <form @submit.prevent="register">
      <div>
        <label for="name">Name</label>
        <input id="name" type="text" v-model="form.name">
      </div>

      <div>
        <label for="email">Email</label>
        <input id="email" type="email" v-model="form.email">
      </div>

      <div>
        <label for="password">Password</label>
        <input id="password" type="password" v-model="form.password">
      </div>

      <div>
        <label for="password-confirm">Confirm Password</label>
        <input id="password-confirm" type="password" v-model="form.password_confirmation">
      </div>

      <div>
        <button type="submit">Register</button>

        Already have an account? <router-link to="login">Login</router-link>
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
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        device_name: os.hostname()
      },

      errors: {}
    }
  },

  methods: {
    /**
     * Register the user.
     */
    register() {
      this.$http.post('/api/user', this.form)
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
