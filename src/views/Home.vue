<template>
  <div class="flex h-screen antialiased">
    <file v-if="activeFile" :file="activeFile" :hide="() => activeFile = null"></file>
    <file-preview v-if="form.files.length" :files="form.files" :hide="clearFiles"></file-preview>
    <new-chat v-if="newChat" :method="startChat" :hide="() => newChat = false"></new-chat>
    <confirm v-if="confirm.show" :data="confirm" :hide="() => confirm.show = false"></confirm>
    <errors v-if="Object.keys(errors).length" :errors="errors" :hide="() => errors = {}"></errors>

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
              <svg viewBox="0 0 20 20" fill="currentColor" class="chat w-6 h-6 text-gray-700"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path></svg>
            </button>
          </li>

          <li class="relative mr-4">
            <button class="p-2 align-middle rounded-full outline-none focus:bg-gray-400 focus:outline-none" type="button" @click="userMenu = ! userMenu">
              <svg viewBox="0 0 20 20" fill="currentColor" class="chevron-down w-6 h-6 text-gray-700"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </button>
            <button class="fixed inset-0 h-full w-full cursor-default focus:outline-none z-10" tabindex="-1" v-if="userMenu" @click="userMenu = false"></button>
            <div class="w-48 absolute bg-white right-0 mt-1 border rounded border-gray-200 shadow z-20" v-if="userMenu">
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
              <svg viewBox="0 0 20 20" fill="currentColor" class="paper-clip w-6 h-6 text-gray-700"><path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"></path></svg>
            </button>
            <input class="hidden" type="file" ref="files" multiple @change="handleFiles">
          </li>

          <li class="relative mr-4 z-0">
            <button class="p-2 align-middle rounded-full outline-none focus:bg-gray-400 focus:outline-none" type="button" @click="chatMenu = ! chatMenu">
              <svg viewBox="0 0 20 20" fill="currentColor" class="chevron-down w-6 h-6 text-gray-700"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </button>
            <button class="fixed inset-0 h-full w-full cursor-default focus:outline-none" tabindex="-1" v-if="chatMenu" @click="chatMenu = false"></button>
            <div class="w-48 absolute bg-white right-0 mt-1 border rounded border-gray-200 shadow" v-if="chatMenu">
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
                  <svg viewBox="0 0 20 20" fill="currentColor" class="inline paper-clip w-4 h-4" v-if="chat.files.length"><path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"></path></svg> <template v-if="chat.content">{{ chat.content }}</template>
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

    <div ref="messages" class="w-2/3 mt-16 overflow-auto" style="height: calc(100vh - 8rem)" v-if="activeUser" @scroll="registerScroll">
      <div class="p-3" v-if="Object.keys(groupedMessages).length">
        <div :class=" { 'mt-3': index > 0 }" v-for="(messages, date, index) in groupedMessages" :key="date">
          <div class="text-center">
            <span class="px-2 py-1 text-sm bg-gray-200 rounded shadow">{{ date }}</span>
          </div>

          <ul class="mt-3">
            <li ref="message" class="w-7/12 flex flex-col" :class="{ 'ml-auto justify-end items-end': isSentMessage(message), 'items-start': ! isSentMessage(message), 'mt-3': messages.indexOf(message) > 0 }" v-for="message in messages" :key="message.id">
              <div class="relative bg-gray-200 rounded shadow" :style="[ message.files.length ? { width: '20rem' } : '' ]" @mouseover="hoveredMessage = message" @mouseleave="hoveredMessage = null">
                <button class="absolute right-0 p-1 mr-1 mt-1 focus:outline-none" :class="{ 'bg-gray-200': message.files.length === 0 }" type="button" v-if="shouldShowMenu(message)" @click="activeMessage = message">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="chevron-down w-4 h-4" :class="[ message.files.length > 0 ? 'text-white' : 'text-gray-700' ]"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                </button>
                <button class="fixed inset-0 h-full w-full cursor-default focus:outline-none z-10" tabindex="-1" v-if="isActive(message)" @click="activeMessage = null"></button>
                <div class="w-48 absolute bg-white right-0 mt-6 mr-1 border rounded border-gray-200 shadow z-20" v-if="isActive(message)">
                  <ul class="py-2 text-sm text-gray-700">
                    <li>
                      <a class="block px-3 py-2 hover:bg-gray-200 cursor-pointer" @click="openDeleteMessageModal">Delete</a>
                    </li>
                  </ul>
                </div>

                <div class="p-1" v-if="message.files.length">
                  <a class="block cursor-pointer text-center" :class="{ 'mt-1': message.files.indexOf(file) > 0 }" v-for="file in message.files" :key="file.id" @click="activeFile = file">
                    <img class="inline rounded max-w-full" :src="fileUrl(file)" @load="scrollMessages">
                  </a>
                </div>

                <div class="flex flex-col px-2 py-1">
                  <span class="text-sm" v-if="message.content" v-message-inserted="scrollMessages">
                    {{ message.content }}
                  </span>

                  <span class="self-end text-xs text-gray-700">
                    {{ time(message.created_at) }}
                  </span>
                </div>
              </div>

              <span class="self-end mt-1 text-xs text-gray-700" v-message-inserted="scrollMessages" v-if="isSentAndRead(message)">
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

      Start chating...
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { ipcRenderer } from 'electron'
import Confirm from '../components/Confirm.vue'
import Errors from  '../components/Errors.vue'
import File from '../components/File.vue'
import FilePreview from '../components/FilePreview.vue'
import NewChat from '../components/NewChat.vue'

export default {
  components: { Confirm, Errors, File, FilePreview, NewChat },

  /**
   * The component's data.
   */
  data() {
    return {
      form: {
        content: '',
        files: []
      },

      confirm: {
        show: false,
        title: '',
        body: '',
        method: null
      },

      errors: {},
      typings: [],
      userMenu: false,
      chatMenu: false,
      hoveredMessage: null,
      newChat: false,
      activeMessage: null,
      activeFile: null,
      localScroll: 0
    }
  },

  /**
   * The component's computed properties.
   */
  computed: {
    groupedMessages() {
      return _.groupBy(this.messages, (m) => this.date(m.created_at))
    },

    activeUser: {
      get() {
        return this.$bus.activeUser
      },

      set(value) {
        this.$bus.activeUser = value
      }
    },

    chats: {
      get() {
        return this.$bus.chats
      },

      set(value) {
        this.$bus.chats = value
      }
    },

    messages: {
      get() {
        return this.$bus.messages
      },

      set(value) {
        this.$bus.messages = value
      }
    },

    scroll: {
      get() {
        return this.$bus.scroll
      },

      set(value) {
        this.$bus.scroll = value
      }
    }
  },

  /**
   * Mount the component.
   */
  mounted() {
    this.listenForTypings()

    this.$bus.$on('whisper', (e) => {
      this.whisper(e)
    })

    this.$bus.$on('preview-done', (data) => {
      this.form.content = data.content

      this.sendMessage()
    })

    this.getChatOnEnter()

    ipcRenderer.on('window-open', (e, open) => {
      if (open) {
        this.getChatOnEnter()
      }
    })
  },

  /**
   * Save the scroll state before destroying the component.
   */
  beforeDestroy() {
    this.scroll = this.localScroll
  },

  methods: {
    /**
     * Register the scroll state.
     */
    registerScroll() {
      this.localScroll = this.$refs.messages.scrollTop
    },

    /**
     * Scroll the messages element.
     */
    scrollMessages() {
      let container = this.$refs.messages

      if (this.scroll === null) {
        container.scrollTop = container.scrollHeight

        return
      }

      container.scrollTop = this.scroll
    },

    /**
     * Get the messages for the given chat.
     */
    getChat(chat) {
      if (this.chatIsActive(chat)) {
        return
      }

      this.scroll = null
      this.activeUser = this.chatUser(chat)

      if (chat.unread_count > 0) {
        this.readChat(chat)

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
          this.messages = response.data

          let message = response.data[response.data.length - 1]

          message.unread_count = 0

          this.updateChat(message)

          this.$bus.$emit('chats-updated')
        })
    },

    /**
     * Get the active chat on enter.
     */
    getChatOnEnter() {
      let chat = this.findChatForActiveUser()

      if (chat && chat.unread_count > 0) {
        this.readChat(chat)
      }
    },

    /**
     * Send a message.
     */
    sendMessage() {
      this.errors = {}
      this.scroll = null

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
          this.clearFiles()

          response.data.unread_count = 0

          this.messages.push(response.data)

          this.$bus.$emit('message-sent', response.data)
        })
        .catch(error => {
          this.errors = this.formatErrors(error.response.data.errors)

          this.clearFiles()
        })
    },

    /**
     * Delete the given chat.
     */
    deleteChat() {
      let chat = this.findChatForActiveUser()

      this.chatMenu = false

      if (! chat) {
        this.activeUser = null
        this.confirm.show = false

        return
      }

      this.$http.delete(`/api/chats/${chat.chat_id}`)
        .then(() => {
          this.activeUser = null
          this.confirm.show = false

          this.removeChat(chat)
        })
    },

    /**
     * Delete the given message.
     */
    deleteMessage() {
      this.$http.delete(`/api/messages/${this.activeMessage.id}`)
        .then(() => {
          this.confirm.show = false

          this.removeMessage(this.activeMessage)

          if (this.messages.length > 0) {
            this.updateChat(this.messages[this.messages.length - 1])

            return
          }

          this.removeChat(this.activeMessage)
        })
    },

    /**
     * Get the user from the chat.
     */
    chatUser(chat) {
      return this.$bus.user.id === chat.sender.id ? chat.receiver : chat.sender
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
     * Log the user out of the application.
     */
    logout() {
      this.$http.delete(`/api/tokens/${this.tokenId()}`)
        .then(() => {
          this.handleAfterLogout()
        })
    },

    /**
     * Get the token ID.
     */
    tokenId() {
      return localStorage.getItem('token').split('|')[0]
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
     * Determine if the given message is sent.
     */
    isSentMessage(message) {
      return this.$bus.user.id === message.sender_id
    },

    /**
     * Start a new chat with the given user.
     */
    startChat(user) {
      this.newChat = false

      let chat = this.findChatForUser(user)

      if (chat) {
        this.getChat(chat)

        return
      }

      this.messages = []
      this.activeUser = user
    },

    /**
     * Determine if the given user is typing.
     */
    isTyping(user) {
      return this.typings.includes(user.id)
    },

    /**
     * Open the file browser to choose files.
     */
    openFileBrowser() {
      this.$refs.files.click()
    },

    /**
     * Clear the form files.
     */
    clearFiles() {
      this.form.files = []

      this.$refs.files.value = ''
    },

    /**
     * Add the chosen files to the form.
     */
    handleFiles() {
      this.form.files = Object.values(this.$refs.files.files)
    },

    /**
     * Open the delete chat modal.
     */
    openDeleteChatModal() {
      this.confirm.show = true
      this.confirm.title = 'Delete Chat'
      this.confirm.body = 'Are you sure you want to delete this chat?'
      this.confirm.method = this.deleteChat
    },

    /**
     * Open the delete message modal.
     */
    openDeleteMessageModal() {
      this.confirm.show = true
      this.confirm.title = 'Delete Message'
      this.confirm.body = 'Are you sure you want to delete this message?'
      this.confirm.method = this.deleteMessage
    },

    /**
     * Determine if the given message should have a menu shown.
     */
    shouldShowMenu(message) {
      return this.isSentMessage(message) && (this.isHovered(message) || this.isActive(message))
    },

    /**
     * Determine if the given message is hovered.
     */
    isHovered(message) {
      return this.hoveredMessage === message
    },

    /**
     * Determine if the given message is active.
     */
    isActive(message) {
      return this.activeMessage === message
    },

    /**
     * Determine if the message is sent and read.
     */
    isSentAndRead(message) {
      let date = this.date(message.created_at)
      let group = this.groupedMessages[date]
      let index = Object.keys(this.groupedMessages).findIndex(d => d === date)

      return this.isSentMessage(message) &&
        index === Object.keys(this.groupedMessages).length - 1 &&
        group.indexOf(message) === group.length - 1 &&
        message.read_at
    }
  }
}
</script>
