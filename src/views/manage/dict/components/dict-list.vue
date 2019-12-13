<template>
  <div>
    <bv-table
      ref="dictTable"
      title="字典一览"
      :search="false"
      :data="items"
    >
      <div slot="operates">
        <bv-button show="none" view="create" @click="startCreate()">新增</bv-button>
        <bv-button show="one" view="modify" @click="startModify()">修改</bv-button>
        <bv-button show="oneOrMore" view="remove" @click="startRemove()">删除</bv-button>
      </div>
      <bv-table-column type="selection" />
      <bv-table-column label="字典代码" prop="code" align="center" />
      <bv-table-column label="字典名称" prop="name" align="center" />
    </bv-table>
    <bv-dialog title="字典维护" :visible.sync="dialogFormVisible" v-if="dialogFormVisible">
      <bv-form ref="dialogForm" :model="item" :rules="rules">
        <bv-row layout="dialog-2">
          <bv-col>
            <bv-form-item label="字典代码" prop="code">
              <el-input v-if="modifyType === 'create'" v-model.trim="item.code" />
              <span v-else v-text="item.code" />
            </bv-form-item>
          </bv-col>
          <bv-col>
            <bv-form-item label="字典名称" prop="name">
              <el-input v-model.trim="item.name" />
            </bv-form-item>
          </bv-col>
        </bv-row>
        <bv-row>
          <bv-col>
            <dict-detail :items="details" />
          </bv-col>
        </bv-row>
      </bv-form>
      <div slot="footer">
        <bv-button view="save" @click="confirmModify()">保存</bv-button>
        <bv-button view="cancel" @click="cancelModify()">取消</bv-button>
      </div>
    </bv-dialog>
  </div>
</template>
<script>
  import { createDict, modifyDict, removeDicts } from '@/api/manage/dictionary'
  import DictDetail from './dict-detail'

  export default {
    name: 'DictList',
    components: {
      DictDetail
    },
    props: {
      items: Array
    },
    data() {
      const checkCode = ((rule, value, callback) => {
        if (this.modifyType === 'create' && value && this.__currentItem && this.__currentItem.children) {
          // 判断value是否重复
          this.__currentItem.children.forEach(item => {
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
        dialogFormVisible: false,
        item: {},
        modifyType: '',
        rules: {
          code: [
            { required: true, message: '请输入字典代码', trigger: 'blur' },
            { validator: checkCode, trigger: 'blur' },
            { max: 20, message: '长度必须小于20个字', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '请输入字典名称', trigger: 'blur' },
            { max: 20, message: '长度必须小于20个字', trigger: 'blur' }
          ]
        },
        details: []
      }
    },
    methods: {
      /*fetchTableData() {
        return new Promise(resolve => {
          resolve({
            data: this.items && this.items.length > 0 && this.items[0].children
          })
        })
      },*/
      fetchData() {
        this.$refs.dictTable.clearSelection()
        this.$refs.dictTable.fetchData()
      },
      initItem() {
        this.item = {
          children: []
        }
      },
      startCreate() {
        this.initItem()
        this.dialogFormVisible = true
        this.modifyType = 'create'
        this.$refs.dialogForm && this.$refs.dialogForm.clearValidate()

        this.details = []
      },
      startModify() {
        this.item = {...this.$refs.dictTable.table.selection[0]}
        this.dialogFormVisible = true
        this.modifyType = 'modify'
        this.$refs.dialogForm && this.$refs.dialogForm.clearValidate()

        if (!this.item.children) {
          this.details = []
        } else {
          this.details = [...this.item.children]
        }
      },
      cancelModify() {
        this.dialogFormVisible = false
        this.modifyType = null

        this.$nextTick(() => {
          this.initItem()
          this.details = []
        })
      },
      confirmModify() {
        let item = {...this.item}
        item.children = this.details
        this.$refs.dialogForm.validate((valid) => {
          if (!valid) {
            return false
          }
          if (this.modifyType === 'modify') {
            // 校验重复
            modifyDict(item).then(() => {
              this.$emit('on-dict-modified', item)
              this.$refs.dictTable.clearSelection()
              this.afterModify()
            })
          } else {
            createDict(item).then(() => {
              this.$emit('on-dict-created', item)
              // 树增加子节点
              // this.$parent.$refs.tree.append(item, this.__currentNode)
              // 展开节点
              // this.$parent.__currentNode.expanded = true
              this.afterModify()
            })
          }
        })
      },
      afterModify() {
        // this.fetchData(true)
        this.fetchData()
        this.initItem()
        this.dialogFormVisible = false
        this.modifyType = null
        this.$message({
          message: '保存成功',
          type: 'success'
        })
      },
      startRemove() {
        this.$confirm('此操作将删除该字典, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let selection = this.$refs.dictTable.table.selection
          removeDicts(selection.map(item => item.code).join()).then(() => {
            this.$emit('on-dict-removed', selection)
            this.$refs.dictTable.fetchData()
            /*this.$refs.dictTable.table.selection.forEach(item => {
              this.$refs.tree.remove({...item})
            })
            this.$refs.dictTable.fetchData()*/
            this.$message({
              message: '删除成功',
              type: 'success'
            })
          })
        }).catch(() => {
        })
      }
    }
  }
</script>

