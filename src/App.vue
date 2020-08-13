<template>
  <router-view></router-view>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  /**
   * The component's data.
   */
  data() {
    return {
      windowIsOpen: true
    }
  },

  /**
   * The component's computed properties.
   */
  computed: {
    user() {
      return this.$bus.user
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

    this.$bus.$on('message-sent', (message) => {
      this.updateChatsWithMessage(message)
    })

    ipcRenderer.on('window-open', (e, data) => {
      this.windowIsOpen = data
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
          if (this.activeUser && this.activeUser.id === e.message.sender_id && this.windowIsOpen && this.isHome()) {
            this.messages.push(e.message)

            this.readMessage(e.message)
          } else {
            let chat = this.findChatForId(e.message.chat_id)

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
          this.handleMessageUnsent(e.message)
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
     * Read the given message.
     */
    readMessage(message) {
      this.$http.put(`/api/chats/${message.chat_id}`)
        .then(response => {
          this.handleMessageRead(
            response.data.find(m => m.id === message.id)
          )
        }) 
    },

    /**
     * Handle the message read event.
     */
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
     * Handle the message unsent event.
     */
    handleMessageUnsent(message) {
      this.$http.get(`/api/chats/${message.chat_id}`)
        .then(response => {
          if (this.chatIsActive(message)) {
            this.messages.splice(
              this.messages.findIndex(m => m.id === message.id), 1
            )
          }
          
          let chat = this.chats.find(chat => chat.chat_id === message.chat_id)

          if (! message.read_at) {
            chat.unread_count--
          }

          if (response.data.length > 0) {
            let message = response.data.pop()

            message.unread_count = chat.unread_count

            this.updateChatsWithMessage(message)

            return
          }

          this.chats.splice(this.chats.findIndex(ch => ch.chat_id === chat.chat_id), 1)
        })
    },

    /**
     * Update chats with the given message.
     */
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

    /**
     * Find the chat for the given ID.
     */
    findChatForId(chatId) {
      return this.chats.find(chat => chat.chat_id === chatId)
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
      ipcRenderer.send(
        'badge-count-updated', this.chats.filter(chat => chat.unread_count > 0).length
      )
    }
  }
}
</script>

<style src="./assets/css/app.css"></style>
