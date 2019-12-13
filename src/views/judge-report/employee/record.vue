<template>
  <div class="app-container">
    <bv-table ref="table"  title="员工评价报表" style="padding-bottom: 20px" :pagination="false" :filter.sync="filter" :fetch-api="fetchDepRecord" @on-mounted="(table) => tableInstance = table" >
      <div slot="operates">
        <bv-button view="export" @click="exportEmpReport">数据导出</bv-button>
        <bv-button  @click="print">打印</bv-button>
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
        <!--<bv-col >
          <el-form-item label="名字" prop="empName">
            <el-input v-model="filter.empName" />
          </el-form-item>
        </bv-col>-->
      </div>
      <!--<bv-table-column type="selection" />-->
      <bv-table-column :label="title" align="center">
        <bv-table-column label="员工编号" prop="empId" align="center" />
        <bv-table-column label="部门" prop="deptName" align="center"/>
        <bv-table-column label="岗位" prop="gradeName" align="center"/>
        <bv-table-column label="姓名" prop="empName" align="center"/>
        <bv-table-column label="评分" prop="empScore" align="center" />
        <bv-table-column label="评分原因" prop="assessRemark" align="center" show-overflow-tooltip/>
      </bv-table-column>

    </bv-table>
    <form ref="tablePrint" style="display: none">
      <h2 style="text-align: center">{{title}}</h2>
    <table  border="1" width="650"  cellspacing="0"  style="border-collapse:collapse;table-layout:fixed;border:solid 1px black; font-size: 12px; margin-left: 30px">
      <tr>
        <th width="60" height="30" style="border:solid 1px black"><font style="font-weight: bold">序号</font></th>
        <th width="100" height="30" style="border:solid 1px black"><font style="font-weight: bold">处室</font></th>
        <th width="60" height="30" style="border:solid 1px black"><font style="font-weight: bold">岗位</font></th>
        <th width="60" height="30" style="border:solid 1px black"><font style="font-weight: bold">姓名</font></th>
        <th width="60" height="30" style="border:solid 1px black"><font style="font-weight: bold">评分</font></th>
        <th width="310" height="30" style="border:solid 1px black"><font style="font-weight: bold">备注</font></th>
      </tr>
    <tr v-for="(item,i) in tableData" :key="item.empId">
      <td height="30" style="text-align: center;">{{i+1}}</td>
      <td style="text-align: center">{{item.deptName}}</td>
      <td style="text-align: center">{{item.gradeName}}</td>
      <td style="text-align: center">{{item.empName}}</td>
      <td style="text-align: center">{{item.empScore}}</td>
      <td style="text-align: center">{{item.assessRemark}}</td>
    </tr>

    </table>
      <div class="rule" style="min-height: 120px; margin: 20px 0 0 30px; font-size: 12px">
        <div style="float: left; width: 30px; height: 120px; padding-top: 4px">注：</div>
        <li v-for="item in txt" :key="item" style="line-height: 20px; list-style: none">{{item}}</li>
      </div>
    </form>
   <!-- <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[5, 10, 20, 40]"
    :page-size="pagesize"
    layout="total, sizes, prev, pager, next, jumper"
    :total="userList.length">
    </el-pagination>-->
  </div>
</template>

<script>
  import { getLodop } from '@/utils/print'
  import {fetchempRecordData,exportEmpRecordExcel} from '@/api/report/statistic'
  export default {
    name: 'depReport',
    data() {
      return {
        LODOP:'',
        // 过滤条件
        filter: {
          assessMonth:"",
          empName:"",
        },
        fetchempRecordData,
        modifyType: null,
        dialogFormVisible: false,
        rules: {
        },
        tableInstance: {},
        uploadVisible: false,
        //存放文件数据
        fileList: [],
        title:"",
        pagesize:100,
        tableData:[],
        txt:[
          "1.部门内全部员工（不含休产假等员工）的平均分不得高于部门绩效评价最终得分；",
          "2.部门内员工评分以0.5分为级差，不得完全相同，部门内员工的最高得分不得超过部门最终得分3分；",
          "3.公司绩效考评得分直接体现于员工最终评分；",
          "4.请在备注中添加得分理由。"
        ]
      }
    },
    async created() {
      this.LODOP = await getLodop()
    },
    /*computed: {
      title:{
        get(){
        },
        set(){

        }
      }

    },*/
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
        if(this.filter.empName){
          tmptitle = tmptitle +"、姓名包含"+this.filter.empName
        }
        if(data.fuzzy){
          tmptitle = tmptitle +"、各个字段包含"+data.fuzzy
        }
        tmptitle+="的员工绩效报表"
        this.title = tmptitle
        //data.limit = 100
        this.tableData = this.fetchempRecordData(data);
        this.fetchempRecordData(data).then(res=>{
          this.tableData = res.data
          // console.log(this.tableData)
        })
        return  this.tableData;

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
        exportEmpRecordExcel(data).then(res => {
          console.log(res)
          //前端返回的是文件所在地址
          window.location.href = encodeURI(encodeURI(this.$APP_ROOT+"/api/report/download?path="+res.data.fileName+'&pathName='+res.data.pathName)) ;
        })
      },
      print(){
        // this.LODOP=getLodop();
        this.LODOP.PRINT_INIT("gjjjx");
        this.LODOP.SET_PRINT_PAGESIZE(1, '800mm', '600mm','A4');
        this.LODOP.ADD_PRINT_TEXT(50, 231, 300, 139, "");
        this.LODOP.ADD_PRINT_HTM(88,30,0,800,this.$refs.tablePrint.innerHTML);
        this.LODOP.PREVIEW();
        // this.LODOP.PRINT (); //不经打印预览的直接打印。
      }
    }
  }
</script>
<style lang="scss" scoped>
  .bv-table /deep/ .el-pagination{
    display: none;
  }
</style>
