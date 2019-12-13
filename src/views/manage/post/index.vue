<template>
  <div class="app-container">
    <bv-table title="岗位一览" :pagination="false" :filter.sync="filter" :fetch-api="fetchPosts" style="padding-bottom: 20px" @on-mounted="(table) => tableInstance = table">
      <div slot="operates">
        <bv-button show="none" view="create" authority="create" @click="startCreate()">新增</bv-button>
        <bv-button show="one" view="modify" authority="modify" @click="startModify()">修改</bv-button>
        <bv-button show="oneOrMore" view="remove" authority="remove" @click="startRemove()">删除</bv-button>
      </div>
      <div slot="search" class="search">
        <bv-col>
          <bv-form-item label="岗位名称" prop="name">
            <el-input v-model="filter.name" />
          </bv-form-item>
        </bv-col>
      </div>
      <bv-table-column type="selection" />
      <bv-table-column label="岗位代码" prop="code" align="center" sortable />
      <bv-table-column label="岗位名称" prop="name" align="center" />
      <bv-table-column label="岗位状态" prop="status" align="center" >
        <template slot-scope="scope">{{ getStatus(scope.row.status) }}</template>
      </bv-table-column>
    </bv-table>

    <bv-dialog title="岗位维护" :visible.sync="dialogPostVisible" @close="cancelModify">
      <bv-form ref="dialogPostForm" :model="post" :rules="rules">
        <bv-row layout="dialog-2">
          <bv-col>
            <bv-form-item label="岗位代码" prop="code">
              <el-input v-if="modifyType === 'create'" v-model.trim="post.code" />
              <span v-else v-text="post.code" />
            </bv-form-item>
          </bv-col>
          <bv-col>
            <bv-form-item label="岗位名称" prop="name">
              <el-input v-model.trim="post.name" />
            </bv-form-item>
          </bv-col>
          <bv-col>
            <bv-form-item label="状态" prop="status">
              <el-select v-model="post.status" placeholder="请选择岗位状态" style="width: 93%" clearable >
                <el-option v-for="(item) in statusOption" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </bv-form-item>
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
  import { fetchPosts, creatPost, modifyPost, removePost} from '@/api/manage/post'

  export default {
    name: 'ListPost',
    data() {
      return {
        fetchPosts,
        filter: {},
        dialogPostVisible: false,
        modifyType: null,
        post: {},
        tableInstance: {},
        statusOption:[
          {
            value:'0000',
            label:'正常'
          },
          {
            value:'9999',
            label:'停用'
          },
        ],
        rules: {
          code: [
            {required: true, message: '请输入角色代码', trigger: 'blur'},
            { min: 1, max: 4 , message: '长度必须小于4个字', trigger: 'blur' }
          ],
          name: [
            {required: true, message: '请输入角色名称', trigger: 'blur'},
            { min: 1, max: 10, message: '长度必须小于10个字', trigger: 'blur' }
          ]
        },
      }
    },
    created() {
    },
    methods: {
      startCreate(){
        this.dialogPostVisible = true;
        this.modifyType = 'create';
      },
      startModify() {
        this.post = {...this.tableInstance.table.selection[0]};
        this.dialogPostVisible = true;
        this.modifyType = 'modify'
      },
      confirmModify(){
        this.$refs.dialogPostForm.validate((valid) =>{
          if(!valid){
            return false;
          } else {
            if(this.modifyType === 'create') {
              let post = {...this.post};
              creatPost(post).then(()=>{
                this.afterModify();
              })
            } else if(this.modifyType === 'modify'){
              let post = {...this.post};
              modifyPost(post).then(()=>{
                this.tableInstance.table.clearSelection();
                this.afterModify();
              })
            }
          }
        })
      },
      afterModify() {
        this.tableInstance.fetchData();
        this.post = {};
        this.dialogPostVisible = false;
        this.modifyType = null;
        this.$message({
          message: '保存成功',
          type: 'success'
        })
      },
      cancelModify() {
        this.dialogPostVisible = false;
        this.post = {};
      },
      startRemove(){
        this.$confirm('此操作将删除该部门, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          removePost(this.tableInstance.selection.map(post => post.code).join()).then(res => {
            this.$message({
              message: res.data.msg,
              type: res.data.type,
            });
            this.tableInstance.fetchData();
            this.tableInstance.table.selection.pop();
          })
        }).catch(() => {})
      },
      getStatus(data){
        if(data=='0000'){
          return '正常';
        } else if(data=='9999'){
          return '停用';
        }
      }
    }
  }
</script>
<style lang="scss" scoped>
  .bv-table /deep/ .el-pagination{
    display: none;
  }
</style>
