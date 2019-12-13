<template>
  <div>
    <div :class="{'has-logo':showLogo}">
      <bv-logo v-if="showLogo" :collapse="isCollapse" />
    </div>
    <bv-scrollbar>
      <el-aside width="100%">
        <el-menu
          ref="menu"
          class="app-menu"
          :default-active="activeMenu"
          :collapse="isCollapse"
          :unique-opened="true"
          mode="vertical"
          :collapse-transition="false"
          v-bind="menuOptions"
        >
          <sidebar-item v-for="route in permissionRoutes" :key="route.path" :item="route" :base-path="route.path" />
        </el-menu>
      </el-aside>
    </bv-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BvLogo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
  components: {
    BvLogo,
    SidebarItem
  },
  data() {
    return {
      menuOptions: {}
    }
  },
  computed: {
    ...mapGetters([
      'permissionRoutes',
      'sidebar'
    ]),
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.user.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  beforeMount() {
    if (this.$route.path === '/dashboard') {
      for (let i=0; i<this.permissionRoutes.length; i++) {
        if (!this.permissionRoutes[i].hidden && this.permissionRoutes[i].children && this.permissionRoutes[i].children.length > 0) {
          return this.menuOptions.defaultOpeneds = [this.permissionRoutes[i].path]
        }
      }
    }
  }
  /*mounted() {
    this.$nextTick(() => {
      this.$refs.menu.open(0)
    })
  }*/
}
</script>
