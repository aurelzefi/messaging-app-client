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
            <button @click="openNewChat = true">New Chat</button>
          </li>

          <li class="mr-6">
            <a class="">Dropdown</a>
          </li>
        </ul>
      </div>

      <div class="mt-16 border-t-2 overflow-auto" style="height: calc(100% - 4rem)">
        <ul class="cursor-pointer" v-if="chats.length">
          <li class="p-3 flex justify-between border-b-2" :class="{ 'bg-gray-300': chatIsActive(chat) }" v-for="chat in chats" :key="chat.id" @click="getChat(chat)">
            <img class="h-12 w-12 rounded-full" :src="picture(chatUser(chat).picture)">

            <div class="ml-2">
              {{ chatUser(chat).name }}

              <span v-if="isTyping(chatUser(chat))">Typing...</span>
              
              <span v-else>
                <template v-if="chat.files.length">Icon</template>
                <template v-if="chat.content">{{ truncate(chat.content, 40) }}</template>
              </span>
            
              <span>{{ formatDate(chat.created_at) }}</span>

              <span class="ml-2" v-if="chat.unread_count">{{ chat.unread_count }}</span>
            </div>
          </li>
        </ul>

        <div v-else>
          No chats to display.
        </div>
      </div>
    </div>

    <div class="w-2/3" v-if="activeUser">
      <div class="w-2/3 fixed bg-white top-0">
        <div class="flex justify-between items-center p-2">
          <div class="flex items-center">
            <img class="rounded-full h-12 w-12" :src="picture(activeUser.picture)">
            <span class="ml-2">{{ activeUser.name }}</span>
            <span v-if="isTyping(activeUser)">Typing...</span>
          </div>

          <div>
            <button class="outline-none p-2 bg-blue-500 text-white rounded-md border-blue-700" type="button" @click="openFileBrowser">Add Files</button>
            <input class="hidden" type="file" ref="files" multiple @change="handleFiles">
          </div>
        </div>
      </div>

      <div ref="messages" class="mt-16 overflow-auto border-t-2" style="height: calc(100% - 8rem)">
        <ul class="p-2" v-if="messages.length">
          <li class="w-7/12 mt-5" :class="{ 'ml-auto': isSentMessage(message) }" v-for="message in messages" :key="message.id">
            <div class="bg-green-200 p-2 rounded-md">
              <div class="mb-2 text-center" v-for="file in message.files" :key="file.id">
                <img class="ml-auto rounded" style="max-height: 250px;" :src="filePath(file.id)" @load="scrollToMessagesBottom">
              </div>

              <span v-if="message.content">{{ message.content }}</span>

              <button @click="deleteMessage(message)" v-if="isSentMessage(message)">Delete</button>
            </div>
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
import { remote } from 'electron'

export default {
  /**
   * The component's data.
   */
  data() {
    return {
      form: {
        content: '',
        files: []
      },

      errors: [],
      chats: [],
      messages: [],
      typings: [],
      activeUser: null
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

          this.setBadgeCount()
        })
    },

    /**
     * Listen for typings.
    */
    listenForTypings() {
      this.$echo.private(`typing.${this.$bus.user.id}`)
        .listenForWhisper('typing', (e) => {
          if (! this.isTyping(e.user)) {
            this.typings.push(e.user.id)
          }

          if (e.submit) {
            this.typings.splice(this.typings.indexOf(e.user.id), 1)
          
            return
          }

          setTimeout(() => {
            this.typings.splice(this.typings.indexOf(e.user.id), 1)
          }, 3000)
        })
    },

    /**
     * Listen for messages.
     */
    listenForMessages() {
      this.$echo.private(`App.User.${this.$bus.user.id}`)
        .listen('MessageSent', (e) => {
          if (this.chatIsActive(e.message)) {
            this.messages.push(e.message)

            this.readChat(e.message)
          } else {
            this.notify(e.message)

            let chat = this.chats.find(
              chat => chat.chat_id === e.message.chat_id
            )

            chat.unread_count++

            e.message.unread_count = chat.unread_count
          }
          
          this.$set(this.chats, this.findIndexForChat(e.message.chat_id), e.message)

          this.chats.sort((a, b) => {
            return a.id === e.message.id ? -1 : b === e.message.id ? 1 : 0;
          });

          this.setBadgeCount()
        })
        .listen('MessageUnsent', (e) => {
          if (this.chatIsActive(e.message)) {
            this.messages.splice(
              this.messages.findIndex(m => m.id === e.message.id), 1
            )

            return
          }

          this.removeChatIfNoMessages(e.message.chat_id)
        })
    },

    /**
     * Get the messages for the given chat.
     */
    getChat(chat) {
      this.activeUser = this.chatUser(chat)

      this.$http.get(`/api/chats/${chat.chat_id}`)
        .then(response => {
          this.messages = response.data

          this.readChat(chat)
        })
    },

    /**
     * Read the given chat.
     */
    readChat(chat) {
      if (chat.unread_count > 0) {
        this.$http.put(`/api/chats/${chat.chat_id}`)
          .then(() => {
            chat.unread_count = 0

            this.setBadgeCount()
          }) 
      }
    },

    /**
     * Remove the chat if there are no more messages.
     */
    removeChatIfNoMessages(chatId) {
      this.$http.get(`/api/chats/${chatId}`)
        .then(response => {
          if (response.data.length === 0) {
            this.chats.splice(this.findIndexForChat(chatId), 1)
          }
        })
    },

    /**
     * Send a message.
     */
    sendMessage() {
      if (this.form.content === '' && this.form.files.length === 0) {
        return
      }

      const formData = new FormData()

      formData.append('content', this.form.content)
      formData.append('receiver_id', this.activeUser.id)

      this.form.files.forEach((file, key) => {
        formData.append(`files[${key}]`, file)
      });

      this.$http.post(`/api/messages`, formData)
        .then(response => {
          response.data.unread_count = 0

          this.messages.push(response.data)

          this.form.content = ''
          this.form.files = []

          this.$set(this.chats, this.findIndexForChat(response.data.chat_id), response.data)

          this.chats.sort((a, b) => {
            return a.id === response.data.id ? -1 : b === response.data.id ? 1 : 0;
          });
        })
        .catch(error => {
          this.errors = this.formatErrors(error.response.data.errors)
        })
    },

    /**
     * Find the index for the given chat.
     */
    findIndexForChat(chatId) {
      return this.chats.findIndex(chat => chat.chat_id === chatId)
    },

    /**
     * Delete the given message.
     */
    deleteMessage(message) {
      this.$http.delete(`/api/messages/${message.id}`)
        .then(() => {
          this.messages.splice(this.messages.indexOf(message),  1)

          if (this.messages.length === 0) {
            this.chats.splice(this.findIndexForChat(message.chat_id), 1)
          }
        })
    },

    /**
     * Delete the given chat.
     */
    deleteChat(chatId) {
      this.$http.delete(`/api/chats/${chatId}`)
        .then(() => {
          this.chats.splice(this.findIndexForChat(chatId), 1)
        });
    },

    /**
     * Log the user out of the application.
     */
    logout() {
      this.$http.delete(`/api/tokens/${this.tokenId()}`)
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
     * Send a whisper that the user is typing.
     */
    whisper(e) {
      this.$echo.private(`typing.${this.activeUser.id}`)
        .whisper('typing', {
          user: this.$bus.user,
          submit: e.key === 'Enter'
        })
    },

    /**
     * Scroll to the botton of the messages container.
     */
    scrollToMessagesBottom() {
      let container = this.$refs.messages

      container.scrollTop = container.scrollHeight
    },

    /**
     * Get the user from the chat.
     */
    chatUser(chat) {
      return this.$bus.user.id === chat.sender.id ? chat.receiver : chat.sender
    },

    /**
     * Determine if the given chat is active.
     */
    chatIsActive(chat) {
      if (this.activeUser) {
        let ch = this.chats.find(
          ch => [ch.sender_id, ch.receiver_id].includes(this.activeUser.id)
        )

        return ch.chat_id === chat.chat_id
      }
    },

    /**
     * Determine if the given message is sent.
     */
    isSentMessage(message) {
      return this.$bus.user.id === message.sender_id
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

    /**
     * Notify the user with the given message.
     */
    notify(message) {
      new Notification(message.sender.name, {
        body: message.content ?? '',
        icon: this.picture(message.sender.picture)
      })
    },

    /**
     * Determine if the given user is typing.
     */
    isTyping(user) {
      return this.typings.includes(user.id)
    },

    /**
     * Set the badge count.  
     */
    setBadgeCount() {
      remote.app.setBadgeCount(
        this.chats.filter(chat => chat.unread_count > 0).length
      )
    }
  }
}
</script>
