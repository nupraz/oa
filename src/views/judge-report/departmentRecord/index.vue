<template>
  <div class="app-container">
   <bv-table ref="table" title="部门得分记录" :pagination="false" :filter.sync="filter" :fetch-api="fetchDepReport" @on-mounted="(table) => tableInstance = table">
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
       <el-table-column label="月份" prop="assessMonth" align="center"/>
       <el-table-column label="最终得分" prop="assessScore" align="center"/>
       <el-table-column label="其他部门得分" prop="otherScore" align="center"/>
       <el-table-column label="协同评价扣分原因" prop="cooperateRemark" align="center"/>
      <!--<bv-table-column type="selection" />-->
    </bv-table>
  </div>
</template>

<script>
  import {fetchListData} from '@/api/report/statistic'
  export default {
    name: 'departmentRecord',
    data() {
      return {
        // 过滤条件
        filter: {
          assessMonth:""
        },
        showTable:true,
        fetchListData,
        modifyType: null,
        dialogFormVisible: false,
        rules: {
        },
        tableInstance: {},
        uploadVisible: false,
        //存放文件数据
        fileList: []
      }
    },
    created() {
    },
    methods: {
      fetchDepReport(data){
        if(this.filter.assessMonth){
          data.assessMonth = this.filter.assessMonth
        }
        return this.fetchListData(data);

      }
    }
  }
</script>

<style lang="scss" scoped>
  .bv-table {
    padding-bottom: 20px;
    /deep/ .el-pagination{
      display: none;
    }
  }
</style>
