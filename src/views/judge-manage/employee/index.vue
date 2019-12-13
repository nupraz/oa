<template>
  <div class="app-container">
    <div v-show="title==''" class="worked">您不能进行员工评价</div>
    <div v-show="title!='' && this.flag==0 " class="worked">您已完成员工评价</div>
    <div v-show="title!=''&&this.flag>0 ">
    <bv-table   title="员工评价" style="padding-bottom: 15px" :pagination="false" :filter.sync="filter" :fetch-api="deptEmployees" @on-mounted="(table) => tableInstance = table" @data-loaded="items => tableData = items">
      <div slot="operates">
        <!--<bv-button show="none" view="create" @click="startCreate()">新增</bv-button>
        <bv-button show="one" view="modify" @click="startModify()">修改</bv-button>
        <bv-button show="oneOrMore" view="remove" @click="startRemove()">删除</bv-button>-->
      </div>
      <bv-table-column :label="title" align="center" >
      <bv-table-column label="岗位" prop="postName" align="center" />
      <bv-table-column label="姓名" prop="name" align="center" />
      <bv-table-column label="评分" align="center" >
        <template slot-scope="scope">
          <el-input  v-model="scope.row.empScore" type="number" placeholder="请输入内容"></el-input>
        </template>
      </bv-table-column>
      <bv-table-column label="备注" align="center" >
        <template slot-scope="scope">
          <el-input
            type="textarea"
            :rows="2"
            v-model="scope.row.assessRemark"
            :disabled = getStatus(scope.row.status)
            maxlength="200"
          ></el-input>
        </template>
      </bv-table-column>
      </bv-table-column>
    </bv-table>
      <bv-button view="save" @click="saveJudge()" style="margin-left: 42%" :disabled = setButtonStatus()>暂存</bv-button>
      <bv-button  view="save" @click="confirmJudge()" style="margin-left: 3%" :disabled = setButtonStatus()>提交</bv-button>
    </div>
    <div class="employee-txt">
      <div class="role">员工评分规则</div>
      <ul>
        <li v-for="item in txt" :key="item">{{item}}</li>
      </ul>
    </div>
    <!--<bv-dialog title="评价" :visible.sync="dialogPostVisible">
      <bv-form ref="recordDialogForm" :model="assess" :rules="rules">
        <bv-row layout="dialog-2">
          &lt;!&ndash;<bv-col>
            <el-select v-model="assess.empName" placeholder="请选择员工" clearable>
              <el-option v-for="emp in empOption" :key="emp.id" :label="emp.name" :value="emp.id" >
              </el-option>
            </el-select>
          </bv-col>&ndash;&gt;
          <bv-col>
          </bv-col>
          <bv-col>
          </bv-col>
        </bv-row>
      </bv-form>
      <div slot="footer">
        <bv-button view="save" @click="confirmModify()">保存</bv-button>
        <bv-button view="cancel" @click="cancelModify()">取消</bv-button>
      </div>
    </bv-dialog>-->
  </div>
</template>

<script>
  import { fetchDeptScore,fetchEmpAssessRecord,deptEmployees,saveAssessRecord } from '@/api/manage/employee'

  export default {
    name: 'JudgeEmployee',
    data() {
      return {
        fetchEmpAssessRecord,
        deptEmployees,
        filter: {},
        // 评价对象
        assessData:{
          empId:'',
          empScore:'',
          assessRemark:''
        },
        title:"asdasd",
        maxScore:0,
        // 评价列表传后端
        assess:[],
        flag:-1,
        saveButton:false,
        //获取员工信息
        tableData:[],
        dialogPostVisible: false,
        confirmStatus: false,
        post: {},
        empOption:[],
        txt: [
          "1.部门内全部员工(不含休产假员工)的平均分不得高于部门绩效评价最终得分；",
          "2.部门内员工评分以0.5分为级差，须为整数或者整数加0.5分，不得完全相同，部门内员工的最高得分不得超过部门最终分3分；",
          "3.公司绩效考评得分直接体现于员工最终评分；",
          "4.请在备注中添加得分理由。"
        ],
        tableInstance: {},
        rules:[
          {

          },
          {

          }
        ]
      }
    },
    created() {
        this.selectMaxScore()
        this.fetchDeptEmp()
    },
    methods: {
      fetchDeptEmp(){
        deptEmployees().then((ret) =>{
          this.flag = ret.data.length
        })
      },
      //查询登录用户部门最终得分(上月)
      selectMaxScore(){
        fetchDeptScore().then((ret) => {
          if(ret.data.score == ""){
              this.title=""
            }else{
            let score = parseFloat(ret.data.score)
            this.maxScore = score + 3
            this.title = "上月本部门最终得分"+score+"分，根据评分规则，本部门员工最高评分不能大于"+this.maxScore+"分"
          }
        })
      },
      startCreate(){
        this.dialogPostVisible = true;
        this.modifyType = 'create';
      },
      startModify(){
        this.dialogPostVisible = true;
        this.modifyType = 'modify'
      },
      cancelModify(){
        this.dialogPostVisible = false;
        this.modifyType = null;
        this.$refs.dialogRecordForm.clearValidate()
      },
      getEmpData(){
      },
      saveJudge(){
        this.confirmStatus = false;
        this.getDate();
      },
      confirmJudge(){
        this.confirmStatus = true;
        this.getDate();
      },
      getDate(){
        if(this.tableData.length == 0){
          this.$message.error("没有数据可保存")
          return
        }
        this.assess = []
        for(let i=0; i<this.tableData.length; i++){
          let sc = parseFloat(this.tableData[i].empScore)
          if(sc> this.maxScore || sc < 0){
            this.$message.error("第"+(i+1)+"行分数必须小于"+this.maxScore+"且不小于0分")
            return;
          }
          //向下取整，看是否等于这个整数 或 整数+ 0.5
          let s = Math.floor(sc)
          if( sc != s && sc != s+0.5){
            this.$message.error("第"+(i+1)+"行分数格式不对")
            return;
          }
          this.assessData = {};
          this.assessData.id  =  this.tableData[i].id;
          this.assessData.deptId  =  this.tableData[i].deptId;
          this.assessData.empScore  =  this.tableData[i].empScore;
          this.assessData.assessRemark  =  this.tableData[i].assessRemark;
          if(this.confirmStatus == true) {
            this.assessData.status = '00';//确定保存(可能多次保存)
          } else{
            this.assessData.status = '01';//暂存(可能多次暂存)
          }
          this.assess.push(this.assessData)
        }
         //存
          saveAssessRecord(this.assess).then((ret) => {
            this.afterModify(ret);
          });
      },
      afterModify(ret) {
        this.tableInstance.fetchData();
        this.$message({
          type: ret.data.level,
          message: ret.data.retMsg
        });
        this.assess = [];
        this.confirmStatus = false;
        this.selectMaxScore()
        this.fetchDeptEmp()
      },
      getStatus(data){
        if(data == '99') {
          this.saveButton = true;
          return true;
        } else {
          this.saveButton = false;
          return false;
        }
      },
      setButtonStatus(){
        return this.saveButton;
      }
    }
  }
</script>
<style lang="scss" scoped>
  .employee-txt {
  .role {
    margin: 20px 0 0 20px;
  }
  ul,li {
    list-style: none;
    font-size: 14px;
    line-height: 30px;
  }
  }
  .worked {
    color: #ff3333;
    text-align: center
  }
</style>
