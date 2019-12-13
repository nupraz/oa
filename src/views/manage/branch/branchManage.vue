<template>
  <bv-row type="flex" class="fit-scroll">
    <el-col v-bind="$CONST.col.layout1">
      <bv-scrollbar>
        <el-tree :data="items" node-key="branchId" :props="defaultProps" class="expand-tree" :default-expand-all="true"
                 :expand-on-click-node="false" accordion @node-click="handleNodeClick"
        />
      </bv-scrollbar>
    </el-col>
    <el-col>
      <div align="center">
        <el-button v-show="addNode" type="primary" icon="el-icon-plus" size="small" @click="addNodeClick">
          增加区域
        </el-button>
        <el-form v-if="addNodeShow" ref="areaForm" :model="areaForm" class="area-edit-message" label-width="100px"
                 :rules="rules"
        >
          维护区域信息
          <el-row layout="dialog-2">
            <el-col>
              <div style="float: right;margin-bottom:10px;">
                <el-button v-if="addNextNode" type="primary" icon="el-icon-plus" size="small" @click="addNextLevelNode">
                  增加下级区域
                </el-button>
                <el-button v-if="addLevelNode" type="success" icon="el-icon-goods" size="small"
                           @click="addSameLevelNode"
                >
                  增加平级区域
                </el-button>
              </div>
            </el-col>
            <el-col>
              <bv-form-item label="区域编号:" prop="branchId">
                <el-input v-model="areaForm.branchId" :disabled="branchIdDisabled" clearable />
              </bv-form-item>
              <bv-form-item label="区域名称:" prop="branchName">
                <el-input v-model="areaForm.branchName" clearable />
              </bv-form-item>
              <!--<bv-form-item label="作息时间:" prop="dailySchedule">
                &lt;!&ndash;<el-input v-model="areaForm.dailySchedule" clearable />&ndash;&gt;
                <el-time-picker
                  v-model="areaForm.dailySchedule"
                  is-range
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围"
                />
              </bv-form-item>-->
              <bv-form-item label="显示顺序:" prop="showOrder">
                <el-input v-model.number="areaForm.showOrder" clearable />
              </bv-form-item>
              <el-button v-if="saveNode" type="primary" icon="el-icon-goods" size="small" @click="saveAreaNode">
                保存
              </el-button>
              <el-button v-if="deleteNode" type="warning" icon="el-icon-goods" size="small" @click="deleteAreaNode">
                删除
              </el-button>
              <el-button v-show="false" type="success" @click="findDeptEmpSetting">
                <!--<el-button v-show="changeTImePickerShow" type="success" @click="findDeptEmpSetting">-->
                {{ areaForm.branchName }}{{
                  !echartsContainerShow?'员工信息':'人员配置' }}显示 点击切换
              </el-button>
            </el-col>
          </el-row>
        </el-form>
        <br>
        <el-table
          v-show="branchEmpVisible" :data="branchEmpList"
          style="width: 80%"
          height="350"
        >
          <bv-table-column
            fixed
            prop="empId"
            label="员工ID"
            align="center"
          />
          <bv-table-column
            fixed
            prop="empName"
            label="员工名称"
            align="center"
          />
        </el-table>
        <el-button v-show="empNoShow">
          共<span v-text="empNo" />人
        </el-button>
        <div v-show="false" style="width: 50%">
          <!--<div v-show="echartsContainerShow" style="width: 50%">-->
          <el-date-picker
            v-model="timeValue"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
            align="right"
            @change="changeTImePicker"
          />
          <br>
        </div>
        <div v-if="false" id="echartsContainer" style="width: 80%;height: 500px" />
        <!--<div v-if="echartsContainerShow" id="echartsContainer" style="width: 80%;height: 500px" />-->
      </div>
    </el-col>

    <bv-dialog
      title="删除提醒"
      :visible.sync="dialogVisible"
      width="30%"
    >
      >
      <span>确定要删除&nbsp;"{{ deleteNodeName }}"&nbsp;节点吗</span>
      <span slot="footer" class="dialog-footer">
        <bv-button @click="dialogVisible = false">取 消</bv-button>
        <bv-button type="primary" @click="deleteNodeConfirm">确 定</bv-button>
      </span>
    </bv-dialog>
  </bv-row>
</template>

<script>
  import {
    fetchListAreas,
    modifyAreaNode,
    deleteBranch,
    empListByBranch,
    toFindDeptEmpSetting
  } from '@/api/branch'
  import echarts from 'echarts'


  export default {
    name: 'ListAreaManage',
    data() {
      return {
        chartEntity: {
          id: '',
          timeValue: '',
          type: 'branchId'
        },
        timeValue: [],
        timePickerShow: false,
        echartsContainerShow: false,
        items: null,
        changeTImePickerShow:false,
        empNoShow: false,
        branchEmpList: [],
        branchEmpVisible: false,
        addNode: true,
        addNodeShow: false,
        addNextNode: false,
        addLevelNode: false,
        saveNode: false,
        deleteNode: false,
        branchIdDisabled: false,
        nodeSelf: '',
        empNo: '',
        //保存是增加下一级还是平级
        saveChange: '',
        //删除提醒弹窗
        dialogVisible: false,

        defaultProps: {
          children: 'children',
          label: 'branchName'
        },
        idList: [],
        idCache: '',
        areaForm: {
          branchNameTemp: '',
          branchId: '',
          branchName: '',
          // dailySchedule: '',
          showOrder: '',
          parentBranch: '',
          branchLevel: ''
        },
        rules: {
          branchId: [
            {required: true, message: '请输入区域编号', trigger: 'blur'}
            , {min: 1, max: 6, message: '长度在 1 到 6 个字符', trigger: 'blur'}
          ],
          branchName: [
            {required: true, message: '请输入区域名称', trigger: 'blur'},
            {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
          ],
          // dailySchedule: [
          //   {required: true,message: '请输入作息时间',trigger: 'blur'}
          // ],
          showOrder: [
            {required: true, message: '请输入显示顺序', trigger: 'blur'}
            , {type: 'number', message: '年龄必须为数字值'}

          ]
        }
      }
    },
    computed: {
      deleteNodeName() {

        return this.areaForm.branchName

      },

    },
    created() {

      this.getList();

    },
    methods: {
      findDeptEmpSetting() {
        if (this.echartsContainerShow) {

          this.echartsContainerShow = false
          this.branchEmpVisible = true
          this.empNoShow = true
          //置空

        } else {
          this.changeTImePicker();
        }

      },
      changeTImePicker() {
        if (this.timeValue.length != 2) {
          var beginDate = new Date()
          beginDate.setMonth(0)
          beginDate.setDate(1)
          beginDate.setHours(8)
          beginDate.setMinutes(0)
          beginDate.setSeconds(0)
          console.log(beginDate)

          this.timeValue.push(beginDate)
          var endDate = new Date()
          endDate.setHours(8)
          endDate.setMinutes(59)
          endDate.setSeconds(59)
          this.timeValue.push(endDate)
          console.log(endDate)
        }
        this.echartsContainerShow = true
        this.branchEmpVisible = false
        this.empNoShow = false
        let branchId = this.areaForm.branchId;
        let timeValue = JSON.stringify(this.timeValue)
        this.chartEntity.id = branchId
        this.chartEntity.timeValue = timeValue

        toFindDeptEmpSetting(this.chartEntity).then(res => {
          if (res.data.flag) {
            this.initEchartsContainer(res.data.date, res.data.empNo)
          } else {
            this.$message({
              message: '查询失败',
              type: res.data.message
            })
          }
        });
      },
      initEchartsContainer(xAData, seriesData) {
        let dom = document.getElementById("echartsContainer");
        let myChart = echarts.init(dom);
        // let app = {};
        let option = null;
        option = {
          title: {
            text: this.areaForm.branchName + '人员配置曲线'
          },
          xAxis: {

            type: 'category',
            data: xAData
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: seriesData,
            type: 'line',
          }]
          ,
          tooltip: {
            trigger: 'axis'
          }
          ,
          toolbox: {
            show: true,
            left: 'center',
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
            }
          }
        };

        if (option && typeof option === "object") {
          myChart.setOption(option, true);
        }
      },
      getBranchEmpList(id) {
        empListByBranch(id).then(res => {
          this.branchEmpList = res.data
          this.empNo = res.data.length
        })
      },

      addNodeClick() {
        this.addNodeShow = true;
        this.saveNode = true;
        this.addSameLevelNode()
        this.addNode = false
      },
      getList() {
        var _that = this
        this.idList = []
        fetchListAreas().then(response => {
          let data = response.data;
          let tree = [];
          for (let i = 0; i < data.length; i++) {
            if (data[i].parentBranch == 'ROOT') {

              let obj = data[i];

              // let jsonStr = obj.dailySchedule;
              // obj.dailySchedule= JSON.parse(jsonStr);

              obj.children = [];
              _that.idList.push(obj.branchId)
              tree.push(obj);
              // data.splice(i,1);
              // i--
            }
          }
          menuList(tree);
          this.items = tree;

          function menuList(arr) {
            if (data.length != 0) {
              for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < data.length; j++) {
                  if (data[j].parentBranch == arr[i].branchId) {
                    let obj = data[j];


                    // let jsonStr = obj.dailySchedule;
                    // obj.dailySchedule= JSON.parse(jsonStr);


                    obj.children = [];
                    _that.idList.push(obj.branchId)
                    arr[i].children.push(obj);
                    // data.splice(j,1);
                    // j--
                  }
                }
                menuList(arr[i].children)
              }
            }
          }
        })
      },
      handleNodeClick(data, n, _that) {
        //echart
        // this.initEchartsContainer()
        this.timeValue = []
        this.changeTImePickerShow=true;
        this.echartsContainerShow = false

        this.timePickerShow = true
        this.branchEmpVisible = true
        this.empNoShow = true

        this.branchIdDisabled = true
        // console.log(this.idList);

        this.deleteNode = true
        this.addNode = false
        this.addNodeShow = true

        this.addLevelNode = true
        this.deleteNode = true

        this.addNextNode = true
        this.saveNode = true
        //去掉校验
        if (this.$refs.areaForm) {
          this.$refs.areaForm.clearValidate()
        }
        this.areaForm = data
        //将树对象给nodeSelf
        this.nodeSelf = _that
        this.idCache = this.areaForm.branchId;
        this.getBranchEmpList(this.idCache);
        console.log(this.idCache)

      },
      saveAreaNode() {
        this.$refs.areaForm.validate(valid => {
          if (valid) {
            this.areaForm.code = this.areaForm.branchId
            this.areaForm.name = this.areaForm.areaName
            if (this.areaForm.parentBranch == null || this.areaForm.parentBranch == '') {
              this.areaForm.parentBranch = 'ROOT'
            }

            // var schedule = this.areaForm.dailySchedule
            // var jsonStr =  JSON.stringify(schedule)
            // this.areaForm.dailySchedule=jsonStr
            let dataArray = this.idList
            let count = 0
            console.log(dataArray)
            for (let i = 0; i < dataArray.length; i++) {
              if (dataArray[i] == this.areaForm.branchId) {
                count++
              }
            }
            if (count == 1) {
              if (this.idCache != this.areaForm.branchId) {
                this.$message({
                  message: '此编号已经存在于其他分支机构',
                  type: 'warning'
                })
                this.addNodeShow = false;
                this.getList()
                this.addNodeShow = true;
                this.branchIdDisabled = false
                return
              }


            }

            if (this.saveChange === 'next') {

              this.nodeSelf.tree.append(this.areaForm, this.nodeSelf.tree.getCurrentNode());
              modifyAreaNode(this.areaForm).then(response => {
                this.$message({
                  message: response.data.message,
                  type: response.data.flag
                })

                //刷新页面
                this.getList();
                //隐藏div
                this.addNodeShow = false;
              });


            } else if (this.saveChange === 'same') {
              //获取到上级部门id
              modifyAreaNode(this.areaForm).then(response => {
                this.$message({
                  message: response.data.message,
                  type: response.data.flag
                })
                this.idList = [];
                //刷新页面
                this.getList();
                //隐藏div
                this.addNodeShow = true;
              });

            } else {
              modifyAreaNode(this.areaForm).then(response => {
                this.$message({
                  message: response.data.message,
                  type: response.data.flag
                })
                this.idList = [];
                //刷新页面
                this.getList();
                //隐藏div
                this.addNodeShow = true;
              });
              return false

            }
            this.branchIdDisabled = false

            this.saveChange = ''
          } else {
            return false
          }
        })

      },
      deleteAreaNode() {
        this.dialogVisible = true;

      },
      //添加下一级菜单
      addNextLevelNode() {
        this.empNoShow =false
        this.timePickerShow = false
        this.echartsContainerShow = false
        this.branchEmpVisible =false
        this.changeTImePickerShow=false
        this.branchIdDisabled = false;
        this.deleteNode = false;

        this.addNode = false
        var ParentId = this.areaForm.branchId;
        var branchLevel = this.areaForm.branchLevel;
        if (ParentId == null) {
          this.$message({
            message: '没有父节点不能添加',
            type: 'warning'
          })
          return
        }
        this.areaForm = {}
        this.areaForm.parentBranch = ParentId;
        this.areaForm.branchLevel = branchLevel + 1;
        this.saveChange = 'next'

      },
      addSameLevelNode() {
        this.empNoShow =false
        this.timePickerShow = false
        this.echartsContainerShow = false
        this.branchEmpVisible =false
        this.changeTImePickerShow=false
        this.branchIdDisabled = false;
        this.deleteNode = false;
        var ParentId = this.areaForm.parentBranch;
        var branchLevel = this.areaForm.branchLevel;

        this.areaForm = {}

        this.areaForm.parentBranch = ParentId;
        this.areaForm.branchLevel = branchLevel;
        this.saveChange = 'same'
      },
      deleteNodeConfirm() {
        this.nodeSelf.tree.remove(this.nodeSelf.tree.getCurrentNode())
        this.dialogVisible = false;
        deleteBranch(this.areaForm.branchId).then(response => {


          this.$message({
            message: response.data.message,
            type: response.data.flag
          })
          if (response.data.flag == 'success') {
            // document.getElementById("echartsContainer").innerHTML=''
            this.branchEmpVisible=false
            this.empNoShow=false
            this.addNodeShow = false
            this.timePickerShow = false
            this.echartsContainerShow = false
          }
          this.idList = [];
          this.getList();

        })
      }
    }
  }
</script>

<style>
  .operator-header {
    position: absolute;
    /*margin-top: 10px;*/
    right: 2%;
  }

  .area-edit-message {
    width: 70%;
    text-align: center;
  }
</style>
