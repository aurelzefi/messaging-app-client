<template>
  <div>
    <div>
      <div>
        
      </div>

      <div>
        <ul v-if="chats.length">
          <li v-for="chat in chats" :key="chat.id" @click="getChat(chat)">
            {{ chatUser(chat).name }}

            {{ chat.created_at }}
          </li>
        </ul>

        <div v-else>
          No chats to display.
        </div>
      </div>
    </div>

    <div>
      <div v-if="chat">
        <span>{{ chatUser(chat).name }}</span>

        <button type="button" @click="openFileBrowser">Add Files</button>
        <input type="file" ref="files" multiple @change="handleFiles">
      </div>

      <div>
        <ul v-if="messages.length">
          <li v-for="message in messages" :key="message.id">
            {{ message.content }}
          </li>
        </ul>
      </div>

      <div>
        <input type="text" v-model="form.message">
      </div>  
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chats: [],

      messages: [],

      chat: null,

      form: {
        message: ''
      }
    }
  },

  mounted() {
    this.getChats()
  },

  methods: {
    getChats() {
      this.$http.get('/api/chats')
        .then(response => {
          this.chats = response.data
        })
    },

    getChat(chat) {
      this.chat = chat

      this.$http.get(`/api/chats/${this.chatUser(chat).id}`)
        .then(response => {
          this.messages = response.data
        })
    },

    chatUser(chat) {
      return this.$bus.user.id === chat.sender.id ? chat.receiver : chat.sender;
    },

    openFileBrowser() {

    },

    handleFiles() {

    }
  }
}
</script>
