<template>
  <el-row type="flex" class="fit-scroll">
    <el-col :sm="6">
      <bv-scrollbar>
        <bv-tree ref="tree" :data="items" node-key="id" :props="{label: 'name'}" :default-expand-all="true" @current-change="changeSelect" />
      </bv-scrollbar>
    </el-col>
    <el-col :sm="18">
      <bv-scrollbar>
        <bv-table ref="table" title="用户一览" :pagination="false" :filter.sync="filter" :fetch-api="fetchUser" style="padding-bottom: 20px" @on-mounted="(table) => tableInstance = table">
          <div slot="operates">
            <bv-button show="none" view="create" @click="startCreate()">新增</bv-button>
            <bv-button show="one" view="modify" @click="startModify()">修改</bv-button>
            <bv-button v-show="resetPassShow()" view="remove" @click="resetPass()">重置密码</bv-button>
            <bv-button show="oneOrMore" view="remove" @click="startRemove()">删除</bv-button>
          </div>
         <!-- <div slot="search">
            <bv-col>
              <bv-form-item label="用户姓名" prop="name">
                <el-input v-model="filter.name" />
              </bv-form-item>
            </bv-col>
          </div>-->
          <bv-table-column type="selection" />
          <bv-table-column label="用户编号" prop="empId" sortable="custom" align="center" />
          <!--<bv-table-column label="用户登录名" prop="avatar" align="center" sortable="custom" />-->
          <bv-table-column label="用户姓名" prop="name" sortable="custom" class-name="with-image" align="center" >
            <template slot-scope="scope">
              <el-avatar :size="30" :src="scope.row.avatar ? $APP_ROOT + '/file/view/' + scope.row.avatar : defaultAvatar">
                <img :src="defaultAvatar">
              </el-avatar>
              <div>{{ scope.row.name }}</div>
            </template>
          </bv-table-column>
          <!--<bv-table-column label="所属部门" prop="deptName" align="center" />-->
          <bv-table-column prop="grants" label="是否为管理员" align="center" >
            <template slot-scope="scope">{{isAdmin(scope.row.grants)}}</template>
          </bv-table-column>
          <bv-table-column prop="grade" label="是否为评委" align="center" >
            <template slot-scope="scope">{{isJury(scope.row.grants)}}</template>
          </bv-table-column>
        </bv-table>
      </bv-scrollbar>
      <bv-dialog title="维护用户信息" :visible.sync="dialogFormVisible" @close="cancelModify">
        <bv-form ref="dialogForm" :model="user" :rules="rules">
          <bv-row layout="dialog-2">
            <!--<bv-col>
              <bv-form-item label="用户登录名" prop="id">
                <el-input v-model="user.avatar" />
              </bv-form-item>
            </bv-col>
            <bv-col>
              <bv-form-item label="用户编号" prop="empId">
                <el-input v-if="modifyType === 'create'" v-model.trim="user.empId" />
                <span v-else v-text="user.empId" />
              </bv-form-item>
            </bv-col>-->
            <bv-col v-if="creatDisabled">
              <bv-form-item label="员工姓名" prop="empId">
                <bv-select v-model="user.empId" code="id" text="name" :items="employees" filterable @change="onNameChange" />
              </bv-form-item>
            </bv-col>
            <bv-col v-if="modifyDisabled">
              <bv-form-item label="员工姓名" prop="empId">
                <el-input v-text="user.name" />
              </bv-form-item>
            </bv-col>
            <bv-col v-if="modifyDisabled">
              <bv-form-item label="所属部门" prop="deptName">
                <el-input v-text="user.deptName" />
              </bv-form-item>
            </bv-col>
            <bv-col layout="100%">
              <bv-form-item label="角色" prop="grants">
                <bv-checkbox-group code="id" text="name" :items="roles" v-model="user.grants" />
              </bv-form-item>
            </bv-col>
          </bv-row>
        </bv-form>
        <div slot="footer">
          <bv-button view="save" @click="confirmModify()">保存</bv-button>
          <bv-button view="cancel" @click="cancelModify()">取消</bv-button>
        </div>
      </bv-dialog>
    </el-col>
  </el-row>
</template>

<script>
import { Avatar } from 'element-ui'
import { fetchDepartments } from '@/api/manage/department'
import { fetchEmployeesByDeptId } from '@/api/manage/employee'
import { fetchAllRoles } from '@/api/authority/role'
import { fetchUsers, createUser, modifyUser, removeUsers, resetPass } from '@/api/authority/user'
import defaultAvatar from '@/assets/avatar.png'

export default {
  name: 'ListUser',
  components: {
    ElAvatar: Avatar
  },
  data() {
    return {
      items: [],
      currentDeptId: null,
      modifyType: null,
      employees: [],
      // 过滤条件
      filter: {},
      dialogFormVisible: false,
      modifyDisabled:false,
      creatDisabled:false,
      user: {
        empId:'',
        grants:''
      },
      rules: {
        empId:[
          { required: true, message: '请选择用户姓名' }
        ],
        grants:[
          { required: true, message: '请选择用户角色' }
        ]
      },
      // 授权用
      roles: [],
      grants: [],
      tableInstance: {},
      fetchUsers,
      defaultAvatar
    }
  },
  created() {
    this.fetchTreeData();
    fetchAllRoles().then(res => {
      this.roles = res.data
      /*let roles = response.data.roles
      for (let i in roles) {
        this.roles.push({
          key: roles[i].id,
          label: roles[i].name,
          disabled: false
        })
      }*/
    }).catch(() => {})
  },
  methods: {
    fetchUser(data) {
      fetchEmployeesByDeptId(data).then(res => {
        this.employees = res.data
      }).catch(() => {});
      return this.fetchUsers(data);
    },
    fetchTreeData() {
      fetchDepartments().then(res => {
        this.items = [
          {
            id: 'root',
            name: '部门一览',
            children: res.data
          }
        ]
      }).catch(() => {})
    },
    changeSelect(data, node) {
      if (node.level === 1) {
        // 全部
        this.currentDeptId = null;
        this.$refs.table.initParam({});
        this.$refs.table.fetchData()
      } else {
        this.currentDeptId = data.id;
        let params = {
          deptId: data.id
        };
        this.$refs.table.initParam(params);
        this.$refs.table.fetchData()
      }
    },
    onNameChange(value) {
      if (value) {
        const employee = this.employees.find(employee => employee.id === value);
        this.user.name = employee.name
        this.user.deptId = employee.deptId
        this.user.deptName = employee.deptName
      }
    },
    resetPassShow() {
      if (!this.tableInstance || !this.tableInstance.selection || this.tableInstance.selection.length !== 1) {
        return false
      }
      return this.tableInstance.selection[0].empId != 'admin'
    },
    // 弹窗用
    initUser() {
      this.user ={
        id: null,
        // avatar: null,
        deptId: this.currentDeptId,
        name: null,
        grants: []
      }
    },
    startCreate() {
      this.dialogFormVisible = true;
      this.modifyType = 'create';
      this.initUser();
      this.creatDisabled = true;
      this.modifyDisabled = false;
    },
    startModify() {
      this.user = {...this.tableInstance.table.selection[0]};
      this.dialogFormVisible = true;
      this.modifyType = 'modify';
      this.creatDisabled = false;
      this.modifyDisabled = true;
      console.log(this.modifyDisabled);
    },
    cancelModify() {
      this.initUser();
      this.dialogFormVisible = false;
      this.creatDisabled = false;
      this.modifyDisabled = false;
      /*//清除数据
      this.$refs.user.resetFields();*/
      this.$nextTick(() => {
        this.$refs.dialogForm && this.$refs.dialogForm.clearValidate()
      })
    },
    confirmModify() {
      this.$refs.dialogForm.validate((valid) => {
        if (!valid) {
          return false
        }
        if (this.modifyType === 'modify') {
          modifyUser(this.user).then(() => {
            this.$refs.table.clearSelection()
            this.afterModify()
          })
        } else {
          createUser(this.user).then(() => {
            this.afterModify()
          })
        }
      })
    },
    afterModify() {
      this.tableInstance.fetchData()
      this.initUser()
      this.dialogFormVisible = false
      this.$nextTick(() => {
          this.$refs.dialogForm && this.$refs.dialogForm.clearValidate()
        })
      this.$message({
        message: '保存成功',
        type: 'success'
      })
    },
    startRemove() {
      this.$confirm('此操作将删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeUsers(this.$refs.table.selection.map(item => item.id).join()).then(() => {
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          this.$refs.table.fetchData()
        })
      }).catch(() => {
        /*this.$message({
          message: '取消删除',
          type: 'warning'
        })*/
      })
    },
    resetPass() {
      this.$confirm('确定要将该用户的密码重置吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetPass(this.tableInstance.table.selection[0].id).then(() => {
          this.tableInstance.fetchData();
          this.$message({
            message: '重置密码成功',
            type: 'success'
          })
        })
      })
    },
    isAdmin(data){
      if(data==null){
        return '否';
      } else {
        for(var i=0;i<data.length;i++){
          if(data[i]=='0000'){
            return '是';
          }
        }
        return '否';
      }
    },
    isJury(data){
      if(data==null){
        return '否';
      } else {
        for(var i=0;i<data.length;i++){
          if(data[i]=='0002' || data[i]=='0010' ||data[i]=='0011'||data[i]=='0012'){
            return '是';
          }
        }
        return '否';
      }
    }
  }
}
</script>
<style lang="scss">
.el-table {
  .with-image {
    > .cell {
      display: flex;
      line-height: 30px;

      > img {
        max-width: 30px;
        height: 30px;
      }
      > div {
        margin-left: 5px;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
  .bv-table /deep/ .el-pagination{
    display: none;
  }
</style>
