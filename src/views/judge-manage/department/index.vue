<template>
  <div class="content">
    <div class="department" v-show="selfAssessment == 0 && needAssessment == 1">
      <div class="department-table">
        <el-table :data="tableData" border style="width: 100%;" :row-style="{height:'65px'}">
          <el-table-column prop="department" label="部门" width="380" align="center"></el-table-column>

          <el-table-column label="工作任务完成情况" width="350" align="center" type="index">
            <template slot-scope="scope">
              <el-radio-group v-model="scope.row.num" @change="lie2()">
                <el-radio label="106" :disabled="disabledFlag">优秀</el-radio>
                <el-radio label="103">良好</el-radio>
                <el-radio label="100">合格</el-radio>
                <el-radio label="97">不合格</el-radio>
              </el-radio-group>
            </template>
          </el-table-column>

          <el-table-column label="协同配合评价意见" align="center">
            <el-table-column label="评分（此项为扣分项）" width="400" align="center">
              <template slot-scope="scope">
                <el-radio-group
                  v-model="scope.row.index"
                  :disabled="scope.row.department === currentDepartment"
                >
                  <el-radio label="0">0</el-radio>
                  <el-radio label="-0.5">-0.5</el-radio>
                  <el-radio label="-1">-1</el-radio>
                  <el-radio label="-1.5">-1.5</el-radio>
                  <el-radio label="-2">-2</el-radio>
                </el-radio-group>
              </template>
            </el-table-column>

            <el-table-column label="原因（填写扣分原因）" align="center">
              <template slot-scope="scope">
                <el-input
                  type="textarea"
                  :rows="2"
                  v-model="scope.row.textarea"
                  :disabled="scope.row.department === currentDepartment"
                  maxlength="200"
                ></el-input>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>

      <div class="department-btn">
        <el-button type="primary" @click="submit()">提交</el-button>
      </div>


    </div>

    <div class="worked" v-show="selfAssessment == 1">
      <div class="noWork">您已完成本月评价</div>
    </div>
    <div class="worked" v-show="needAssessment == 0">
      <div class="noWork">您不能进行部门评价(原因：您所在部门不参与考核)</div>
    </div>

    <div class="department-txt">
      <div class="role">部门评分规则</div>
      <ul>
        <li v-for="item in txt" :key="item">{{item}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { showData, submitData } from "@/api/manage/department";
  export default {
    name: "JudgeDepartment",
    data() {
      return {
        disabledFlag: false,
        currentDepartment: "",
        tableData: [],
        subordinate: -1,
        selfAssessment: -1,
        needAssessment: -1,
        txt: [
          "1.根据工作任务完成情况，按照“优秀、良好、合格、不合格”四种情况进行评价；",
          "2.评价为优秀的不得多于1个；",
          "3.协同配合评价分值视情况扣减0-2分；",
          "4.协同配合评价有扣分的，必须填写扣分原因。"
        ]
      };
    },
    created() {
      showData().then(response => {
        this.currentDepartment = response.data.currentDepartment;
        this.tableData = response.data.tableData;
        this.subordinate = response.data.subordinate;
        this.selfAssessment = response.data.selfAssessment;
        this.needAssessment = response.data.needAssessment;
      });
    },
    methods: {
      lie2() {
        for (var i = 0; i < this.tableData.length; i++) {
          if(this.tableData[i].num == 106){
            this.disabledFlag = true;
            break;
          }else{
            this.disabledFlag = false;
          }
        }
      },
      submit() {
        var score = [];
        var sum = 0;
        for (var i = 0; i < this.tableData.length; i++) {
          var obj = {};
          obj.department = this.tableData[i].department;
          obj.jobWork = this.tableData[i].num;
          obj.initialScore = this.tableData[i].index;
          obj.causeInitialValue = this.tableData[i].textarea;
          score.push(obj)
          if(score[i].department == this.currentDepartment){
            obj.initialScore = '';
            obj.causeInitialValue = ''
          }
          if(score[i].department != undefined && score[i].jobWork != undefined && score[i].initialScore != undefined && (score[i].causeInitialValue != undefined ||score[i].causeInitialValue != null ||score[i].causeInitialValue != "") ){
            sum++;
            if(this.tableData[i].index < 0 && (this.tableData[i].textarea == null ||this.tableData[i].textarea == "")) {
              this.$alert("协同配合评价有扣分的，必须填写扣分原因", "提示");
              sum--;
            }
          }else if(this.tableData[i].index == 0 && (this.tableData[i].textarea == null ||this.tableData[i].textarea == "")) {
            sum++;
          }

        }
        console.log(this.tableData.length,sum)
        if(this.tableData.length == sum){
          submitData(JSON.stringify(score));
          this.$message({
            message: "评价完成",
            type: "success"
          });
          this.selfAssessment = 1;
        }else{
          this.$message({
            message: '请完成全部评价',
            type: 'warning'
          });
        }


      }
    }
  };
</script>

<style lang="scss" scoped>
  [v-cloak] {
    display: none;
  }
  .el-table /deep/ thead {
    color: #fff;
  }
  .department-btn {
    text-align: center;
    margin-top: 20px;
    button {
      width: 300px;
      height: 40px;
    }
  }
  .department-txt {
    .role {
      margin: 20px 0 0 40px;
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
