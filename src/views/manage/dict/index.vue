<template>
  <el-row type="flex" class="fit-scroll">
    <el-col :sm="6">
      <bv-scrollbar>
        <bv-tree ref="tree" :data="items" node-key="code" :default-expanded-keys="['root']" style="margin-bottom: 20px" @current-change="changeSelect">
          <span slot-scope="{ node, data }" class="tree-node-operates">
            <span>{{ data.code === 'root' ? node.label : data.code + ' - ' + node.label }}</span>
          </span>
        </bv-tree>
      </bv-scrollbar>
    </el-col>
    <el-col :sm="18">
      <bv-scrollbar>
        <dict-list ref="dictList" v-show="dictListVisible" :items="dictItems" @on-dict-created="onDictCreated" @on-dict-modified="onDictModified" @on-dict-removed="onDictRemoved" />
        <dict-detail ref="dictDetail" v-show="dictDetailVisible" :title="dictDetailTitle" :show-save="true" :item="currentItem" @on-dict-modified="onDictModified" />
      </bv-scrollbar>
    </el-col>
  </el-row>
</template>

<script>
  import { fetchDicts } from '@/api/manage/dictionary'
  import DictList from './components/dict-list'
  import DictDetail from './components/dict-detail'

  export default {
    name: 'ListDict',
    components: {
      DictList,
      DictDetail
    },
    data() {
      const checkCode = ((rule, value, callback) => {
        if (this.modifyType === 'create' && value && this.currentItem && this.currentItem.children) {
          // 判断value是否重复
          this.currentItem.children.forEach(item => {
            if (item.code === value) {
              callback(new Error('字典代码不能重复'))
              return
            }
          })
          callback()
        } else {
          callback()
        }
      })
      return {
        currentLevel: 0,
        currentItem: null,

        items: [],
        // details: [],
        dictDetailTitle: '',

        modifyType: null,
        dialogFormVisible: false,
        dictListVisible: true,
        dictDetailVisible: false,
        item: {},

        fetchDicts,

        rules: {
          code: [
            {required: true, message: '请输入字典代码', trigger: 'blur'},
            {validator: checkCode, trigger: 'blur'},
            { max: 20, message: '长度必须小于20个字', trigger: 'blur' }
          ],
          name: [
            {required: true, message: '请输入字典名称', trigger: 'blur'},
            { max: 20, message: '长度必须小于20个字', trigger: 'blur' }
          ]
        }
      }
    },
    computed: {
      dictItems() {
        return (this.items && this.items.length > 0 && this.items[0].children) || []
      }
    },
    created() {
      this.__currentNode = null
      // this.currentItem = null
      this.fetchTreeData()
    },
    methods: {
      onDictCreated(item) {
        this.$refs.tree.append(item, this.__currentNode)
        this.__currentNode.expanded = true
      },
      onDictModified(item) {
        if (this.currentLevel == 0 || this.currentLevel === 1) {
          this.currentItem.children.forEach((child => {
            if (child.code === item.code) {
              child.name = item.name
              child.children = item.children
            }
          }))
        } else if (this.currentLevel === 2) {
          this.currentItem.children = item.children
        }
      },
      onDictRemoved(items) {
        items.forEach(item => {
          this.$refs.tree.remove({...item})
        })
      },
      fetchTreeData() {
        fetchDicts().then((res) => {
          this.items = [
            {
              code: 'root',
              name: '字典',
              children: res.data
            }
          ]
          this.$nextTick(() => {
            this.__currentNode = this.$refs.tree.getNode('root')
            this.currentItem = this.items[0]

            this.$refs.dictList.fetchData()
          })
        })
      },
      changeSelect(data, node) {
        if (node.level > 2) {
          return
        }
        this.__currentNode = node
        this.currentLevel = node.level
        this.currentItem = data
        // this.details = []
        if (node.level === 1) {
          this.dictDetailVisible = false
          this.dictListVisible = true
          this.$refs.dictList.fetchData()
        } else if (node.level === 2) {
          this.dictListVisible = false
          this.dictDetailVisible = true
          this.dictDetailTitle = data.code + ' - ' + data.name
          // this.details = [...data.children || []]
          // this.dictDetails = [...data.children || []]
          this.$refs.dictDetail.fetchData(data.children)
          // this.$refs.dictDetail.fetchData([...data.children || []])
        }
      }
    }
  }
</script>
