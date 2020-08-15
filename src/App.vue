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
    Notification.requestPermission()

    this.$bus.$on('user-set', () => {
      this.getChats()
      this.listenForMessages()
    })

    this.$bus.$on('chats-updated', () => {
      this.updateBadgeCount()
    })

    this.$bus.$on('message-sent', (message) => {
      this.updateChatsForMessage(message)
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
        this.scroll = null

        this.messages.push(message)

        this.readMessage(message)
      } else {
        let chat = this.findChatForId(message.chat_id)

        message.unread_count = chat ? ++chat.unread_count : 1

        this.notify(message)
      }

      this.updateChatsForMessage(message)
    },

    /**
     * Read the given message.
     */
    readMessage(message) {
      this.$http.put(`/api/chats/${message.chat_id}`)
        .then(response => {
          this.handleMessageRead(response.data.find(m => m.id === message.id))
        })
    },

    /**
     * Handle the message read event.
     */
    handleMessageRead(message) {
      if (this.chatIsActive(message)) {
        this.scroll = null

        this.updateMessage(message)
      }

      message.unread_count = 0

      this.updateChat(message)
    },

    /**
     * Handle the message unsent event.
     */
    handleMessageUnsent(message) {
      this.$http.get(`/api/chats/${message.chat_id}`)
        .then(response => {
          if (this.chatIsActive(message)) {
            this.removeMessage(message)
          }

          let chat = this.findChatForId(message.chat_id)

          if (! message.read_at) {
            chat.unread_count--
          }

          if (response.data.length > 0) {
            let message = response.data[response.data.length - 1]

            message.unread_count = chat.unread_count

            this.updateChat(chat)

            this.updateBadgeCount()

            return
          }

          this.removeChat(chat)

          this.updateBadgeCount()
        })
    },

    /**
     * Update chats for the given message.
     */
    updateChatsForMessage(message) {
      let index = this.chats.findIndex(chat => chat.chat_id === message.chat_id)

      if (index === -1) {
        this.chats.unshift(message)
      } else {
        this.updateChat(message)

        this.chats.sort((a, b) => {
          return a.id === message.id ? -1 : b === message.id ? 1 : 0
        })
      }

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

      this.removeChat(chat)

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
        body: `${message.files.length ? '[Picture] ' : ''}${message.content ?? ''}`,
        icon: this.picture(message.sender)
      })
    },

    /**
     * Update the badge count.
     */
    updateBadgeCount() {
      ipcRenderer.send(
        'chats-updated', this.chats.filter(chat => chat.unread_count > 0).length
      )
    }
  }
}
</script>

<style src="./assets/css/app.css"></style>
