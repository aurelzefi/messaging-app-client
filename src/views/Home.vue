<template>
  <div class="flex h-screen antialiased">
    <file v-if="activeFile" :file="activeFile" :hide="() => activeFile = null"></file>
    <new-chat v-if="newChat" :method="startChat" :hide="() => newChat = false"></new-chat>
    <confirm v-if="modal.show" :data="modal" :hide="() => modal.show = false"></confirm>

    <div class="w-full h-16 fixed flex z-10">
      <div class="w-1/3 flex justify-end bg-gray-100 p-2 border-b border-r border-gray-200">
        <ul class="flex items-center">
          <li class="mr-4">
            <router-link class="block p-2" to="/settings">
              <img class="h-10 w-10 rounded-full" :src="picture($bus.user)">
            </router-link>
          </li>

          <li class="mr-4">
            <button class="p-2 align-middle rounded-full outline-none focus:bg-gray-400 focus:outline-none" type="button" @click="newChat = true">
              <svg class="h-6 w-6 text-gray-700" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </button>
          </li>

          <li class="relative mr-4">
            <button class="p-2 align-middle rounded-full outline-none focus:bg-gray-400 focus:outline-none" type="button" @click="userMenu = ! userMenu">
              <svg class="h-6 w-6 text-gray-700" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <button class="fixed inset-0 h-full w-full cursor-default focus:outline-none z-10" tabindex="-1" v-if="userMenu" @click="userMenu = false"></button>
            <div class="w-48 absolute bg-white right-0 mt-1 border rounded-md border-gray-200 shadow-md z-20" v-if="userMenu">
              <ul class="py-2 text-sm text-gray-700">
                <li>
                  <router-link class="block px-3 py-2 hover:bg-gray-200" to="/settings">Settings</router-link>
                </li>
                <li>
                  <a class="block px-3 py-2 hover:bg-gray-200 cursor-pointer" @click="logout">Log out</a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>

      <div class="w-2/3 flex justify-between items-center bg-gray-100 border-gray-200 p-2 border-b" v-if="activeUser">        
        <router-link class="flex items-center" :to="{ name: 'users.show', params: { id: activeUser.id } }">
          <img class="h-10 w-10 rounded-full" :src="picture(activeUser)">

          <div class="flex flex-col ml-3">
            <span class="text-gray-900">{{ activeUser.name }}</span>
            <span class="text-xs text-gray-700" v-if="isTyping(activeUser)">Typing...</span>
          </div>
        </router-link>

        <ul class="flex items-center">
          <li class="mr-4">
            <button class="p-2 align-middle rounded-full outline-none focus:bg-gray-400 focus:outline-none" type="button" @click="openFileBrowser">
              <svg class="h-6 w-6 text-gray-700" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
            </button>
            <input class="hidden" type="file" ref="files" multiple @change="handleFiles">
          </li>

          <li class="relative mr-4 z-0">
            <button class="p-2 align-middle rounded-full outline-none focus:bg-gray-400 focus:outline-none" type="button" @click="chatMenu = ! chatMenu">
              <svg class="h-6 w-6 text-gray-700" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <button class="fixed inset-0 h-full w-full cursor-default focus:outline-none" tabindex="-1" v-if="chatMenu" @click="chatMenu = false"></button>
            <div class="w-48 absolute bg-white right-0 mt-1 border rounded-md border-gray-200 shadow-md" v-if="chatMenu">
              <ul class="py-2 text-sm text-gray-700">
                <li>
                  <router-link class="block px-3 py-2 hover:bg-gray-200" :to="{ name: 'users.show', params: { id: activeUser.id } }">Contact Info</router-link>
                </li>
                <li>
                  <a class="block px-3 py-2 hover:bg-gray-200 cursor-pointer" @click="openDeleteChatModal">Delete Chat</a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="w-1/3 mt-16 border-r border-gray-200 overflow-auto" style="height: calc(100vh - 4rem)">
      <ul class="cursor-pointer" v-if="chats.length">
        <li class="flex items-center p-3 border-b hover:bg-gray-200" :class="{ 'bg-gray-300': chatIsActive(chat) }" v-for="chat in chats" :key="chat.id" @click="getChat(chat)">
          <img class="h-12 w-12 rounded-full" :src="picture(chatUser(chat))">
            
          <div class="w-full flex flex-col ml-2 overflow-hidden">
            <div class="flex justify-between items-center">
              <span class="text-gray-900 truncate">{{ chatUser(chat).name }}</span>
              <span class="ml-2 text-xs text-gray-700 whitespace-no-wrap">{{ dateFromNow(chat.created_at) }}</span>
            </div>

            <div class="flex justify-between items-center text-gray-800">
              <span class="text-sm truncate">
                <template v-if="isTyping(chatUser(chat))">Typing...</template>

                <template v-else>
                  <svg class="inline h-4 w-4" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" v-if="chat.files.length"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg> <template v-if="chat.content">{{ chat.content }}</template>
                </template>
              </span>

              <span class="px-2 ml-2 text-xs bg-gray-700 text-white rounded-full" v-if="chat.unread_count">
                {{ chat.unread_count }}
              </span>
            </div>
          </div>
        </li>
      </ul>

      <div class="h-full flex flex-col justify-center items-center" v-else>
        No chats.
      </div>
    </div>

    <div ref="messages" class="w-2/3 mt-16 overflow-auto" style="height: calc(100vh - 8rem)" v-if="activeUser">
      <div class="p-3" v-if="Object.keys(groupedMessages).length">
        <div :class=" { 'mt-3': index > 0 }" v-for="(messages, date, index) in groupedMessages" :key="date">
          <div class="text-sm text-center text-gray-700">{{ date }}</div>

          <ul class="mt-3">
            <li class="w-7/12 flex flex-col" :class="{ 'ml-auto justify-end items-end': isSentMessage(message), 'items-start': ! isSentMessage(message), 'mt-3': messages.indexOf(message) > 0 }" v-for="message in messages" :key="message.id">
              <div class="relative bg-gray-200 rounded-md shadow-sm" :style="[ message.files.length ? { width: '20rem' } : ''  ]" @mouseover="hoveredMessage = message" @mouseleave="hoveredMessage = null">
                <button class="absolute top-0 right-0 m-2 focus:outline-none" type="button" v-if="isSentMessage(message) && (hoveredMessage === message || activeMessage === message)" @click="activeMessage = message">
                  <svg class="h-4 w-4 text-gray-700" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <button class="fixed inset-0 h-full w-full cursor-default focus:outline-none z-10" tabindex="-1" v-if="activeMessage === message" @click="activeMessage = null"></button>
                <div class="w-48 absolute bg-white right-0 mt-6 mr-1 border rounded-md border-gray-200 shadow-md z-20" v-if="activeMessage === message">
                  <ul class="py-2 text-sm text-gray-700">
                    <li>
                      <a class="block px-3 py-2 hover:bg-gray-200 cursor-pointer" @click="openDeleteMessageModal">Delete</a>
                    </li>
                  </ul>
                </div>

                <div class="p-1" v-if="message.files.length">
                  <a class="block cursor-pointer" :class="{ 'mt-1': message.files.indexOf(file) > 0 }" v-for="file in message.files" :key="file.id" @click="activeFile = file">
                    <img class="rounded-md" style="width: 20rem;" :src="getFile(file)" @load="scrollToMessagesBottom">
                  </a>
                </div>
                
                <div class="flex flex-col px-2 py-1">
                  <span class="text-sm" v-if="message.content">
                    {{ message.content }}
                  </span>

                  <span class="self-end text-xs text-gray-700">
                    {{ time(message.created_at) }}
                  </span>
                </div>
              </div>

              <span class="self-end mt-1 text-xs text-gray-700" :title="dateTime(message.read_at)" v-if="showReadAt(message)">
                Read at {{ time(message.read_at) }}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div class="h-full flex flex-col justify-center items-center" v-else>
        No messages.
      </div>
    </div>

    <div class="w-2/3 bottom-0 right-0 h-16 fixed flex items-center px-2 border-t" v-if="activeUser">
      <form class="w-full" @submit.prevent="sendMessage">
        <input ref="content" class="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" type="text" v-model="form.content" v-focus @keyup="whisper" placeholder="Type a message">
      </form>
    </div>

    <div class="w-2/3 my-auto text-center" v-else>
      <img class="mx-auto" src="./../assets/logo.png">

      Empty space...
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { remote } from 'electron'
import Confirm from '../components/Confirm.vue'
import File from '../components/File.vue'
import NewChat from '../components/NewChat.vue'

export default {
  components: { Confirm, File, NewChat },

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

      userMenu: false,
      chatMenu: false,
      hoveredMessage: null,
      newChat: false,
      activeUser: null,
      activeMessage: null,
      activeFile: null,

      modal: {
        show: false,
        title: '',
        body: '',
        method: null
      }
    }
  },

  /**
   * The component's computed properties.
   */
  computed: {
    tokenId() {
      return localStorage.getItem('token').split('|')[0]
    },

    groupedMessages() {
      console.log(this.messages)

      return _.groupBy(this.messages, (m) => this.date(m.created_at))
    }
  },

  /**
   * The properties to be watched.
   */
  watch: {
    messages() {
      setTimeout(() => {
        this.scrollToMessagesBottom()
      }, 1)
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
          if (this.activeUser && this.activeUser.id === e.message.sender_id) {
            e.message.unread_count = 0

            this.messages.push(e.message)

            this.readChat(e.message)
          } else {
            let chat = this.chats.find(chat => chat.chat_id === e.message.chat_id)

            e.message.unread_count = chat ? ++chat.unread_count : 1

            this.notify(e.message)
          }
          
          this.updateChatsWithMessage(e.message)

          this.setBadgeCount()
        })
        .listen('MessageRead', (e) => {
          this.handleMessageRead(e.message)
        })
        .listen('MessageUnsent', (e) => {
          let chat = this.chats.find(chat => chat.chat_id === e.message.chat_id)

          if (! e.message.read_at) {
            chat.unread_count--
          }

          if (this.chatIsActive(e.message)) {
            this.messages.splice(
              this.messages.findIndex(message => message.id === e.message.id), 1
            )
          }

          this.updateChatOnMessageUnsent(chat)
        })
        .listen('ChatDeleted', (e) => {
          let chat = this.chats.find(
            chat => [chat.sender_id, chat.receiver_id].includes(e.user.id)
          )

          if (this.chatIsActive(chat)) {
            this.activeUser = null
          }

          this.chats.splice(this.findIndexForChat(chat.chat_id), 1)
        })
    },

    /**
     * Get the messages for the given chat.
     */
    getChat(chat) {
      this.activeUser = this.chatUser(chat)

      if (chat.unread_count > 0) {
        this.$http.put(`/api/chats/${chat.chat_id}`)
          .then((response) => {
            this.messages = response.data

            let message = response.data[response.data.length - 1]

            message.unread_count = 0

            this.$set(this.chats, this.findIndexForChat(message.chat_id), message)

            this.setBadgeCount()
          }) 

          return
      }

      this.$http.get(`/api/chats/${chat.chat_id}`)
        .then(response => {
          this.messages = response.data
        })
    },

    /**
     * Read the given chat.
     */
    readChat(chat) {
      this.$http.put(`/api/chats/${chat.chat_id}`)
        .then((response) => {
          response.data.forEach(message => {
            this.handleMessageRead(message)
          })
        }) 
    },

    handleMessageRead(message) {
      if (this.chatIsActive(message)) {
        this.$set(
          this.messages, this.messages.findIndex(m => m.id === message.id), message
        )
      }

      message.unread_count = 0

      this.$set(this.chats, this.findIndexForChat(message.chat_id), message)
    },

    updateChatsWithMessage(message) {
      let index = this.findIndexForChat(message.chat_id)

      if (index === -1) {
        this.chats.unshift(message)

        return
      }

      this.$set(this.chats, index, message)
      
      this.chats.sort((a, b) => {
        return a.id === message.id ? -1 : b === message.id ? 1 : 0;
      });
    },

    /**
     * Update the given chat when a message has been unsent.
     */
    updateChatOnMessageUnsent(chat) {
      this.$http.get(`/api/chats/${chat.chat_id}`)
        .then(response => {
          if (response.data.length === 0) {
            this.chats.splice(this.findIndexForChat(chat.chat_id), 1)
          } else {
            let message = response.data[response.data.length - 1]

            message.unread_count = chat.unread_count

            this.updateChatsWithMessage(message)
          }
        })
    },

    /**
     * Send a message.
     */
    sendMessage() {
      if (this.form.content.length === 0 && this.form.files.length === 0) {
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
          this.form.content = ''
          this.form.files = []

          response.data.unread_count = 0

          this.messages.push(response.data)

          this.updateChatsWithMessage(response.data)
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
     * Delete the given chat.
     */
    deleteChat() {
      let chat = this.chats.find(
        chat => [chat.sender_id, chat.receiver_id].includes(this.activeUser.id)
      )

      this.$http.delete(`/api/chats/${chat.chat_id}`)
        .then(() => {
          if (this.chatIsActive(chat)) {
            this.activeUser = null
          }

          this.chats.splice(this.findIndexForChat(chat.chat_id), 1)

          this.modal.show = false
        });
    },

    /**
     * Delete the given message.
     */
    deleteMessage() {
      this.$http.delete(`/api/messages/${this.activeMessage.id}`)
        .then(() => {
          this.messages.splice(this.messages.indexOf(this.activeMessage),  1)

          let index = this.findIndexForChat(this.activeMessage.chat_id)

          if (this.messages.length === 0) {
            this.chats.splice(index, 1)
          } else {
            this.$set(this.chats, index, this.messages[this.messages.length - 1])
          }

          this.modal.show = false
        })
    },

    /**
     * Log the user out of the application.
     */
    logout() {
      this.$http.delete(`/api/tokens/${this.tokenId}`)
        .then(() => {
          this.handleAfterLogout()
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
      if (! this.activeUser) {
        return false
      }

      let ch = this.chats.find(
        ch => [ch.sender_id, ch.receiver_id].includes(this.activeUser.id)
      )

      if (ch) {
        return ch.chat_id === chat.chat_id
      }

      return false
    },

    /**
     * Determine if the given message is sent.
     */
    isSentMessage(message) {
      return this.$bus.user.id === message.sender_id
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
        icon: this.picture(message.sender)
      })
    },

    /**
     * Determine if the given user is typing.
     */
    isTyping(user) {
      return this.typings.includes(user.id)
    },

    /**
     * Start a new chat with the given user.
     */
    startChat(user) {
      let chat = this.chats.find(
        chat => [chat.sender_id, chat.receiver_id].includes(user.id)
      )

      this.newChat = false

      if (chat) {
        this.getChat(chat)

        return
      }

      this.activeUser = user
      this.messages = []
    },

    /**
     * Open the delete chat modal.
     */
    openDeleteChatModal() {
      this.modal.show = true
      this.modal.title = 'Delete Chat'
      this.modal.body = 'Are you sure you want to delete this chat?'
      this.modal.method = this.deleteChat
    },

    /**
     * Open the delete message modal.
     */
    openDeleteMessageModal() {
      this.modal.show = true
      this.modal.title = 'Delete Message'
      this.modal.body = 'Are you sure you want to delete this message?'
      this.modal.method = this.deleteMessage
    },

    /**
     * Set the badge count.  
     */
    setBadgeCount() {
      remote.app.setBadgeCount(
        this.chats.filter(chat => chat.unread_count > 0).length
      )
    },

    /**
     * Determine if the "read at" time should be shown.
     */
    showReadAt(message) {
      const date = this.date(message.created_at)

      const index = Object.keys(this.groupedMessages).findIndex(d => d === date)

      const group = this.groupedMessages[date]

      return this.isSentMessage(message) &
        index === Object.keys(this.groupedMessages).length - 1 & 
        group.indexOf(message) === group.length - 1 &
        !! message.read_at
    }
  }
}
</script>
