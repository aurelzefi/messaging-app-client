<template>
  <div class="h-screen antialiased flex flex-col items-center justify-center" v-if="user">
    <router-link class="fixed top-0 left-0 ml-2 mt-2 p-2 rounded-md hover:bg-gray-200" to="/home">
      <svg class="chevron-left w-8 h-8 text-gray-700" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
    </router-link>

    <img class="w-64 h-64 rounded-full" :src="picture(user.picture)">

    <span class="mt-8">{{ user.name }}</span>
    <span class="mt-4 text-sm">{{ user.email }}</span>
  </div>
</template>

<script>
export default {
  props: ['id'],

  data() {
    return {
      user: null
    }
  },

  mounted() {
    this.getUser()
  },

  methods: {
    getUser() {
      this.$http.get(`/api/users/${this.id}`)
        .then(response => {
          this.user = response.data
        })
    }
  }
}
</script>
