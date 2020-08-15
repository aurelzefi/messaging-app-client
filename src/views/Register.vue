<template>
  <div class="antialiased min-h-screen flex flex-col justify-center items-center bg-gray-200">
      <div class="h-24 w-24">
        <img src="./../assets/logo.png">
      </div>

      <div class="mt-6 px-6 py-4 bg-white rounded" style="width: 24rem;">
        <form @submit.prevent="register">
          <div>
            <label class="block text-sm text-gray-700" for="name">Name</label>
            <input class="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" :class="{ 'border-red-700': this.errors.name }" id="name" type="text" v-model="form.name" v-focus>
            <span class="text-xs text-red-700">{{ this.errors.name }}</span>
          </div>

          <div class="mt-4">
            <label class="block text-sm text-gray-700" for="email">Email</label>
            <input class="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" :class="{ 'border-red-700': this.errors.email }" id="email" type="email" v-model="form.email">
            <span class="text-xs text-red-700">{{ this.errors.email }}</span>
          </div>

          <div class="mt-4">
            <label class="block text-sm text-gray-700" for="password">Password</label>
            <input class="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" :class="{ 'border-red-700': this.errors.password }" id="password" type="password" v-model="form.password">
            <span class="text-xs text-red-700">{{ this.errors.password }}</span>
          </div>

          <div class="mt-4">
            <label class="block text-sm text-gray-700" for="password-confirm">Confirm Password</label>
            <input class="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" id="password-confirm" type="password" v-model="form.password_confirmation">
          </div>

          <div class="flex justify-between items-center mt-4 text-sm">
            <button class="py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded text-white outline-none focus:outline-none" type="submit">Register</button>

            <div class="text-gray-700">
              Already have an account? <router-link class="px-1 hover:underline" to="login">Login</router-link>
            </div>
          </div>
        </form>
      </div>
  </div>
</template>

<script>
import os from 'os'

export default {
  /**
   * The component's data.
   */
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
      this.errors = {}

      this.$http.post('/api/user', this.form)
        .then(response => {
          this.handleAfterAuth(response.data.token)
        })
        .catch(error => {
          this.errors = this.formatErrors(error.response.data.errors)
        })
    }
  }
}
</script>
