<template>
  <div class="flex h-screen">
    <div class="w-1/3 border-r-2">
      <div class="w-1/3 fixed bg-white border-r-2">
        <ul class="flex items-center p-2 justify-end">
          <li class="mr-6">
            <a>
              <img class="h-12 w-12 rounded-full" :src="picture($bus.user.picture)">
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

      <div class="mt-16 border-t-2 overflow-auto" style="height: calc(100% - 4rem)">
        <ul v-if="chats.length">
          <li class="px-3 py-5 flex justify-between items-center border-b-2" v-for="chat in chats" :key="chat.id" @click="getChat(chat)">
            <img class="h-12 w-12 rounded-full" :src="picture(chatUser(chat).picture)">

            <div class="ml-2">
              {{ chatUser(chat).name }}

              <span v-if="chat.typing">Typing...</span>
              <span v-else>{{ truncate(chat.content, 40) }}</span>
            
              <span>{{ formatDate(chat.created_at) }}</span>
            </div>
          </li>
        </ul>

        <div v-else>
          No chats to display.
        </div>
      </div>
    </div>

    <div class="w-2/3" v-if="activeChat">
      <div class="w-2/3 fixed bg-white top-0">
        <div class="flex justify-between items-center p-2">
          <div class="flex items-center">
            <img class="rounded-full h-12 w-12" :src="picture(chatUser(activeChat).picture)">
            <span class="ml-2">{{ chatUser(activeChat).name }}</span>
            <span v-if="activeChat.typing === true">Typing...</span>
          </div>

          <div>
            <button class="outline-none p-2 bg-blue-500 text-white rounded-md border-blue-700" type="button" @click="openFileBrowser">Add Files</button>
            <input class="hidden" type="file" ref="files" multiple @change="handleFiles">
          </div>
        </div>
      </div>

      <div ref="messages" class="mt-16 overflow-auto border-t-2" style="height: calc(100% - 8rem)">
        <ul class="p-2" v-if="messages.length">
          <li class="w-2/3 p-2 mt-2 bg-green-200 rounded-md" :class="{ 'ml-auto': messageIsSent(message) }" v-for="message in messages" :key="message.id">
            {{ message.content }}
          </li>
        </ul>
      </div>

      <form class="w-2/3 h-16 fixed flex items-center px-2 border-t-2" @submit.prevent="sendMessage">
        <input class="w-full p-2 outline-none border-gray-500 border rounded" type="text" v-model="form.content" @keyup="whisper" placeholder="Type a message">
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
  /**
   * The component's data.
   */
  data() {
    return {
      form: {
        receiver_id: '',
        content: '',
        files: []
      },

      errors: [],
      chats: [],
      messages: [],
      activeChat: null
    }
  },

  /**
   * Mount the component.
   */
  mounted() {
    this.getChats()
    
    this.listenForTypings()
    this.listenForMessages()
  },

  /**
   * Update the component.
   */
  updated() {
    if (this.messages.length) {
      this.scrollToMessagesBottom()
    }
  },

  methods: {
    /**
     * Get the chats.
     */
    getChats() {
      this.$http.get('/api/chats')
        .then(response => {
          this.chats = response.data
        
          this.chats.forEach(chat => {
            chat.typing = false
          })
        })
    },

    /**
     * Listen for typings.
    */
    listenForTypings() {
      this.$echo.private(`typing.${this.$bus.user.id}`)
        .listenForWhisper('typing', (e) => {
            let chat = this.chats.find(chat => {
              return this.chatUser(chat).id === e.user.id
            })

            let key = this.chats.indexOf(chat)

            chat.typing = true

            this.$set(this.chats, key, chat)

            setTimeout(() => {
              chat.typing = false

              this.$set(this.chats, key, chat)
            }, 2000)
        })
    },

    /**
     * Listen for messages.
     */
    listenForMessages() {
      var activeUser = this.activeUser()

      this.$echo.private(`App.User.${this.$bus.user.id}`)
        .listen('MessageSent', (e) => {
          if (activeUser && activeUser.id === e.message.sender_id) {
            this.messages.push(e.message)
          }
        })
        .listen('MessageUnsent', (e) => {
          if (activeUser && activeUser.id === e.message.sender_id) {
            this.messages.splice(
              this.messages.findIndex(m => m.id === e.message.id), 
            )
          }
        })
    },

    /**
     * Send a whisper that the user is typing.
     */
    whisper() {
      this.$echo.private(`typing.${this.activeUser().id}`)
        .whisper('typing', {
          user: this.$bus.user
        })
    },

    /**
     * Scroll to the botton of the messages container.
     */
    scrollToMessagesBottom() {
      let container = this.$refs.messages;

      container.scrollTop = container.scrollHeight;
    },

    /**
     * Get the messages for the given chat.
     */
    getChat(chat) {
      this.activeChat = chat
      this.form.receiver_id = this.chatUser(chat).id;

      this.$http.get(`/api/chats/${this.chatUser(chat).id}`)
        .then(response => {
          this.messages = response.data
        })
    },

    /**
     * Get the active user.
     */
    activeUser() {
      if (this.activeChat) {
        return this.chatUser(this.activeChat)
      }
    },

    /**
     * Get the user from the chat.
     */
    chatUser(chat) {
      return this.$bus.user.id === chat.sender.id ? chat.receiver : chat.sender
    },

    /**
     * Determine if the given message is sent.
     */
    messageIsSent(message) {
      return this.$bus.user.id === message.sender_id
    },

    /**
     * Log the user out of the application.
     */
    logout() {
      this.$http.delete(`/api/sanctum/token/${this.tokenId()}`)
        .then(() => {
          this.$echo.leave(`typing.${this.$bus.user.id}`)
          this.$echo.leave(`App.User.${this.$bus.user.id}`)

          this.$bus.user = null
          
          localStorage.removeItem('token')
          
          delete this.$http.defaults.headers.Authorization
          
          this.$router.push('/')
        })
    },

    /**
     * Send a message.
     */
    sendMessage() {
      const formData = new FormData()
      
      formData.append('content', this.form.content)
      formData.append('receiver_id', this.form.receiver_id)
        
      this.form.files.forEach((file, key) => {
        formData.append(`files[${key}]`, file)
      });

      this.$http.post(`/api/messages`, formData)
        .then(response => {
          this.messages.push(response.data)

          this.form.content = ''
          this.form.files = []
        })
        .catch(error => {
          this.errors = this.formatErrors(error.response.data.errors)
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
      this.$refs.files.click()
    },

    /**
     * Add the chosen files to the form.
     */
    handleFiles() {
      this.form.files = Object.values(this.$refs.files.files)
    },
  }
}
</script>
