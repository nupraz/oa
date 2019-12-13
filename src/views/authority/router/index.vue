<template>
  <el-tree :data="items" node-key="path" :props="defaultProps" accordion>
    <span slot-scope="{ node, data }" class="tree-node-operates">
      <span>{{ node.label }}</span>
      <span v-if="data.meta && data.meta.operates && data.meta.operates.length > 0" class="operates-container">
        <bv-button v-for="el in data.meta.operates" :key="el.name" type="text"> {{ el.label }} </bv-button>
      </span>
    </span>
  </el-tree>
</template>

<script>
  // import i18n from '@/lang'
  import { asyncRoutes, constantRoutes } from '@/router'

  export default {
    name: 'ListRouter',
    data() {
      return {
        defaultProps: {
          label: this.showLabel
        },
        items: [...constantRoutes, ...asyncRoutes].filter((router) => {
          return !router.hidden && router.meta
        })
      }
    },
    methods: {
      showLabel(data) {
        return this.$filters.translate(data.meta)
        /*if (!data.meta) {
          return data.path || '首页'
        }
        if (data.meta.title.indexOf('${') === 0 && data.meta.title.indexOf('}') === data.meta.title.length - 1 ) {
          const titleName = data.meta.title.substring(2, data.meta.title.length - 1)
          return i18n.t(`route.${titleName}`)
        }
        return data.meta.title*/
      }
    }
  }
</script>

<style lang="scss" scoped>
  .tree-node-operates {
    > span {
      font-size: 14px;
      line-height: 36px;
    }
  }
</style>