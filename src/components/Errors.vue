<template>
  <div class="fixed h-full w-full flex justify-center items-center z-30">
    <button class="fixed h-full w-full cursor-default focus:outline-none bg-black opacity-75" @click="hide"></button>
    <div class="relative bg-white rounded-md" style="width: 36rem;">
      <div class="p-3 border-b border-gray-200">Message Not Sent</div>
      <div class="p-3 border-gray-200 text-sm">
        <ul class="p-4 bg-red-100 border border-red-500 text-red-700 rounded-md" v-for="error in errors" :key="error">
          <li class="">{{ error }}</li>
        </ul>
      </div>
      <div class="flex p-3 text-sm justify-end">
        <button class="py-2 px-4 rounded-md border-gray-200 hover:bg-gray-200 text-gray-700 focus:outline-none" type="button" @click="hide">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['errors', 'hide'],
}
</script>
