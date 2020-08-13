import _ from 'lodash'
import moment from 'moment'
import API_URL from './api-url'

export default {
  methods: {
    /**
     * Format the given errors.
     */
    formatErrors(errors) {
      return _.mapValues(errors, error => error[0])
    },

    /**
     * Handle the after authentication actions.
     */
    handleAfterAuth(token) {
      localStorage.setItem('token', token)

      this.$http.defaults.headers.common.Authorization = `Bearer ${token}`
      this.$echo.connector.pusher.config.auth.headers.Authorization = `Bearer ${token}`

      this.$router.push('/home')
    },

    /**
     * Handle the after logout actions.
     */
    handleAfterLogout() {
      this.$echo.leave(`typing.${this.$bus.user.id}`)
      this.$echo.leave(`App.User.${this.$bus.user.id}`)

      this.$bus.user = null
      this.$bus.chats = []
      this.$bus.messages = []
      this.$bus.activeUser = null

      localStorage.removeItem('token')
      
      delete this.$http.defaults.headers.Authorization
      
      this.$router.push('/')
    },

    /** 
     * Get the URL for the given user's picture.
    */
    picture(user) {
      if (user.picture) {
        return `${API_URL}/${user.picture}`
      }

      return '/user.png'
    },

    /**
     * Get the URL for the given file.
     */
    fileUrl(file) {
      return `${API_URL}/api/files/${file.id}?api_token=${localStorage.getItem('token')}`
    },

    /**
     * Get the date from now.
     */
    dateFromNow(timestamp) {
      return moment(timestamp).fromNow()
    },

    /**
     * Get the date from the given timestamp.
     */
    date(timestamp) {
      return moment(timestamp).format('YYYY-MM-DD')
    },

    /** 
     * Get the time from the given timestamp. 
     */
    time(timestamp) {
      return moment(timestamp).format('HH:mm')
    },

    /** 
     * Get the date and time from the given timestamp. 
     */
    dateTime(timestamp) {
      return moment(timestamp).format('YYYY-MM-DD HH:mm')
    },

    /**
     * Find the chat for the active user.
     */
    findChatForActiveUser() {
      return this.findChatForUser(this.activeUser)
    },

    /**
     * Find the chat for the given user.
     */
    findChatForUser(user) {
      return this.chats.find(
        chat => [chat.sender_id, chat.receiver_id].includes(user.id)
      )
    },

    /**
     * Find the chat for the given ID.
     */
    findChatForId(chatId) {
      return this.chats.find(chat => chat.chat_id === chatId)
    },

    /**
     * Find the index for the given chat.
     */
    findIndexForChat(chatId) {
      return this.chats.findIndex(chat => chat.chat_id === chatId)
    },

    /**
     * Determine if the given chat is active.
     */
    chatIsActive(chat) {
      if (! this.activeUser) {
        return false
      }

      let ch = this.findChatForActiveUser()

      if (ch) {
        return ch.chat_id === chat.chat_id
      }
      
      return false
    },
  }
}
