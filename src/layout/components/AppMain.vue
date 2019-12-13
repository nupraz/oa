<template>
  <!-- eslint-disable-next-line -->
  <component :is="fixedHeader ? 'bv-scrollbar' : 'div'">
    <section class="app-main">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <router-view :key="key" />
        </keep-alive>
      </transition>
    </section>
  </component>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'AppMain',
  computed: {
    ...mapState({
      fixedHeader: state => state.user.settings.fixedHeader
    }),
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>

.app-main {
  width: 100%;
  position: relative;
}
</style>
