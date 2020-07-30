<template>
  <div>
    <div>
      <img src="./../assets/logo.png">
    </div>

    <form>
      <div>
        <label for="email">Email</label>
        <input id="email" type="text" v-model="form.email"> 
      </div>

      <div>
        <label for="password">Password</label>
        <input id="password" type="password" v-model="form.password"> 
      </div>

      <div>
        <button type="button" @click="login">Login</button>
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
        email: '',
        password: '',
        device_name: remote.getCurrentWindow().webContents.session.getUserAgent()
      },

      errors: {}
    };
  },

  mounted() {
    //
  },

  methods: {
    login() {
      this.$http.post('/api/sanctum/token', this.form)
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(this.formatErrors(error.response.data.errors))
        })
    },
  },
}
</script>
