<template>
  <div>
    <bv-table ref="table" :title="title || '字典项配置'" :search="false" :data="details">
      <bv-table-column type="selection" />
      <bv-table-column label="字典代码" prop="code" align="center">
        <template slot-scope="scope">
          <el-input v-model.trim="scope.row.code" />
        </template>
      </bv-table-column>
      <bv-table-column label="字典名称" prop="name" align="center">
        <template slot-scope="scope">
          <el-input v-model.trim="scope.row.name" />
        </template>
      </bv-table-column>

      <div slot="operates">
        <bv-button show="none" view="create" @click="addDetail()">新增字典项</bv-button>
        <bv-button v-if="showSave" show="none" view="save" @click="saveDetail()">保存字典项</bv-button>
        <bv-button show="oneOrMore" view="remove" @click="removeDetail()">删除字典项</bv-button>
      </div>
    </bv-table>
  </div>
</template>
<script>
  import { modifyDict } from '@/api/manage/dictionary'

  export default {
    name: 'DictDetail',
    props: {
      title: String,
      items: Array,
      showSave: Boolean,
      item: Object
    },
    data() {
      return {
        id__: 0,
        details: this.items
      }
    },
    methods: {
      /*fetchTableData() {
        return new Promise(resolve => {
          resolve({
            data: this.items
          })
        })
      },*/
      fetchData(items) {
        if (items) {
          this.details = [...items]
        }
        this.$nextTick(() => {
          this.$refs.table.fetchData()
        })
      },
      addDetail() {
        this.details.push({
          id__: ++this.id__,
          code: '',
          name: ''
        })
      },
      saveDetail() {
        let item = {...this.item}
        item.children = this.details
        modifyDict(item).then(() => {
          this.$emit('on-dict-modified', item)
          this.$message({
            message: '保存成功',
            type: 'success'
          })
        })
      },
      removeDetail() {
        let selections = this.$refs.table.selection
        if (selections && selections.length > 0) {
          selections.forEach(selection => {
            this.details.splice(this.details.findIndex(item => item.id__ ? item.id__ === selection.id__ : item.code === selection.code), 1)
          })
          this.$refs.table.clearSelection()
        }
      }
    }
  }
</script>

