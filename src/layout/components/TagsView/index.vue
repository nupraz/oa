<template>
  <div id="tags-view-container" class="tags-view-container" :class="tabsStyle">
    <div v-if="tabsStyle === 'default'">
      <scroll-pane ref="scrollPane" class="tags-view-wrapper">
        <router-link
          v-for="tag in visitedViews"
          ref="tag"
          :key="tag.path"
          :class="isActive(tag)?'active':''"
          :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
          tag="span"
          class="tags-view-item"
          @click.middle.native="closeSelectedTag(tag)"
          @contextmenu.prevent.native="openMenu(tag, $event)"
        >
          <bv-icon v-if="isHome(tag)" icon-class="home" />
          <span v-else>{{ generateTitle(tag.title) }}</span>
          <span v-if="!tag.meta.affix" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)" />
        </router-link>
      </scroll-pane>
      <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
        <li @click="refreshSelectedTag(selectedTag)">
          {{ $t('tagsView.refresh') }}
        </li>
        <li v-if="!(selectedTag.meta&&selectedTag.meta.affix)" @click="closeSelectedTag(selectedTag)">
          {{
            $t('tagsView.close') }}
        </li>
        <li @click="closeOthersTags">
          {{ $t('tagsView.closeOthers') }}
        </li>
        <li @click="closeAllTags(selectedTag)">
          {{ $t('tagsView.closeAll') }}
        </li>
      </ul>
    </div>
    <div class="tabs-container" v-else>
      <el-tabs type="card" v-model="activeTab" @tab-click="onTabClick" @tab-remove="closeSelectedTag">
        <el-tab-pane
          v-for="tag in visitedViews"
          :key="tag.path"
          :name="tag.path"
          :closable="!tag.meta.affix"
        >
          <template slot="label">
            <bv-icon v-if="isHome(tag)" icon-class="home" />
            <span v-else>{{ generateTitle(tag.title) }}</span>
          </template>
        </el-tab-pane>
      </el-tabs>
      <div class="context">
        <el-dropdown @command="handleCommand">
          <bv-button svg-icon="down" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="refresh">{{ $t('tagsView.refresh') }}</el-dropdown-item>
            <el-dropdown-item v-if="!(selectedTag && selectedTag.meta && selectedTag.meta.affix)" command="close">{{ $t('tagsView.close') }}</el-dropdown-item>
            <el-dropdown-item command="closeOthers">{{ $t('tagsView.closeOthers') }}</el-dropdown-item>
            <el-dropdown-item command="closeAll">{{ $t('tagsView.closeAll') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ScrollPane from './ScrollPane'
import { i18n } from '@bestvike/utils'
import path from 'path'

export default {
  components: { ScrollPane },
  data() {
    return {
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      affixTags: [],
      activeTab: ''
    }
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    visitedViews() {
      return this.$store.state.tagsView.visitedViews
    },
    routes() {
      return this.$store.state.permission.routes
    },
    tabsStyle() {
      return this.$store.getters.settings.tabsStyle || 'default'
    }
  },
  watch: {
    $route() {
      this.addTags()
      this.moveToCurrentTag()
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    },
    activeTab(value) {
      this.visitedViews.forEach(visitedView => {
        if (value === visitedView.path) {
          this.selectedTag = visitedView
          return false
        }
      })
    }
  },
  mounted() {
    this.initTags()
    this.addTags()
    if (this.tabsStyle === 'legacy') {
      this.activeTab = this.$route.path
    }
  },
  methods: {
    isHome(tag) {
      return tag.name === 'Dashboard'
    },
    generateTitle: i18n.generateTitle, // generateTitle by vue-i18n
    isActive(route) {
      if (process.env.VUE_APP_DETAIL_SEPRATE === 'false' && route.meta && route.meta.match && this.$route.meta && this.$route.meta.match) {
        return route.meta.match === this.$route.meta.match
      } else {
        return route.path === this.$route.path
      }
      // return route.path === this.$route.path
    },
    filterAffixTags(routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]
          }
        }
      })
      return tags
    },
    initTags() {
      const affixTags = this.affixTags = this.filterAffixTags(this.routes)
      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) {
          this.$store.dispatch('tagsView/addVisitedView', tag)
        }
      }
    },
    onTabClick(tab) {
      this.$router.push(tab.name)
    },
    addTags() {
      const { name } = this.$route
      if (name) {
        this.$store.dispatch('tagsView/addView', this.$route)
      }
      return false
    },
    moveToCurrentTag() {
      if (this.tabsStyle === 'default') {
        const tags = this.$refs.tag
        this.$nextTick(() => {
          for (const tag of tags) {
            if (tag.to.path === this.$route.path) {
              this.$refs.scrollPane.moveToTarget(tag)
              // when query is different then update
              if (tag.to.fullPath !== this.$route.fullPath) {
                this.$store.dispatch('tagsView/updateVisitedView', this.$route)
              }
              break
            }
          }
        })
      } else if (this.tabsStyle === 'legacy') {
        this.$nextTick(() => {
          if (this.activeTab !== this.$route.path) {
            this.$store.dispatch('tagsView/updateVisitedView', this.$route)
            this.activeTab = this.$route.path
          }
        })
      }
    },
    refreshSelectedTag(view) {
      this.$store.dispatch('tagsView/delCachedView', view).then(() => {
        const { fullPath } = view
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect' + fullPath
          })
        })
      })
    },
    closeSelectedTag(view) {
      if (typeof view === 'string') {
        this.visitedViews.forEach(visitedView => {
          if (visitedView.path === view) {
            view = visitedView
            return false
          }
        })
      }
      this.$store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        if (this.isActive(view)) {
          this.toLastView(visitedViews, view)
        }
      })
    },
    closeOthersTags() {
      this.$router.push(this.selectedTag)
      this.$store.dispatch('tagsView/delOthersViews', this.selectedTag).then(() => {
        this.moveToCurrentTag()
      })
    },
    closeAllTags(view) {
      this.$store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
        if (this.affixTags.some(tag => tag.path === view.path)) {
          return
        }
        this.toLastView(visitedViews, view)
      })
    },
    toLastView(visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView)
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath })
        } else {
          this.$router.push('/')
        }
      }
    },
    openMenu(tag, e) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX - offsetLeft + 15 + (this.sidebar.opened ? 145 : 0) // 15: margin right

      if (left > maxLeft) {
        this.left = maxLeft
      } else {
        this.left = left
      }

      this.top = e.clientY
      this.visible = true
      this.selectedTag = tag
    },
    closeMenu() {
      this.visible = false
    },
    handleCommand(command) {
      if (command === 'refresh') {
        this.refreshSelectedTag(this.selectedTag)
      } else if (command === 'close') {
        this.closeSelectedTag(this.selectedTag)
      } else if (command === 'closeOthers') {
        this.closeOthersTags()
      } else if (command === 'closeAll') {
        this.closeAllTags(this.selectedTag)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.tags-view-container {
  height: $tagsViewHeight;
  width: 100%;
  background: #fff;
  &.default {
    border-bottom: 1px solid #d8dce5;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  }
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 15px;
      }
      &:last-of-type {
        margin-right: 15px;
      }
      /*&.active {
        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }*/
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
@import "@/styles/variables.scss";
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(.6);
        display: inline-block;
        vertical-align: -3px;
      }
    }
  }
}
.tags-view-container {
  .el-tabs--card > .el-tabs__header {
    margin-bottom: 0;
  }
  .tabs-container {
    display: flex;
    justify-content: space-between;

    .el-tabs {
      width: calc(100% - 30px);

      .el-tabs__nav-next, .el-tabs__nav-prev {
        height: $tagsViewTabsHeight;
        line-height: $tagsViewTabsHeight;
        width: 20px;
        text-align: center;

        &:hover, &:focus {
          color: #3693f3;
          border-color: #c3dffb;
          background-color: #ebf4fe;
        }
      }
    }
  }
  .context, .el-tabs__item {
    height: $tagsViewTabsHeight;
    line-height: $tagsViewTabsHeight;
  }
  .context {
    width: 30px;
    flex-basis: 30px;
    text-align: center;
    .el-button {
      padding: 8px 5px 7px 6px;
      border-radius: 0;
    }
  }

  .svg-icon {
    width: 1.2em;
    height: 1.2em;
  }
}
</style>
