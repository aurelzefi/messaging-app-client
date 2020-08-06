<template>
  <div class="flex h-screen">
    <div class="w-3/12">
      <div class="w-3/12 h-16 fixed flex justify-end bg-gray-100 p-2 border-b border-r border-gray-200">
        <ul class="flex items-center">
          <li class="mr-4">
            <button class="p-2 align-middle outline-none focus:outline-none" type="button">
              <img class="h-10 w-10 rounded-full" :src="picture($bus.user.picture)">
            </button>
          </li>

          <li class="mr-4">
            <button class="p-2 align-middle rounded-full outline-none focus:bg-gray-400 focus:outline-none" type="button">
              <svg class="h-6 w-6 text-gray-700" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </button>
          </li>

          <li class="mr-4">
            <button class="p-2 align-middle rounded-full outline-none focus:bg-gray-400 focus:outline-none" type="button">
              <svg class="h-6 w-6 text-gray-700" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </li>
        </ul>
      </div>

      <div class="mt-16 border-r overflow-auto" style="height: calc(100vh - 4rem)">
        <ul class="cursor-pointer" v-if="chats.length">
          <li class="p-3 flex justify-between border-b hover:bg-gray-100" :class="{ 'bg-gray-300': chatIsActive(chat) }" v-for="chat in chats" :key="chat.id" @click="getChat(chat)">
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

    <div class="w-9/12" v-if="activeUser">
      <div class="w-9/12 h-16 fixed flex justify-between items-center bg-gray-100 border-gray-200 p-2 border-b">        
        <ul class="flex items-center">
          <li>
            <img class="h-10 w-10 rounded-full" :src="picture(activeUser.picture)">
          </li>
          
          <li class="flex flex-col ml-3">
            <span>{{ activeUser.name }}</span>
            <span class="text-gray-700 text-xs" v-if="isTyping(activeUser)">Typing...</span>
          </li>
        </ul>

        <ul class="flex items-center">
          <li class="mr-4">
            <button class="p-2 align-middle rounded-full outline-none focus:bg-gray-400 focus:outline-none" type="button" @click="openFileBrowser">
              <svg class="h-6 w-6 text-gray-700" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
            </button>
            <input class="hidden" type="file" ref="files" multiple @change="handleFiles">
          </li>

          <li class="mr-4">
            <button class="p-2 align-middle rounded-full outline-none focus:bg-gray-400 focus:outline-none" type="button">
              <svg class="h-6 w-6 text-gray-700" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </li>
        </ul>
      </div>

      <div ref="messages" class="mt-16 overflow-auto" style="height: calc(100vh - 8rem)">
        <ul class="p-2" v-if="messages.length">
          <li class="mt-5 w-7/12" :class="{ 'ml-auto': isSentMessage(message) }" v-for="message in messages" :key="message.id">
            <div class="bg-green-200 p-2 rounded-md">
              <div class="mb-2 text-center" v-for="file in message.files" :key="file.id">
                <img class="ml-auto rounded" style="max-height: 250px;" :src="filePath(file.id)" @load="scrollToMessagesBottom">
              </div>

              <span v-if="message.content">{{ message.content }}</span>

              <button>Icon</button>

              <!-- @click="deleteMessage(message)" v-if="isSentMessage(message)" -->
            </div>
          </li>
        </ul>
      </div>

      <form class="w-9/12 h-16 fixed flex items-center px-2 border-t" @submit.prevent="sendMessage">
        <input ref="content" class="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" type="text" v-model="form.content" @keyup="whisper" placeholder="Type a message">
      </form>
    </div>

    <div class="w-9/12 my-auto text-center" v-else>
      <img class="mx-auto" src="./../assets/logo.png">

      Empty space...
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

          this.$refs.content.focus()
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
