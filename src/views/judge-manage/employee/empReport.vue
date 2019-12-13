<template>
  <div class="app-container">
    <bv-table ref="tableInit" title="员工考核上报" :pagination="false" :filter.sync="filter" :fetch-api="fetchEmpReport" style="padding-bottom: 20px" @on-mounted="(table) => tableInstance = table">
      <div slot="operates">
        <bv-button show="none" @click="calculation()">测算</bv-button>
        <bv-button show="none" @click="save()">上报</bv-button>
        <bv-button show="none" @click="exportEmpReport()">数据导出</bv-button>
        <bv-button show="one" view="modify"  @click="startModify()">修改</bv-button>
      </div>
      <div slot="search">
        <bv-col >
          <el-form-item label="日期" prop="assessMonth">
            <el-date-picker
              v-model="filter.assessMonth"
              type="month"
              placeholder="选择月份" value-format="yyyyMM" clearable>
            </el-date-picker>
          </el-form-item>
        </bv-col>
      </div>
      <bv-table-column type="selection" />
        <bv-table-column label="部门"  sortable="custom" prop="deptName" align="center" />
        <bv-table-column label="岗位" prop="postName" align="center" />
        <bv-table-column label="姓名" prop="empName" align="center" />
        <bv-table-column label="员工评分" prop="empScore" align="center" />
        <bv-table-column label="奖惩分" prop="rewardScore" align="center" />
        <bv-table-column label="最终得分" prop="score" align="center" />
        <bv-table-column label="备注(评分原因)" prop="assessRemark" align="center" />
    </bv-table>

    <bv-dialog title="考核分修改" :visible.sync="dialogPostVisible" @close="cancelModify">
      <bv-form ref="dialogPostForm" :model="report" :rules="rules">
        <bv-row layout="dialog-2">
          <bv-col>
            <bv-form-item label="员工评分" prop="empScore">
              <el-input type="number" v-model.trim="report.empScore" min="0" max="106"/>
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
  import { fetchEmpReportData, creatPost, modifyPost , submitEmpReportData ,exportEmpReportExcel ,empReportCalculation} from '@/api/report/statistic'
  export default {
    name: 'empReport',
    data() {
      const numberRef = (rule, value, callback) => {
        if (value < 0 || value >106) {
          callback(new Error('评分范围为0-106'))
        } else {
          callback()
        }
      }
      return {
        fetchEmpReportData,
        filter: {},
        dialogPostVisible: false,
        modifyType: null,
        report: {},
        tableInstance: {},
        rules: {
          empScore: [
            { required: true, trigger: 'blur', validator: numberRef}
          ]
        },
      }
    },
    created() {
    },
    methods: {
      fetchEmpReport(data){
        if(this.filter.assessMonth){
          data.assessMonth = this.filter.assessMonth
        }
        return this.fetchEmpReportData(data)
      },
      calculation(){
        let data ={
          "list":this.tableInstance.table.data
        }
        const loading = this.$loading()
        empReportCalculation(data.list).then(()=>{
          this.$refs.tableInit.fetchData()
          loading.close()
        }).catch(() => loading.close())
        // this.fetchEmpReport();
        // this.$router.go(0)
      },
      startCreate(){
        this.dialogPostVisible = true;
        this.modifyType = 'create';
      },
      startModify() {
        this.report = {...this.tableInstance.table.selection[0]};
        this.dialogPostVisible = true;
        this.modifyType = 'modify'
        this.fetchEmpReport()
      },
      confirmModify(){
        this.$refs.dialogPostForm.validate((valid) =>{
          if(!valid){
            return false;
          } else {
            if(this.modifyType === 'create') {
              let report = {...this.report};
              creatPost(report).then(()=>{
                this.afterModify();
              })
            } else if(this.modifyType === 'modify'){
              let report = {...this.report};
              modifyPost(report).then(()=>{
                this.tableInstance.table.clearSelection();
                this.afterModify();
              })
            }
          }
        })
      },
      afterModify() {
        this.tableInstance.fetchData();
        this.report = {};
        this.dialogPostVisible = false;
        this.modifyType = null;
        this.$message({
          message: '保存成功',
          type: 'success'
        })
      },
      cancelModify() {
        this.dialogPostVisible = false;
        this.report = {};
      },
      //导出数据按钮
      exportEmpReport() {
        if(this.tableInstance.table.data.length ==0){
          this.$message({
            type: 'error',
            message: '没有数据可导出'
          })
          return;
        }
        let data ={
          "list":this.tableInstance.table.data
        }
        exportEmpReportExcel(data).then(res => {
          console.log(res)
          //前端返回的是文件所在地址
          window.location.href = encodeURI(encodeURI(this.$APP_ROOT+"/api/report/download?path="+res.data.fileName+'&pathName='+res.data.pathName)) ;
        })
      },
      save(){
        if(this.tableInstance.table.data.length ==0){
          this.$message({
            type: 'error',
            message: '没有数据可上报'
          })
          return;
        }
        let data ={
          "list":this.tableInstance.table.data
        }
        submitEmpReportData(data).then(res=>{
          this.$message({
            type: res.data.level,
            message: res.data.retMsg
          })
        })

      }
    }
  }
</script>
<style lang="scss" scoped>
  .bv-table /deep/ .el-pagination{
    display: none;
  }
</style>
