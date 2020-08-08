<template>
  <div class="fixed h-full w-full flex justify-center items-center z-20">
    <button class="fixed h-full w-full cursor-default focus:outline-none bg-black opacity-75" @click="hide"></button>
    <div class="relative bg-white rounded-md" style="width: 36rem;">
      <div class="p-3 border-b border-gray-200">Start New Chat</div>

      <div class="p-3 border-gray-200">
        <input class="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" id="user" type="text" value="Jane Doe" v-model="query" v-focus @keyup="getUsers" placeholder="Search users by name or email...">

        <ul class="mt-2 border rounded border-gray-200" v-if="users.length">
          <button class="w-full flex items-center p-2 hover:bg-gray-200 focus:outline-none" :class="{ 'border-t border-gray-200': users.indexOf(user) !== 0 }" v-for="user in users" :key="user.id" @click="start(user)">
            <img class="h-10 w-10 rounded-full" :src="picture(user.picture)">

            <div class="flex flex-col items-start ml-3">
              <span class="text-gray-900">{{ user.name }}</span>
              <span class="text-xs text-gray-700">{{ user.email }}</span>
            </div>
          </button>
        </ul>

        <div class="mt-2 text-sm text-center text-gray-900" v-if="query.length && ! users.length">
          No matching users.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['hide', 'method'],

  data() {
    return {
      query: '',
      users: []
    }
  },
  
  methods: {
    getUsers() {
      if (this.query.length === 0) {
        this.users = []

        return
      }

      this.$http.get(`/api/users?query=${this.query}&take=5`)
        .then(response => {
          this.users = response.data
        })
    },

    start(user) {
      this.method(user)
    }
  }
}
</script>
