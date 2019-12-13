<template>
  <div class="app">
    <img class="image" :src="urlImg" width="20%" height="20%" />
  </div>
</template>

<script>
import urlImg from '@/assets/page.png'
export default {
  name: 'Dashboard',
  data() {
    return {
      urlImg
    }
  }
}
</script>

<style lang="scss" scoped>
  .app{
    margin-top: 16%;
    .image{
      display: block;
      margin: auto auto;
    }
  }
</style>
