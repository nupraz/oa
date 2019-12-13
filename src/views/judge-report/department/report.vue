<template>
  <div class="app-container">
   <bv-table ref="table" title="部门评价报表" style="padding-bottom: 20px" :pagination="false" :filter.sync="filter" :fetch-api="fetchDepReport" @on-mounted="(table) => tableInstance = table">
     <div slot="operates">
       <bv-button view="export" @click="exportDepReport">数据导出</bv-button>
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
     <bv-table-column :label="title" align="center">
       <bv-table-column label="部门" prop="deptName" align="center"/>
       <bv-table-column label="最终得分" prop="assessScore" align="center"/>
     </bv-table-column>
      <!--<bv-table-column type="selection" />-->
    </bv-table>
  </div>
</template>

<script>
  import {fetchdepReportData,exportDepReportExcel} from '@/api/report/statistic'
  export default {
    name: 'depReport',
    data() {
      return {
        // 过滤条件
        filter: {
          assessMonth:""
        },
        showTable:true,
        fetchdepReportData,
        modifyType: null,
        dialogFormVisible: false,
        rules: {
        },
        tableInstance: {},
        uploadVisible: false,
        title:"",
        //存放文件数据
        fileList: []
      }
    },
    created() {
    },
    methods: {
      fetchDepReport(data){
        let tmptitle = ''
        if(this.filter.assessMonth){
          tmptitle = this.filter.assessMonth.substr(0,4)+"年"+this.filter.assessMonth.substr(4,6)+"月"
          data.assessMonth = this.filter.assessMonth
        }

        if(!this.filter.assessMonth){
          let dt = new Date()
          tmptitle = dt.getFullYear()+"年"+dt.getMonth()+"月"
        }
        if(data.fuzzy){
          tmptitle = tmptitle +"、字段包含"+data.fuzzy
        }
        tmptitle+="的部门绩效报表"
        this.title = tmptitle
        return this.fetchdepReportData(data)

      },
      //导出数据按钮
      exportDepReport() {
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
        exportDepReportExcel(data).then(res => {
          window.location.href = encodeURI(encodeURI(this.$APP_ROOT+"/api/report/download?path="+res.data.fileName+'&pathName='+res.data.pathName)) ;
        })
      },
    }
  }
</script>
<style lang="scss" scoped>
  .bv-table /deep/ .el-pagination{
    display: none;
  }
</style>
