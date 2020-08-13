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
          this.handleMessageSent(e.message)
        })
        .listen('MessageRead', (e) => {
          this.handleMessageRead(e.message)
        })
        .listen('MessageUnsent', (e) => {
          this.handleMessageUnsent(e.message)
        })
        .listen('ChatDeleted', (e) => {
          this.handleChatDeleted(e.user)
        })
    },

    /**
     * Handle the message sent event.
     */
    handleMessageSent(message) {
      if (this.windowIsOpen && this.isHome() && this.userIsActive(message.sender)) {
        this.messages.push(message)

        this.readMessage(message)
      } else {
        let chat = this.findChatForId(message.chat_id)

        message.unread_count = chat ? ++chat.unread_count : 1

        this.notify(message)
      }
      
      this.updateChatsWithMessage(message)

      this.updateBadgeCount()
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
        this.$set(this.messages, this.messages.findIndex(m => m.id === message.id), message)
      }

      message.unread_count = 0

      this.$set(this.chats, this.findIndexForChat(message.chat_id), message)
    },

    /**
     * Handle the message unsent event.
     */
    handleMessageUnsent(message) {
      this.$http.get(`/api/chats/${message.chat_id}`)
        .then(response => {
          if (this.chatIsActive(message)) {
            this.messages.splice(this.messages.findIndex(m => m.id === message.id), 1)
          }
          
          let chat = this.findChatForId(message.chat_id)

          if (! message.read_at) {
            chat.unread_count--
          }

          if (response.data.length > 0) {
            let message = response.data[response.data.length - 1]

            message.unread_count = chat.unread_count

            this.updateChatsWithMessage(message)

            return
          }

          this.chats.splice(this.findIndexForChat(chat.chat_id), 1)
        })
    },

    /**
     * Update chats with the given message.
     */
    updateChatsWithMessage(message) {
      let index = this.findIndexForChat(message.chat_id)

      if (index === -1) {
        this.chats.unshift(message)

        return
      }

      this.$set(this.chats, index, message)
      
      this.chats.sort((a, b) => {
        return a.id === message.id ? -1 : b === message.id ? 1 : 0
      })

      this.updateBadgeCount()
    },

    /**
     * Handle the chat deleted event.
     */
    handleChatDeleted(user) {
      let chat = this.findChatForUser(user)

      if (this.chatIsActive(chat)) {
        this.activeUser = null
      }

      this.chats.splice(this.findIndexForChat(chat.chat_id), 1)

      this.updateBadgeCount()
    },

    /**
     * Determine if the given user is active.
     */
    userIsActive(user) {
      return this.activeUser && this.activeUser.id === user.id
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
