<template>
  <el-row type="flex" class="fit-scroll">
    <el-col :sm="6">
      <bv-scrollbar>
        <bv-tree ref="tree" :data="items" node-key="id" :props="{label: 'name'}" :default-expand-all="true" @current-change="changeSelect" />
      </bv-scrollbar>
    </el-col>
    <el-col :sm="18">
      <bv-scrollbar>
        <bv-table
          ref="table"
          title="人员一览"
          :pagination="false"
          style="padding-bottom: 20px"
          :fetch-api="fetchEmployees"
          class="empInfo-table"
        >
          <div slot="operates">
            <!--<bv-button type="success" @click="empExcelDownload">模板下载</bv-button>-->
            <bv-button view="import" type="primary" @click="insertData">导入数据</bv-button>
            <bv-button show="none" view="create" @click="startCreate()">新增</bv-button>
            <bv-button show="one" view="modify" @click="startModify()">修改</bv-button>
            <bv-button show="oneOrMore" view="remove" @click="startRemove()">删除</bv-button>
          </div>
          <bv-table-column type="selection" />
          <!--<bv-table-column label="所属部门" prop="deptName" align="center" />-->
          <bv-table-column label="员工姓名" prop="name" align="center" />
          <bv-table-column label="级别" prop="grade" align="center" >
            <template slot-scope="scope">{{ getGrade(scope.row.grade) }}</template>
          </bv-table-column>
          <bv-table-column label="岗位" prop="postName" align="center" />
          <bv-table-column label="是否参与评分" prop="needScore" align="center" >
            <template slot-scope="scope">{{ scope.row.needScore=='1'?'是':'否' }}</template>
          </bv-table-column>
          <bv-table-column label="状态" prop="status" align="center" >
            <template slot-scope="scope">{{ getStatus(scope.row.status) }}</template>
          </bv-table-column>
        </bv-table>

        <bv-dialog title="员工维护" :visible.sync="dialogFormVisible">
          <bv-form ref="dialogForm" :model="item" :rules="rules">
            <bv-row layout="dialog-2">
              <bv-col>
                <bv-form-item label="员工姓名" prop="name">
                  <el-input v-model.trim="item.name" style="width: 108%" />
                  <!--<el-input v-if="modifyType === 'create'" v-model.trim="item.name" style="width: 108%"/>
                  <span v-else v-text="item.name" />-->
                </bv-form-item>
              </bv-col>
              <bv-col>
                <bv-form-item label="员工级别" prop="grade">
                  <el-select v-model="item.grade" placeholder="请选择级别" clearable @change="changeGrade()">
                    <el-option v-for="item in employeeGradeOptions" :key="item.code" :label="item.name" :value="item.code" >
                    </el-option>
                  </el-select>
                </bv-form-item>
              </bv-col>
              <bv-col>
                <bv-form-item label="部门" prop="deptId">
                  <el-select v-model="item.deptId" placeholder="请选择部门" clearable @change="changeDept()" >
                    <el-option v-for="dept in deptData" :key="dept.id" :label="dept.name" :value="dept.id" >
                    </el-option>
                  </el-select>
                </bv-form-item>
              </bv-col>
              <bv-col>
                <bv-form-item label="岗位" prop="postCode">
                  <el-select v-model="item.postCode" placeholder="请选择岗位" clearable @change="changePost()">
                    <el-option v-for="post in postOptions" :key="post.code" :label="post.name" :value="post.code" >
                    </el-option>
                  </el-select>
                </bv-form-item>
              </bv-col>
              <bv-col>
                <el-form-item label="参与评分" prop="needScore">
                  <el-radio v-model="item.needScore" label="1">是</el-radio>
                  <el-radio v-model="item.needScore" label="0">否</el-radio>
                </el-form-item>
              </bv-col>
              <bv-col>
                <bv-form-item label="状态" prop="status">
                  <el-select v-model="item.status" placeholder="请选择状态" clearable>
                    <el-option v-for="dept in employeeStatusOptions" :key="dept.code" :label="dept.name" :value="dept.code" >
                    </el-option>
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
      </bv-scrollbar>
    </el-col>
    <el-dialog title="员工信息导入" :visible.sync="importDialog" :close-on-click-modal="false" :close-on-press-escape="false" width="30%">
      <el-upload
        ref="uploadFile"
        class="upload-empInfo"
        drag
        accept=".xls,.xlsx"
        :action="upload_url"
        :auto-upload="false"
        :on-change="demo2Change"
        :file-list="fileList"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">只能上传xls/xlsx文件</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <bv-button size="small" type="success" @click="submitUpload">上传并导入</bv-button>
        <bv-button size="small" type="success" @click="empExcelDownload">模板下载</bv-button>
        <bv-button @click="importDialog = false">取 消</bv-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
  import { fetchDepartments, fetchAllDepartments } from '@/api/manage/department'
  import { fetchEmployees, downloadTemplate, createEmployee, modifyEmployee, removeEmployees, importEmpInfo } from '@/api/manage/employee'
  import { fetchPostsAll } from '@/api/manage/post'
  const maxFileSize = 20;
  export default {
    name: 'ListEmployee',
    data() {
      return {
        fetchEmployees,
        items: [],
        deptData:[],
        deptDataAll:[],
        postOptions:[],
        postOptionAll:[],
        importDialog:false,
        dialogFormVisible: false,
        currentDeptId: null,
        item: {},
        modifyType: '',
        employeeGradeOptions:[
          {
          code:'0',
          name:'主任'
        },{
          code:'1',
          name:'副主任'
        },{
          code:'2',
          name:'处长'
        },{
          code:'3',
          name:'副处长'
        }, {
            code: '4',
            name: '员工'
          }
          ],
        employeeGradeOptionAll:[
          {
          code:'0',
          name:'主任'
        },{
          code:'1',
          name:'副主任'
        },{
          code:'2',
          name:'处长'
        },{
          code:'3',
          name:'副处长'
        }, {
          code: '4',
          name: '员工'
        }
        ],
        /*employeeStatusOptions:[],*/
        employeeStatusOptions:[
          {
          code:'0000',
          name:'正常'
        },{
          code:'9999',
          name:'离职'
        },{
          code:'9000',
          name:'调走'
        }, {
            code: '1000',
            name: '休假'
          }
          ],
        rules: {
          name: [
            { required: true, message: '请输入员工姓名', trigger: 'blur' }
          ],
          grade: [
            { required: true, message: '请选择员工级别', trigger: 'blur' }
          ],
          deptId: [
            { required: true, message: '请选择部门', trigger: 'blur' }
          ],
          postCode: [
            { required: true, message: '请输入员工岗级', trigger: 'blur' }
          ],
          needScore:[
            { required: true, message: '请选择是否参与评分', trigger: 'blur' }
          ],
          status:[
            { required: true, message: '请选择员工状态', trigger: 'blur' }
          ]
        },
        //导入数据
        fileList: [],
        upload_url: 'url',
      }
    },
    created() {
      /*this.$store.dispatch('app/fetchDicts','employeeGrade').then(data => {
        this.employeeGradeOptions = data;
        this.employeeGradeOptionAll = data;
      }).catch(() => {});*/
      /*this.$store.dispatch('app/fetchDicts', 'employeeStatus').then(data => {
        this.employeeStatusOptions = data;
      }).catch(() => {});*/
      this.fetchTreeData();
      this.getDeptInfo();
      this.getPostOptions();
    },
    methods: {
      getPostOptions(){
        fetchPostsAll().then(response => {
          this.postOptions = response.data;
          this.postOptionAll = response.data;
        })
      },
      fetchTreeData() {
        fetchDepartments().then((res) => {
          this.items = [
            {
              id: 'root',
              name: '部门一览',
              children: res.data
            }
          ]
        })
      },
      getDeptInfo(){
        fetchAllDepartments().then(response=>{
          this.deptData = response.data;
          this.deptDataAll = response.data;
        })
      },
      // 部门进行选择时
      changeSelect(data, node) {
        if (node.level === 1) {
          // 全部
          this.currentDeptId = null;
          this.$refs.table.initParam({});
          this.$refs.table.fetchData();
          this.getEmployeeGradeOptionAll();
        } else {
          if (node.level === 2) {
            this.getEmployeeGradeOptionAll();
          } else {
            this.getEmployeeGradeOptionFilter();
          }
          this.currentDeptId = data.id;
          let params = {
            deptId: data.id
          };
          this.$refs.table.initParam(params);
          this.$refs.table.fetchData();
        }
      },
      // 新增、修改弹窗部门下拉框选项变化
      changeDept() {
        let deptId = this.item.deptId;
        // console.log(deptId);
        let dept;
        for (var i = 0; i < this.deptData.length; i++) {
          let deptTemp = this.deptData[i];
          if (deptTemp.id == deptId) {
            dept = deptTemp;
          }
        }
        if (dept != null && dept != '') {
          let grade = dept.grade;
          if (grade === 0) {
            this.getEmployeeGradeOptionAll();
          } else {
            this.getEmployeeGradeOptionFilter();
          }
        } else {
          this.getEmployeeGradeOptionAll();
        }
      },
      // 新增、修改弹窗员工级别下拉框选项变化
      changeGrade(){
        let grade = this.item.grade;
        if(grade != null && grade != '') {
          if (grade == 0 || grade == 1) {
            this.getDeptInfoOptionFilter();
          } else {
            this.getDeptInfoOptionAll();
          }
        } else {
          this.getDeptInfoOptionAll();
        }
      },
      changePost(){
        let code = this.item.postCode;
        let post = this.postOptions.filter(t=>t.code === code);

        if(post != null && post != ''){
          let name = post[0].name;
          if(name == '主任' || name == '副主任') {
            this.getDeptInfoOptionFilter();
          } else {
            this.getDeptInfoOptionAll();
          }
        } else {
          this.getDeptInfoOptionAll();
        }
      },
      initItem() {
        this.item = {
          deptId: this.currentDeptId
        }
      },
      // 重置一级部门所对应员工级别和岗级
      getEmployeeGradeOptionAll(){
        this.employeeGradeOptions = this.employeeGradeOptionAll;
        this.postOptions = this.postOptionAll;
      },
      // 二级部门进行筛选所对应员工级别和岗级
      getEmployeeGradeOptionFilter() {
        this.employeeGradeOptions = this.employeeGradeOptions.filter(t => t.code > 1);
        this.postOptions = this.postOptions.filter(t => t.name != '主任' && t.name != '副主任');
      },
      // 重置新增修改下拉框选项为所有部门信息
      getDeptInfoOptionAll() {
        this.deptData = this.deptDataAll;
      },
      // 筛选二级部门
      getDeptInfoOptionFilter(){
        this.deptData = this.deptData.filter(t => t.grade === 0)
      },
      startCreate() {
        this.initItem();
        this.dialogFormVisible = true;
        this.modifyType = 'create'
        // this.$refs.dialogForm && this.$refs.dialogForm.clearValidate()
      },
      startModify() {
        this.item = {...this.$refs.table.selection[0]};
        this.dialogFormVisible = true;
        this.modifyType = 'modify'
        // this.$refs.dialogForm && this.$refs.dialogForm.clearValidate()
      },
      cancelModify() {
        this.getDeptInfoOptionAll();
        this.getEmployeeGradeOptionAll();
        this.dialogFormVisible = false;
        this.modifyType = null;
        this.$nextTick(() => {
          this.initItem();
          this.$refs.dialogForm && this.$refs.dialogForm.clearValidate()
        })
      },
      confirmModify() {
        this.$refs.dialogForm.validate((valid) => {
          if (!valid) {
            return false
          }
          if (this.modifyType === 'modify') {
            modifyEmployee(this.item).then(() => {
              this.$refs.table.clearSelection();
              this.afterModify()
            })
          } else {
            createEmployee(this.item).then(() => {
              this.afterModify()
            })
          }
        })
      },
      afterModify() {
        this.$refs.table.fetchData();
        this.initItem();
        this.dialogFormVisible = false;
        this.modifyType = null;
        this.$message({
          message: '保存成功',
          type: 'success'
        })
      },
      startRemove() {
        this.$confirm('此操作将删除该员工, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let selection = this.$refs.table.selection;
          removeEmployees(selection.map(item => item.id).join()).then(() => {
            this.$refs.table.fetchData();
            this.$message({
              message: '删除成功',
              type: 'success'
            })
          })
        }).catch(() => {
        })
      },
      // 格式化员工岗级
      getGrade(data){
        for(let i=0;i<this.employeeGradeOptions.length;i++){
          let option = this.employeeGradeOptions[i];
          if(option.code == data){
            return option.name;
          }
        }
        return '无';
        /*if(data=='0000'){
          return '正常';
        } else if(data=='1000'){
          return '休假';
        } else if(data=='9000'){
          return '调走';
        } else if(data=='9999'){
          return '离职';
        } else {
          return '无';
        }*/
      },
      /*格式化员工状态*/
      getStatus(data){
        for(let i=0;i<this.employeeStatusOptions.length;i++){
          let option = this.employeeStatusOptions[i];
          if(option.code == data){
            return option.name;
          }
        }
        return '无';
      },
      // 导入信息
      insertData(){
        // 清除上传文件
        if(this.$refs.uploadFile != undefined){
          this.$refs.uploadFile.clearFiles()
        }
        this.importDialog=true;
      },
      demo2Change(file, fileList) {
        let isLt = file.size / 1024 / 1024 < 20;
        if (!isLt) {
          this.$message.error('上传文件大小不能超过' + maxFileSize + 'MB!');
          this.fileList = fileList.slice(1, 1);
          return;
        }
        this.fileList = fileList.slice(-1);
      },
      // 下载导入模板
      empExcelDownload() {
        var data = {};
        data.fileName = 'empInfo_import.xlsx';
        downloadTemplate(data).then(res => {
          let blob = new Blob([res.data]);
          let url = this.getObjectURL(blob);
          let link = document.createElement('a');
          link.style.display = 'none';
          link.href = url;
          // 获取文件名
          link.download = '员工导入模板.xlsx';
          document.body.appendChild(link);
          link.click();
          URL.revokeObjectURL(link.href);
        });
      },
      // 导入模板辅助方法
      getObjectURL(file) {
        let url = null;
        if (window.createObjectURL !== undefined) {
          url = window.createObjectURL(file);
        } else if (window.webkitURL !== undefined) {
          url = window.webkitURL.createObjectURL(file);
        } else if (window.URL !== undefined) {
          url = window.URL.createObjectURL(file);
        }
        return url;
      },
      // 上传并导入
      submitUpload(){
        let path = '\\account';
        let verifyType = true;
        let isHaveFiles = false;
        let file = [];
        let fileSource = [];
        if (this.$refs.uploadFile.uploadFiles.length > 0) {
          isHaveFiles = true;
          //验证上传文件类型
          let fileName = this.$refs.uploadFile.uploadFiles[0].raw.name;
          let arrFileName = fileName.split('.');
          if (arrFileName[arrFileName.length - 1] !== 'xls'
            && arrFileName[arrFileName.length - 1] !== 'xlsx') {
            this.$message({
              message: '请导入xls或slsx文件',
              type: 'warning'
            });
            verifyType = false;
            return;
          }
          if(verifyType) {
            file.push(this.$refs.uploadFile.uploadFiles[0].raw);
            fileSource.push("员工信息数据文件");
          }
        }

        // 没有上传文件时
        if (!isHaveFiles) {
          this.$message({
            type: 'warning',
            message: '请至少上传1个文件!'
          });
          return;
        }
        //传递当前用户id  ==  manageUser
        let data = {
          fileSource: fileSource,
          manageUser: 'admin',
          path: path
        };
        // 隐藏版本弹窗
        this.importDialog = false;
        importEmpInfo(file, data).then(ret => {
          //清除上传的文件
          this.$refs.uploadFile.clearFiles();
          if (ret.data.retCode === '0000') {
            this.$message({
              type: ret.data.level,
              message: ret.data.retMsg
            });
            //刷新页面
            this.$refs.table.fetchData();
          } else {
            this.$message({
              type: ret.data.level,
              message: ret.data.retMsg
            });
          }
        }).catch(() => {
          console.log('上传失败')
          this.$refs.uploadFile.clearFiles()
        });
      },
    }
  }
</script>
<style lang="scss" scoped>
  .bv-table /deep/ .el-pagination{
    display: none;
  }
</style>
<style scoped>
  .empInfo-table>>>.has-gutter{
    font-size: 15px;
    font-weight: 600;
  }
  .upload-empInfo>>>.el-upload.el-upload--text {
    width: 100%;
  }
  .upload-empInfo>>>.el-upload-dragger {
    width: 100%;
  }
</style>
