<template>
  <div class="app-container">
    <bv-table title="角色一览" :pagination="false" :filter.sync="filter" style="padding-bottom: 20px" :fetch-api="fetchRoles" @on-mounted="(table) => tableInstance = table">
      <div slot="operates">
        <bv-button show="one" view="grant" @click="startGrant()">授权</bv-button>
        <bv-button show="none" view="create" authority="create" @click="startCreate()">新增</bv-button>
        <bv-button show="one" view="modify" authority="modify" @click="startModify()">修改</bv-button>
        <bv-button v-if="checkRemove()" view="remove" authority="remove" @click="startRemove()">删除</bv-button>
      </div>
      <div slot="search">
        <bv-col>
          <bv-form-item label="角色代码" prop="id">
            <el-input v-model="filter.id" />
          </bv-form-item>
        </bv-col>
        <bv-col>
          <bv-form-item label="角色名称" prop="name">
            <el-input v-model="filter.name" />
          </bv-form-item>
        </bv-col>
      </div>
      <bv-table-column type="selection" :selectable="selectableCheckBox" />
      <bv-table-column label="角色代码" prop="id" align="center" />
      <bv-table-column label="角色名称" prop="name" align="center" />
    </bv-table>

    <bv-dialog title="角色维护" :visible.sync="dialogFormVisible" @close="resetModify">
      <bv-form ref="dialogForm" :model="item" :rules="rules">
        <bv-row layout="dialog-2">
          <bv-col>
            <bv-form-item label="角色代码" prop="id">
              <bv-input v-if="modifyType === 'create'" v-model.trim="item.id" />
              <span v-else v-text="item.id" />
            </bv-form-item>
          </bv-col>
          <bv-col>
            <bv-form-item label="角色名称" prop="name">
              <bv-input v-model.trim="item.name" />
            </bv-form-item>
          </bv-col>
          <bv-col layout="100%">
            <bv-form-item class="form-item-fill" label="授权" prop="grants">
              <el-tree ref="formTree" :data="routes" node-key="id" :props="{label: showLabel}" show-checkbox :default-expand-all="true">
                <span slot-scope="{ node, data }" class="tree-node-operates">
                  <span>{{ node.label }}</span>
                  <span v-if="data.authority && data.authority.operates && data.authority.operates.length > 0" v-show="node.checked" class="operates-container">
                    <el-checkbox
                      v-model="data.isAllOperatesSelected__"
                      :indeterminate="isIndeterminate(data)"
                      @change="value => changeSelectAll(value, data)"
                    >
                      全选
                    </el-checkbox>
                    <el-checkbox-group v-model="data.meta.operates" @change="(value) => changeSelect(value, data)">
                      <el-checkbox v-for="el in data.authority.operates" :key="data.name + '-' + el.name" :label="el.name"> {{ el.label }} </el-checkbox>
                    </el-checkbox-group>
                  </span>
                </span>
              </el-tree>
            </bv-form-item>
          </bv-col>
        </bv-row>
      </bv-form>
      <div slot="footer">
        <bv-button view="save" @click="confirmModify">保存</bv-button>
        <bv-button view="cancel" @click="resetModify">取消</bv-button>
      </div>
    </bv-dialog>

    <bv-dialog title="角色授权" :visible.sync="dialogGrantVisible" top="5vh" width="1200px">
      <bv-scrollbar>
        <el-tree ref="tree" :data="routes" node-key="id" :props="{label: showLabel}" show-checkbox :default-expand-all="true">
          <span slot-scope="{ node, data }" class="tree-node-operates">
            <span>{{ node.label }}</span>
            <span v-if="data.authority && data.authority.operates && data.authority.operates.length > 0" v-show="node.checked" class="operates-container">
              <el-checkbox
                v-model="data.isAllOperatesSelected__"
                :indeterminate="isIndeterminate(data)"
                @change="value => changeSelectAll(value, data)"
              >
                全选
              </el-checkbox>
              <el-checkbox-group v-model="data.meta.operates" @change="(value) => changeSelect(value, data)">
                <el-checkbox v-for="el in data.authority.operates" :key="data.name + '-' + el.name" :label="el.name"> {{ el.label }} </el-checkbox>
              </el-checkbox-group>
            </span>
          </span>
        </el-tree>
      </bv-scrollbar>
      <div slot="footer">
        <bv-button view="save" @click="saveGrant">保存</bv-button>
        <bv-button view="cancel" @click="cancelGrant">取消</bv-button>
      </div>
    </bv-dialog>
  </div>
</template>

<script>
  // import Vue from 'vue'
  // import i18n from '@/lang'
  // import { asyncRoutes, constantRoutes } from '@/router'
  import { fetchRoutes } from '@/api/authority'
  import { fetchRoles, createRole, modifyRole, removeRoles, fetchRoleRoutes, saveRoleRoutes } from '@/api/authority/role'
  // import { initRoutes, initRoutesId } from '@bestvike/utils/lib/route'
  import { collapseTree, setCheckedKeys } from '@bestvike/utils/lib/element'

  export default {
    name: 'ListRole',
    data() {
      return {
        filter: {},
        dialogFormVisible: false,
        dialogGrantVisible: false,
        modifyType: null,
        item: {},
        // 授权用
        routes: [],
        // 字典
        roleStatusOptions: null,
        // authorityRoutes: [],

        tableInstance: {},

        fetchRoles,

        rules: {
          id: [
            {required: true, message: '请输入角色代码', trigger: 'blur'}
          ],
          name: [
            {required: true, message: '请输入角色名称', trigger: 'blur'}
          ]
        },

        initRoutes: []
      }
    },
    async created() {
      /*const asyncRoutes = this.$store.getters.asyncRoutes
      this.__initRoutes = initRoutesId([...asyncRoutes].filter((route) => {
        return !route.hidden && route.meta
      }))*/
      // this.routes = [...this.__initRoutes]
      // this.fetchData()
      if (!this.routes || this.routes.length === 0) {
        const { data } = await fetchRoutes()
        this.initRoutes = data
      }
      this.$store.dispatch('app/fetchDicts', 'roleStatus').then(data => {
        this.roleStatusOptions = data
      }).catch(() => {})
    },
    methods: {
      selectableCheckBox(row){
        return row.contactDeptName == null
      },
      // 弹窗用
      initRole() {
        this.item = {}
      },
      startCreate() {
        this.dialogFormVisible = true
        this.modifyType = 'create'
        this.routes = [...this.initRoutes]
        this.$nextTick(() => {
          // 展开全部节点
          collapseTree(this.$refs.formTree, true)
        })
        // this.$refs.dialogForm && this.$refs.dialogForm.resetFields()
      },
      startModify() {
        this.item = {...this.tableInstance.table.selection[0]}
        this.dialogFormVisible = true
        this.modifyType = 'modify'
        this.routes = [...this.initRoutes]
        this.$nextTick(() => {
          this.initRouteTree(this.$refs.formTree)
        })
        // this.$refs.dialogForm && this.$refs.dialogForm.resetFields()
      },
      resetModify() {
        this.dialogFormVisible = false
        this.modifyType = null
        this.$nextTick(() => {
          this.initRole()
          this.$refs.dialogForm && this.$refs.dialogForm.resetFields()
          this.$refs.formTree.setCheckedNodes([])
        })
      },
      confirmModify(event) {
        this.$refs.dialogForm.validate((valid) => {
          if (!valid) {
            return false
          }

          const loading = this.$loading(event)
          let routes = {}
          this.$refs.formTree.getCheckedNodes(false, true).forEach(node => {
            let operates = null
            if (node.meta && node.meta.operates && node.meta.operates.length > 0) {
              operates = [...node.meta.operates]
            }
            routes[node.id] = operates
          })
          this.item.routes = routes
          if (this.modifyType === 'modify') {
            let item = {...this.item}
            // delete item.permissions
            modifyRole(item).then(() => {
              this.tableInstance.table.clearSelection()
              this.afterModify()
              loading.close()
            }).catch(() => loading.close())
          } else {
            createRole(this.item).then(() => {
              this.afterModify()
              loading.close()
            }).catch(() => loading.close())
          }
        })
      },
      afterModify() {
        this.tableInstance.fetchData()
        this.resetModify()
        this.item.permissions = null
        this.$message({
          message: '保存成功',
          type: 'success'
        })
      },
      startRemove() {
        this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const loading = this.$loading()
          removeRoles(this.tableInstance.table.selection.map(item => item.id).join()).then(() => {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.tableInstance.fetchData()
            loading.close()
          }).catch(() => loading.close())
        }).catch(() => {
          /*this.$message({
            message: '取消删除',
            type: 'warning'
          })*/
        })
      },
      startGrant() {
        // 授权
        this.dialogGrantVisible = true
        this.routes = [...this.initRoutes]
        this.$nextTick(() => {
          this.initRouteTree(this.$refs.tree)
        })
      },
      // 保存授权
      saveGrant(event) {
        const loading = this.$loading(event)
        // 格式 [{route: 'xxx', operates: ['xxx', 'yyy', ...], urls: ['GET:xxx', 'POST:xxx', ...]}]
        // 调整格式为 {route: operates}
        let routes = {}
        this.$refs.tree.getCheckedNodes(false, true).forEach(node => {
          let operates = null
          if (node.meta && node.meta.operates && node.meta.operates.length > 0) {
            operates = [...node.meta.operates]
          }
          routes[node.id] = operates
        })
        saveRoleRoutes(this.tableInstance.table.selection[0].id, routes).then(() => {
          this.dialogGrantVisible = false
          // collapseTree(this.$refs.tree)
          this.$nextTick(() => {
            this.$refs.tree.setCheckedNodes([])
          })
          loading.close()
          this.$message({
            message: '授权成功',
            type: 'success'
          })
        }).catch(() => loading.close())
      },
      cancelGrant() {
        this.dialogGrantVisible = false;
        this.$nextTick(() => {
          // collapseTree(this.$refs.tree)
          this.$refs.tree.setCheckedNodes([])
        })

      },
      changeSelectAll(value, data) {
        if (value) {
          data.meta.operates = []
          data.authority.operates.forEach(operate => {
            data.meta.operates.push(operate.name)
          })
        } else {
          data.meta.operates = []
        }
      },
      changeSelect(values, data) {
        if (values && values.length === data.authority.operates.length) {
          data.isAllOperatesSelected__ = true
        } else {
          data.isAllOperatesSelected__ = false
        }
      },
      showLabel(data) {
        return this.$filters.translate(data.meta)
      },

      // 辅助函数
      isIndeterminate(data) {
        // data.meta
        return data.meta.operates.length > 0 && data.meta.operates.length < data.authority.operates.length
      },
      // 判断是否允许删除
      checkRemove() {
        /* && this.tableInstance.selection.every(item => item.grantUserCount === 0)*/
        return this.tableInstance && this.tableInstance.selection && this.tableInstance.selection.length > 0
      },
      initRouteTree($tree) {
        // 展开全部节点
        collapseTree($tree, true)
        fetchRoleRoutes(this.tableInstance.table.selection[0].id).then((res) => {
          $tree.store._getAllNodes().forEach((treeNode) => {
            if (treeNode.data && treeNode.data.authority && treeNode.data.authority.operates  && treeNode.data.authority.operates.length > 0) {
              treeNode.data.meta.operates = []
              this.$set(treeNode.data, 'isAllOperatesSelected__', false)
              // treeNode.data.isAllOperatesSelected__ = false
            }
          })

          let authorityRoutes = res.data
          if (authorityRoutes) {
            let routes = []
            for (let route in authorityRoutes) {
              const operates = authorityRoutes[route]
              routes.push(route)

              const treeNode = $tree.getNode(route)
              // this.$set(treeNode.data, 'isAllOperatesSelected__', false)
              if (operates && operates.length > 0) {
                // 按钮权限
                if (treeNode && treeNode.data && treeNode.data.authority && treeNode.data.authority.operates  && treeNode.data.authority.operates.length > 0) {
                  treeNode.data.meta.operates = operates
                  if (treeNode.data.authority.operates.length === operates.length) {
                    treeNode.data.isAllOperatesSelected__ = true
                  }
                }
              } else {
                treeNode.data.meta.operates = []
                treeNode.data.isAllOperatesSelected__ = false
              }
            }
            this.$nextTick(() => {
              let checkedKeys = []
              for (let route of routes) {
                let treeNode = $tree.getNode(route)
                if (treeNode.isLeaf) {
                  checkedKeys.push(route)
                }
              }
              setCheckedKeys($tree, checkedKeys)
            })
          } else {
            this.$nextTick(() => {
              $tree.setCheckedKeys([])
            })
          }
        })
      }
      /*deleteShow() {
        if (!this.tableInstance || !this.tableInstance.selection || this.tableInstance.selection.length === 0) {
          return false
        }
        const selection = this.tableInstance.selection
        removeShow(selection.map(item => item.id).join()).then((response) => {
          if (response.data == -1) {
            //直接return存在作用域问题
            //存在用户授予该角色，不显示删除按钮
            this.testShow =  false
          } else {
            this.testShow = true
          }
        })
        return true
      }*/
    }
  }
</script>
<style lang="scss" scoped>
  .bv-table /deep/ .el-pagination{
    display: none;
  }
</style>
