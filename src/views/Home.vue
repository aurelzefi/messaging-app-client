<template>
  <div class="flex">
    <div class="w-1/3 border-r-2">
      <div class="fixed bg-white w-1/3 border-r-2">
        <ul class="flex items-center p-2 justify-end">
          <li class="mr-6">
            <a>
              <img class="rounded-full h-12 w-12" :src="picture($bus.user.picture)">
            </a>
          </li>

          <li class="mr-6">
            <a>Start New Chat</a>
          </li>

          <li class="mr-6">
            <a class="">Dropdown</a>
          </li>
        </ul>
      </div>

      <div class="mt-16 border-t-2 overflow-auto" style="height: calc(100% - 4em)">
        <ul class="" v-if="chats.length">
          <li class="flex justify-between items-center px-3 py-5 border-b-2" v-for="chat in chats" :key="chat.id" @click="getChat(chat)">
            <img class="rounded-full h-12 w-12" :src="picture(chatUser(chat).picture)">

            <div class="ml-2">
              {{ chatUser(chat).name }}

              {{ truncate(chat.content, 40) }}
            
              <span>{{ formatDate(chat.created_at) }}</span>
            </div>
          </li>
        </ul>

        <div v-else>
          No chats to display.
        </div>
      </div>
    </div>

    <div class="w-2/3 h-full" v-if="activeChat">
      <div class="fixed bg-white w-2/3 top-0">
        <div class="flex justify-between items-center p-2">
          <div class="flex items-center">
            <img class="rounded-full h-12 w-12" :src="picture(chatUser(activeChat).picture)">
            <span class="ml-2">{{ chatUser(activeChat).name }}</span>
          </div>

          <div>
            <button class="outline-none p-2 bg-blue-500 text-white rounded-md border-blue-700" type="button" @click="openFileBrowser">Add Files</button>
            <input class="hidden" type="file" ref="files" multiple @change="handleFiles">
          </div>
        </div>
      </div>

      <div class="h-full mt-16 overflow-auto border-t-2">
        <ul class="p-2" v-if="messages.length">
          <li class="w-2/3 p-2 mt-2 bg-green-200 rounded-md" :class="{ 'ml-auto': isSent(message) }" v-for="message in messages" :key="message.id">
            {{ message.content }}
          </li>
        </ul>
      </div>

      <form class="fixed bottom-0 p-3 w-2/3" @submit.prevent="sendMessage">
        <input class="p-2 outline-none border-gray-500 border w-full rounded" type="text" v-model="form.content" placeholder="Type a message">
      </form>
    </div>

    <div class="w-2/3 my-auto text-center" v-else>
      <img class="mx-auto" src="./../assets/logo.png">

      Empty space here...
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chats: [],

      messages: [],

      activeChat: null,

      form: {
        receiver_id: '',
        content: '',
        files: []
      }
    }
  },

  mounted() {
    this.getChats()
  },

  methods: {
    getChats() {
      this.$http.get('/api/chats')
        .then(response => {
          this.chats = response.data
        })
    },

    getChat(chat) {
      this.activeChat = chat
      this.form.receiver_id = this.chatUser(chat).id;

      this.$http.get(`/api/chats/${this.chatUser(chat).id}`)
        .then(response => {
          this.messages = response.data
        })
    },

    chatUser(chat) {
      return this.$bus.user.id === chat.sender.id ? chat.receiver : chat.sender;
    },

    isSent(message) {
      return this.$bus.user.id === message.sender_id;
    },

    /**
     * Log the user out of the application.
     */
    logout() {
      this.$http.delete(`/api/sanctum/token/${this.tokenId()}`)
        .then(() => {
          this.$bus.user = null
          
          localStorage.removeItem('token')
          
          delete this.$http.defaults.headers.Authorization
          
          this.$router.push('/')
        })
    },

    sendMessage() {
      const formData = new FormData()
      
      formData.append('content', this.form.content)
        
      this.form.files.forEach((file, key) => {
        formData.append(`files[${key}]`, file);
      });

      this.$http.post(`/api/messages`, formData)
        .then(response => {
          console.log(response.data)
        })
        .catch(error => {
          console.log(error)
        })
    },

    /**
     * Get the ID for the token.
     */
    tokenId() {
      return localStorage.getItem('token').split('|')[0]
    },

    /**
     * Open the file browser to choose files.
     */
    openFileBrowser() {
      this.$refs.files.click();
    },

    /**
     * Add the chosen files to the form.
     */
    handleFiles() {
      this.form.files = Object.values(this.$refs.files.files);
    },
  }
}
</script>
