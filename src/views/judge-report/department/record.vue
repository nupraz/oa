<template>
  <div class="app-container">
    <bv-table ref="table" title="我的评价记录" style="padding-bottom: 20px" :pagination="false" :filter.sync="filter" :fetch-api="fetchDepRecord" @on-mounted="(table) => tableInstance = table" >
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
      <!--<bv-table-column type="selection" />-->
      <bv-table-column label="部门" prop="depName" align="center"/>
      <bv-table-column label="评价" prop="taskLevel" align="center"/>
      <bv-table-column label="协同评价扣分" prop="cooperateScore" align="center"/>
      <bv-table-column label="协同评价扣分原因" prop="cooperateRemark" align="center"/>
      <bv-table-column label="最终得分" prop="assessScore" align="center" />
      </bv-table-column>
    </bv-table>
  </div>
</template>

<script>
  import {fetchdepRecordData,exportDepRecordExcel} from '@/api/report/statistic'
  export default {
    name: 'depReport',
    data() {
      return {
        // 过滤条件
        filter: {
          assessMonth:""
        },
        fetchdepRecordData,
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
      fetchDepRecord(data){
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
        tmptitle+="的评价记录"
        this.title = tmptitle
        return this.fetchdepRecordData(data)
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
        exportDepRecordExcel(data).then(res => {
          console.log(res)
          //前端返回的是文件所在地址
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
