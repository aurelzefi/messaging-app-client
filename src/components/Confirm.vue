<template>
  <div class="fixed h-full w-full flex justify-center items-center z-30">
    <button class="fixed h-full w-full cursor-default focus:outline-none bg-black opacity-75" @click="hide"></button>
    <div class="relative bg-white rounded-md" style="width: 36rem;">
      <div class="p-3 border-b border-gray-200">{{ data.title }}</div>
      <div class="p-3 border-gray-200 text-sm">{{ data.body }}</div>
      <div class="flex p-3 text-sm justify-end">
        <button class="py-2 px-4 rounded border-gray-200 hover:bg-gray-200 text-gray-700 focus:outline-none" type="button" @click="hide">Close</button>
        <button class="ml-4 py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded text-white focus:outline-none" type="button" @click="confirm">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['data', 'hide'],

  data() {
    return {
      //
    }
  },
  
  methods: {
    confirm() {
      this.data.method()
    }
  }
}
</script>
