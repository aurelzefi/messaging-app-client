<template>
  <div>
    <button type="button" @click="back">Back</button>
  </div>
</template>

<script>
export default {
  methods: {
    back() {
      this.$router.go(-1)
    }
  } 
}
</script>
