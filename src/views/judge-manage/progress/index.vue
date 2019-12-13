<template>
  <div class="app-container">
    <bv-table ref="table" title="评价进度" :pagination="false" :filter.sync="filter" :fetch-api="fetchDepReport"
              @on-mounted="(table) => tableInstance = table">
      <!-- <div slot="search">
        <bv-col >
         <el-form-item label="日期" prop="assessMonth">
            <el-date-picker
              v-model="filter.assessMonth"
              type="month"
              placeholder="选择月份" value-format="yyyyMM" clearable>
            </el-date-picker>
          </el-form-item>
        </bv-col>
      </div> -->
      <el-table-column prop="name" label="姓名"  align="center"></el-table-column>

      <el-table-column prop="deptName" label="部门名称"  align="center"></el-table-column>

      <el-table-column prop="departmentEvaluate" label="部门评价"  align="center"></el-table-column>

      <el-table-column prop="staffEvaluate" label="员工评价"  align="center"></el-table-column>
    </bv-table>
  </div>
</template>

<script>
  import {fetchProgressData} from '@/api/report/statistic'

  export default {
    name: 'departmentRecord',
    data() {
      return {
        // 过滤条件
        filter: {
          assessMonth: ""
        },
        showTable: true,
        fetchProgressData,
        modifyType: null,
        dialogFormVisible: false,
        rules: {},
        tableInstance: {},
        uploadVisible: false,
        //存放文件数据
        fileList: []
      }
    },
    created() {
    },
    methods: {
      fetchDepReport(data) {
        return this.fetchProgressData(data);
      }
    }
  }
</script>

<style lang="scss" scoped>
  .bv-table {
    padding-bottom: 20px;
    /deep/ .table-search {
      display: none;
    }
    /deep/ .el-pagination {
      display: none;
    }
  }
</style>

