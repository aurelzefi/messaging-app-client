<template>
  <div class="fixed h-full w-full flex justify-center items-center z-20">
    <button class="absolute mt-2 mr-2 top-0 right-0 text-white focus:outline-none z-30" @click="hide">
      <svg viewBox="0 0 20 20" fill="currentColor" class="x w-8 h-8"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
    </button>
    <button class="fixed h-full w-full cursor-default focus:outline-none bg-black opacity-75" @click="hide"></button>
    <div class="relative flex flex-col items-center my-4" style="width: 36rem;">
      <img class="rounded" style="max-height: 75vh;" :src="active">

      <div class="mt-4 w-full">
        <form class="flex" @submit.prevent="send">
          <input class="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" type="text" v-model="form.content" v-focus @keyup="whisper" placeholder="Type a message">

          <button class="ml-2 py-2 px-4 bg-white hover:bg-gray-200 rounded focus:outline-none" type="submit">
            <svg viewBox="0 0 20 20" fill="currentColor" class="chevron-double-right w-6 h-6 text-gray-700"><path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
          </button>
        </form>
      </div>

      <div class="flex mt-4 justify-center">
        <button class="focus:outline-none" :class="{ 'ml-2': urls.indexOf(url) > 0 }" v-for="url in urls" :key="url" @click="active = url">
          <img class="w-20 h-20 rounded" :src="url">
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['files', 'hide'],

  /**
   * The component's data.
   */
  data() {
    return {
      urls: [],

      active: null,

      form: {
        content: ''
      }
    }
  },

  /**
   * Mount the component.
   */
  mounted() {
    this.urls = this.files.map((file) => {
      return URL.createObjectURL(file)
    })

    this.active = this.urls[0]
  },

  methods: {
    /**
     * Emit the event on whisper.
     */
    whisper(e) {
      this.$bus.$emit('whisper', e)
    },

    /**
     * Emit the event on preview done.
     */
    send() {
      this.$bus.$emit('preview-done', {
        content: this.form.content
      })
    }
  }
}
</script>
