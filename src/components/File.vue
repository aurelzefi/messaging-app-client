<template>
  <div class="fixed h-full w-full flex justify-center items-center z-20">
    <button class="absolute mt-3 mr-3 top-0 right-0 text-white focus:outline-none z-30" @click="hide">
      <svg class="h-6 w-6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    <button class="fixed h-full w-full cursor-default focus:outline-none bg-black opacity-75" @click="hide"></button>
    <img class="relative max-w-screen-xl rounded-md" style="max-height: 95vh;" :src="filePath(file.id)">
  </div>
</template>

<script>
export default {
  props: ['file', 'hide']
}
</script>
