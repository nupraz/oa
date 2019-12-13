<template>
  <div>
    <bv-table
      ref="table"
      title="部门一览"
      row-key="id"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      :fetch-api="fetchDepartments"
    >
      <bv-table-column type="selection" />
      <bv-table-column label="部门编号" prop="id" align="center" width="100" />
      <bv-table-column label="部门级别" prop="grade" align="center" >
        <template slot-scope="scope">{{getScope(scope.row.grade)}}</template>
      </bv-table-column>
      <bv-table-column label="部门名称" prop="name" />
      <bv-table-column label="分管领导" prop="leader" />
      <bv-table-column label="系统内考核" prop="needAssessment" >
        <template slot-scope="scope">{{ scope.row.needAssessment=='1'?'是':'否' }}</template>
      </bv-table-column>
      <div slot="operates">
        <bv-button show="none" view="create" authority="createone" @click="createGrade0()">新增顶级部门</bv-button>
        <bv-button :show="isAllowCreate" view="create" authority="createtwo" @click="createGrade1()">新增二级部门</bv-button>
        <bv-button show="one" view="modify" authority="modify" @click="startModify()">修改</bv-button>
        <bv-button show="oneOrMore" view="remove" authority="remove" @click="startRemove()">删除</bv-button>
      </div>
    </bv-table>

    <bv-dialog title="部门维护" :visible.sync="dialogFormVisible">
      <bv-form ref="dialogForm" :model="item" :rules="rules">
        <bv-row layout="dialog-2">
          <bv-col>
            <el-form-item label="部门编号" prop="id">
              <el-input v-if="modifyType === 'create'" v-model.trim="item.id" />
              <span v-else v-text="item.id" />
            </el-form-item>
          </bv-col>
          <bv-col>
            <el-form-item label="部门名称" prop="name">
              <el-input v-model.trim="item.name" />
            </el-form-item>
          </bv-col>
        </bv-row>
        <bv-row layout="dialog-2">
          <bv-col>
            <el-form-item label="分管领导" prop="leader">
              <el-select v-model="item.leader" placeholder="请选择分管领导" clearable style="width: 93%">
                <el-option v-for="(empInfo) in empData" :key="empInfo.id" :label="empInfo.name" :value="empInfo.id" />
              </el-select>
            </el-form-item>
          </bv-col>
          <bv-col>
            <el-form-item label="系统内考核" prop="needAssessment">
              <el-radio v-model="item.needAssessment" label="1">是</el-radio>
              <el-radio v-model="item.needAssessment" label="0">否</el-radio>
            </el-form-item>
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
  import {  fetchDepartments, createDepartment, modifyDepartment, removeDepartments } from '@/api/manage/department'
  import { fetchAllEmployees } from '@/api/manage/employee'
  export default {
    name: 'ListDepartment',
    data() {
      return {
        fetchDepartments,
        modifyType: null,
        dialogFormVisible: false,
        item: {},
        empData:[],
        rules: {
          id: [
            { required: true, message: '请输入部门编号', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '请输入部门名称', trigger: 'blur' }
          ],
          needAssessment:[
            { required: true, message: '请选择是否需要系统内考核', trigger: 'blur' }
          ]
        }
      }
    },
    created(){
      //创建页面时获取全部员工数据
      this.getEmpData();
    },
    methods: {
      isAllowCreate(selection) {
        return selection && selection.length === 1 && selection[0].grade === 0
      },
      createGrade0() {
        this.item = {
          grade: 0
        };
        this.dialogFormVisible = true;
        this.modifyType = 'create';
      },
      createGrade1() {
        this.item = {
          grade: 1,
          parent: this.$refs.table.selection[0].id
        }
        this.dialogFormVisible = true
        this.modifyType = 'create'
      },
      startModify() {
        this.item = {...this.$refs.table.selection[0]}
        this.dialogFormVisible = true
        this.modifyType = 'modify'
      },
      confirmModify() {
        this.$refs.dialogForm.validate((valid) => {
          if (!valid) {
            return false
          }

          if (this.modifyType === 'modify') {
            let item = {...this.item}
            modifyDepartment(item).then(() => {
              this.$refs.table.clearSelection()
              this.afterModify()
            })
          } else {
            createDepartment(this.item).then(() => {
              this.afterModify()
            })
          }
        })
      },
      afterModify() {
        this.$refs.table.fetchData()
        this.item = {}
        this.dialogFormVisible = false
        this.modifyType = null
        this.$message({
          message: '保存成功',
          type: 'success'
        })
      },
      cancelModify() {
        this.dialogFormVisible = false
        this.modifyType = null
        this.$nextTick(() => {
          this.$refs.dialogForm && this.$refs.dialogForm.clearValidate()
        })
      },
      startRemove() {
        this.$confirm('此操作将删除该部门, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          removeDepartments(this.$refs.table.selection.map(item => item.id).join()).then(() => {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.$refs.table.fetchData()
          })
        }).catch(() => {})
      },
      getEmpData(){
        fetchAllEmployees().then(response=>{
          this.empData = response.data;
        })
      },
      getScope(data){
        if(data=='0'){
          return '一级部门';
        } else if(data=='1'){
          return '二级部门';
        }
      }
    }
  }
</script>
