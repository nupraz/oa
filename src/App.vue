<template>
  <div id="app">
    <router-view />
    <login-dialog />
  </div>
</template>

<script>
import LoginDialog from './components/login/login-dialog'

export default {
  name: 'App',
  components: {
    LoginDialog
  }
}
</script>

<style>
body {
  overflow: hidden;
}
</style>
