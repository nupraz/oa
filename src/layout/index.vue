<template>
  <el-container :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <bv-sidebar class="sidebar-container" />
    <bv-scrollbar v-if="!fixedHeader" ref="scrollbar">
      <div :class="{'has-tags-view': needTagsView, 'fixed-header':fixedHeader}" class="main-container">
        <bv-navbar />
        <bv-tags-view v-if="needTagsView" />
        <bv-main class="app-main-container" />
        <bv-right-panel v-if="showSettings">
          <bv-settings />
        </bv-right-panel>
      </div>
    </bv-scrollbar>
    <div v-else :class="{'has-tags-view': needTagsView, 'fixed-header':fixedHeader}" class="main-container">
      <bv-navbar />
      <bv-tags-view v-if="needTagsView" />
      <bv-main class="app-main-container" />
      <bv-right-panel v-if="showSettings">
        <bv-settings />
      </bv-right-panel>
    </div>
  </el-container>
</template>

<script>
import { RightPanel } from '@bestvike/components'
import { BvNavbar, BvSidebar, BvMain, BvTagsView, BvSettings } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import { mapState } from 'vuex'

export default {
  name: 'Layout',
  components: {
    BvRightPanel: RightPanel,
    BvSidebar,
    BvNavbar,
    BvMain,
    BvTagsView,
    BvSettings
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
      showSettings: state => state.user.settings.showSettings,
      needTagsView: state => state.user.settings.tagsView,
      fixedHeader: state => state.user.settings.fixedHeader
    }),
    classObj() {
      return {
        'sidebar-mini': !this.sidebar.opened,
        'sidebar-normal': this.sidebar.opened,
        'no-animation': this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  }
}
</script>
