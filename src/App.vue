<template>
  <router-view></router-view>
</template>

<script>
import { remote, ipcRenderer } from 'electron'

export default {
  /**
   * The component's data.
   */
  data() {
    return {
      windowOpen: true
    }
  },

  /**
   * The component's computed properties.
   */
  computed: {
    user() {
      return this.$bus.user
    },

    activeUser() {
      return this.$bus.activeUser
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
    }
  },

  /**
   * Mount the component.
   */
  mounted() {
    this.$bus.$on('user-set', () => {
      this.getChats()
      this.listenForMessages()
    })

    this.$bus.$on('chats-updated', () => {
      this.updateBadgeCount()
    })

    ipcRenderer.on('window-open', (e, data) => {
      this.windowOpen = data
    })
  },

  methods: {
    /**
     * Get the chats.
     */
    getChats() {
      this.$http.get('/api/chats')
        .then(response => {
          this.chats = response.data

          this.updateBadgeCount()
        })
    },

    /**
     * Listen for messages.
     */
    listenForMessages() {
      this.$echo.private(`App.User.${this.user.id}`)
        .listen('MessageSent', (e) => {
          if (this.activeUser && this.activeUser.id === e.message.sender_id && this.windowOpen && this.isHome()) {
            e.message.unread_count = 0

            this.messages.push(e.message)

            this.readChat(e.message)
          } else {
            let chat = this.chats.find(chat => chat.chat_id === e.message.chat_id)

            e.message.unread_count = chat ? ++chat.unread_count : 1

            this.notify(e.message)
          }
          
          this.updateChatsWithMessage(e.message)

          this.updateBadgeCount()
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

          this.chats.splice(this.chats.findIndex(ch => ch.chat_id === chat.chat_id), 1)
        })
    },

    /**
     * Update the given chat when a message has been unsent.
     */
    updateChatOnMessageUnsent(chat) {
      this.$http.get(`/api/chats/${chat.chat_id}`)
        .then(response => {
          if (response.data.length === 0) {
            this.chats.splice(this.chats.findIndex(ch => ch.chat_id === chat.chat_id), 1)
          } else {
            let message = response.data[response.data.length - 1]

            message.unread_count = chat.unread_count

            this.updateChatsWithMessage(message)
          }
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

    updateChatsWithMessage(message) {
      let index = this.chats.findIndex(chat => chat.chat_id === message.chat_id)

      if (index === -1) {
        this.chats.unshift(message)

        return
      }

      this.$set(this.chats, index, message)
      
      this.chats.sort((a, b) => {
        return a.id === message.id ? -1 : b === message.id ? 1 : 0
      })
    },

    handleMessageRead(message) {
      if (this.chatIsActive(message)) {
        this.$set(
          this.messages, this.messages.findIndex(m => m.id === message.id), message
        )
      }

      message.unread_count = 0

      this.$set(this.chats, this.chats.findIndex(ch => ch.chat_id === message.chat_id), message)
    },

    /**
     * Determine if the current route is the home route.
     */
    isHome() {
      return this.$route.name === 'home'
    },

    /**
     * Notify the user with the given message.
     */
    notify(message) {
      new Notification(message.sender.name, {
        body: `${message.files.length ? '[Image] ' : ''}${message.content ?? ''}`,
        icon: this.picture(message.sender)
      })
    },

    /**
     * Update the badge count.
     */
    updateBadgeCount() {
      remote.app.setBadgeCount(
        this.chats.filter(chat => chat.unread_count > 0).length
      )
    },
  }
}
</script>

<style src="./assets/css/app.css"></style>
