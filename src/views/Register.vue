<template>
  <div>
    <div>
      <img src="./../assets/logo.png">
    </div>

    <form>
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
        <button type="button" @click="register">Register</button>

        Already have an account? <router-link to="login">Login</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { remote } from 'electron'

export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        device_name: remote.getCurrentWindow().webContents.session.getUserAgent()
      },

      errors: {}
    }
  },

  mounted() {

  },

  methods: {
    register() {
      this.$http.post('/api/register', this.form)
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
