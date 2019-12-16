<template>
  <div class="app-container">
    <div>
      <bv-table
        ref="table"
        title="员工订餐"
        :pagination="true"
        :filter.sync="filter"
        tooltip-effect="dark" stripe
        :fetch-api="queryEmpOrderInfoList"
        :summary-method="getSummaries"
        show-summary
        class="emp-order-table"
        @on-mounted="(table) => tableInstance = table"
      >
        <div slot="operates">
          <bv-button type="text" class="red">{{ timeStr }} </bv-button>
          <bv-button type="text">{{ startEndMsg }} </bv-button>
          <bv-button v-show="isShowAdd" view="add" authority="add" @click="insertOrderInfo">新增</bv-button>
          <bv-button show="one" view="modify" authority="modify" @click="modifyOrderInfo">修改</bv-button>
          <bv-button show="oneOrMore" view="remove" authority="remove" @click="deleteOrderInfo">删除</bv-button>
          <bv-button v-show="isShowExport" view="export" authority="export" @click="exportOrderData('')">导出数据</bv-button>
        </div>
        <div slot="search">
          <bv-col>
            <el-form-item label="开始日期:">
              <el-date-picker
                v-model="filter.startDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择开始日期"
                @change="dataCheck"
              />
            </el-form-item>
          </bv-col>
          <bv-col>
            <el-form-item label="结束日期:">
              <el-date-picker
                v-model="filter.endDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择结束日期"
                @change="dataCheck"
              />
            </el-form-item>
          </bv-col>
          <bv-col>
            <el-form-item v-show="isAdmin" label="员工姓名" prop="empName">
              <el-input v-model="filter.empName" />
            </el-form-item>
          </bv-col>
        </div>
        <bv-table-column type="selection" :selectable="canUpdateOrDelete" />
        <bv-table-column label="员工信息" prop="empId" sortable="empId" align="left" width="200">
          <template slot-scope="scope">{{ scope.row.empId | comboShow(scope.row.empName) }}</template>
        </bv-table-column>
        <bv-table-column label="餐厅" prop="restName" align="center" width="260" />
        <bv-table-column label="套餐" prop="menuName" align="center" />
        <bv-table-column label="价格" prop="price" align="center" width="160" />
        <bv-table-column label="备注" prop="remark" align="center" />
        <bv-table-column label="订餐时间" prop="orderTime" sortable="orderTime" :formatter="dateimeFormatter" width="200" align="center" />
        <!--<bv-table-column label="历史数据标记" prop="historyFlag" />-->
      </bv-table>
      <!--<bv-dialog :visible.sync="countDownVisible" top="3vh">
        <p>{{nowHour+"小时"}}</p>
      </bv-dialog>-->
      <bv-dialog :title="titleName" :visible.sync="dialogVisible" top="5vh" @close="cancelInsertOrUpdate">
        <bv-scrollbar>
          <el-form ref="empOrderForm" :model="empOrderInfo" status-icon :rules="rules"
                   label-width="100px" label-position="right"
                   style="width: 90%; margin-bottom: 20px"
          >
            <el-row :gutter="$CONST.row.gutter">
              <el-row>
                <el-col v-bind="$CONST.col.layout3">
                  <el-form-item label="餐厅名称：" prop="restId">
                    <el-select v-model="empOrderInfo.restId" filterable placeholder="请选择餐厅" @change="getMenusByRestId">
                      <el-option v-for="(item) in restOpts" :key="item.restId" :label="item.restName" :value="item.restId" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col v-bind="$CONST.col.layout3">
                  <el-form-item label="可选套餐：" prop="menuId">
                    <el-select v-model="empOrderInfo.menuId" filterable placeholder="请选择套餐" style="width: 80%" @change="change()">
                      <el-option v-for="(item,index) in menusOpts" :key="index" :label="(item.menuName==null)?'':item.menuName.concat('----').concat(item.menuPrice).concat('元')" :value="item.menuId" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col v-if="isAdmin" v-bind="$CONST.col.layout3">
                  <el-form-item label="员工姓名：" prop="empId">
                    <el-select v-model="empOrderInfo.empId" filterable placeholder="请选择员工" :disabled="isOptional">
                      <el-option v-for="(item) in empData" :key="item.empId" :label="'（'.concat((item.empId==null ?'':item.empId).concat('）').concat(item.empName))" :value="item.empId" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="备注：" prop="remark">
                    <el-input v-model="empOrderInfo.remark" placeholder="请输入" type="textarea" :rows="2" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-row>
          </el-form>
        </bv-scrollbar>
        <div slot="footer">
          <bv-button view="save" type="primary" @click="handleInsertOrEdit('empOrderForm')">保存</bv-button>
          <bv-button view="cancel" @click="cancelInsertOrUpdate">取 消</bv-button>
        </div>
      </bv-dialog>
    </div>
  </div>
</template>

<script>
  import { queryEmpOrderInfo, addEmpOrderInfo, editEmpOrderInfo, deleteEmpOrderInfo, exportEmpOrderData,
    fetchIsShowAddAndEmpOptions, fetchEmpData , fetchRestaurantsInUse, fetchMenusInUseByRestId} from '@/api/empOrder'
  import moment from 'moment'
  export default {
    name:'EmpOrderManage',
    data() {
      return {
        nowHour:'',
        nowMinute:'',
        nowSecond:'',
        timeStr:'',
        timeFlag:true,
        NaNFlag:false,
        tableInstance: {},
        // 过滤条件
        filter:{
          empName: '',
          startDate : '',
          endDate: ''
        },
        queryEmpOrderInfo,
        dialogVisible: false,
        isAdd: false,
        isShowAdd: false,
        isShowExport: false,
        isInOrderTime: false,
        isAlreadyOrder: false,
        isAdmin: false,
        isOptional: false,
        //可用餐厅
        restOpts: [],
        //可用菜单
        menusOpts: [],
        //可选菜单
        menuOptions: [],
        //员工姓名
        empData: [],
        //总价
        priceSum: '',
        //合计次数
        orderCount: '',
        //起止时间
        startOrderTime: '',
        endOrderTime: '',
        //时间信息提示
        startEndMsg: '',
        titleName: '',
        /*countDownVisible:true,*/
        //弹窗显示内容
        empOrderInfo:{
          sysGuid: '',
          empId: '',
          empName: '',
          startDate: '',
          endDate: '',
          menuId: '',
          menuName: '',
          menuPrice: '',
          restId: '',
          restName: '',
          remark: ''
        },
        rules:{
          restId: [
            {required: true, message:'餐厅不能为空', trigger: 'blur'}
          ],
          menuId: [
            {required: true, message:'套餐不能为空', trigger: 'blur'}
          ],

        }
      }
    },
    created() {
      //获取员工信息
      this.getEmpData();
      //获取可用餐厅信息
      this.getRestData();
      //订餐倒计时
      this.$nextTick(function () {
        this.timeRun()
      });
    },
    methods: {
      //订餐倒计时
      timeRun(type){
        let countDown = setInterval(()=>{

          this.updateCountDown();
          console.log('type:'+type);
          console.log('timeFlag:'+this.timeFlag);
          console.log('NaNFlag:'+this.NaNFlag);
          if(type!='flash' && this.NaNFlag == true){
            this.timeStr='';
            clearInterval(countDown);
          }
          if(this.timeFlag == true){
            console.log('订餐结束，将倒计时显示设为否');
            this.timeStr='';
            this.startEndMsg = '未在订餐时间！';
            clearInterval(countDown);
          }

        },1000)
      },
      updateCountDown(){
        //订餐结束时间
        var endTimeStamp = Date.parse(this.endOrderTime);
        //当前时间
        var nowDateStamp = Date.parse(new Date());
        var subtractTime = parseInt((endTimeStamp - nowDateStamp)/1000);
        this.nowHour = parseInt(subtractTime/(60*60)%24);
        this.nowMinute = parseInt(subtractTime/60%60);
        this.nowSecond = parseInt(subtractTime%60);
        console.log('subtractTime'+subtractTime);
        if(subtractTime <= 0){
          console.log('倒计时结束');
          this.timeFlag = true;
        }
        else if(Number.isNaN(subtractTime)){
          console.log('未在倒计时');
          this.NaNFlag = true;
          this.timeFlag = true;
        }
        else {
          this.timeFlag = false;
          this.NaNFlag = false;
          this.timeStr = this.nowHour + '小时' + this.nowMinute + '分钟' + this.nowSecond + "秒";
        }
      },
      canUpdateOrDelete(row){
        //判断是否为订餐管理员
        if(this.isAdmin){
          return true;
        } else {
          //判断是否为历史数据
          if(row.historyFlag=='1') {
            return false;
          }
          else return true;
        }
      },
      // 1.查询是否在订餐时间、员工是否订餐，决定是否显示添加按钮
      // 2.查询是否是管理员，决定是否显示导出按钮及员工下拉列表
      // 3.返回订餐起止时间
      isShowAddAndEmpOptions(){
        fetchIsShowAddAndEmpOptions().then(res=>{
          this.isInOrderTime = res.data.isInOrderTime;
          this.isAlreadyOrder = res.data.isAlreadyOrder;
          this.isAdmin = res.data.isAdmin;
          this.startOrderTime = res.data.startOrderTime;
          this.endOrderTime = res.data.endOrderTime;
          //this.updateCountDown();
          if(this.startOrderTime != '' && this.endOrderTime !=''){
            //获取结束订餐时的小时
            let hours = this.endOrderTime.substr(11,2);
            //早中晚餐提示
            let textMeal = '';
            // 判断当前时间段
            if (hours > 0 && hours <= 9) {
              textMeal = `（早餐）`;
            } else if (hours > 9 && hours <= 14) {
              textMeal = `（午餐）`;
            } else if (hours > 14 && hours <= 24) {
              textMeal = `（晚餐）`;
            }
            this.startEndMsg = '订餐时间：'+ this.startOrderTime.substr(11,5) + ' -- ' + this.endOrderTime.substr(11,5) + textMeal;
          } else{
            this.startEndMsg = '未在订餐时间！';
          }
          //在订餐时间且未订餐，添加按钮显示
          if(this.isInOrderTime && !this.isAlreadyOrder){
            this.isShowAdd = true;
          }else {
            this.isShowAdd = false;
          }
          //是订餐管理员，添加常显，导出显示
          if(this.isAdmin){
            this.isShowAdd = true;
            this.isShowExport = true;
          }
        })
      },
      getEmpData:function(){
        //获取员工信息
        fetchEmpData().then(response=>{
          this.empData = response.data.empData;
        })
      },
      getRestData:function(){
        //获取可用餐厅信息
        fetchRestaurantsInUse().then(response=>{
          this.restOpts = response.data;
        })
      },
      change(){
        this.$forceUpdate()
      },
      getMenusByRestId:function(){
        let data = {}
        data.restId = this.empOrderInfo.restId;
        this.empOrderInfo.menuId = "";
        //获取所选餐厅下可用菜单信息
        fetchMenusInUseByRestId(data.restId).then(response=>{
          this.menusOpts = response.data;
        })
      },
      queryEmpOrderInfoList(data){
        this.queryEmpOrderInfo(data).then(response=>{
          this.orderCount = response.data.orderCount;
          this.priceSum = response.data.priceSum;
        });
        //刷新时加载一次，避免isShowAdd不能及时刷新
        this.isShowAddAndEmpOptions();
        //刷新订餐倒计时
        this.timeRun('flash');
        return this.queryEmpOrderInfo(data)
      },
      insertOrderInfo() {
        this.titleName='新增员工订餐';
        //弹窗显示标志置为true
        this.dialogVisible=true;
        //新增标志置为true
        this.isAdd=true;
        //员工下拉框可选
        this.isOptional = false;

        this.empOrderInfo={};
        //初始化可选套餐
        this.menusOpts = [];
        this.$nextTick(function () {
          this.$refs.empOrderForm.clearValidate()
        });
      },
      modifyOrderInfo(){
        this.titleName='修改员工订餐';
        //弹窗显示标志置为true
        this.dialogVisible=true;
        //新增标志置为false
        this.isAdd=false;
        //员工下拉框不可选
        this.isOptional = true;
        //将选中的数据赋值给this.empOrderInfo
        this.empOrderInfo={...this.tableInstance.table.selection[0]};
        let data = {};
        data.restId = this.tableInstance.table.selection[0].restId
        fetchMenusInUseByRestId(data.restId).then(res => {
          this.menusOpts = res.data
        })
        this.$nextTick(function () {
          this.$refs.empOrderForm.clearValidate()
        });
      },
      //新增或修改页面中保存按钮的操作
      handleInsertOrEdit(formName) {
        //表单校验
        let _that=this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (_that.isAdd) {
              //将数据存入数据库
              addEmpOrderInfo(_that.empOrderInfo).then(res =>{
                this.$message({
                  message:res.data.retMsg,type: res.data.level
                })
                if(res.data.level==='success'){
                  //刷新页面
                  _that.tableInstance.fetchData();
                  //关闭弹窗
                  _that.dialogVisible = false;
                }
              })
            } else {
              //将修改的数据更新到数据库
              editEmpOrderInfo(_that.empOrderInfo).then(res =>{
                  // 修改成功后执行
                  if(res.data.level=="success"){
                    //刷新页面
                    _that.tableInstance.fetchData();
                    //关闭弹窗
                    _that.dialogVisible = false;
                  }
                  this.$message({
                    message:res.data.retMsg,type: res.data.level
                  })
                }
              )
            }
          }else {
            //校验没有通过时的处理
            return false
          }
        })
      },
      deleteOrderInfo() {
        let _that = this;
        _that.$confirm('确定要删除此信息吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //根据this.selection[0] 中的对象的id进行删除
          deleteEmpOrderInfo(_that.tableInstance.table.selection.map(item => item.sysGuid).join()).then(res =>{
            if(res.data.level=="success"){
              //刷新页面
              _that.tableInstance.fetchData();
              //清空选中
              _that.selection.pop();
              _that.$message({
                message:res.data.retMsg,
                type: res.data.level
              })
            }else if(res.data.level=="error"){
              _that.$message({
                message:res.data.retMsg,
                type: res.data.level
              })
            }
          })
        }).catch(() => {
        });
      },
      //按查询条件导出数据
      exportOrderData(type){
        let data = {};
        data = this.filter;
        data.type = type;
        if (this.tableInstance.isFuzzy) {
          data.fuzzy = this.tableInstance.fuzzy
        } else {
          data.fuzzy = ''
        }
        exportEmpOrderData(data).then(res => {
          window.location.href = encodeURI(encodeURI(this.$APP_ROOT+"/api/customers/download?path="+res.data.fileName+'&pathName='+res.data.pathName)) ;
        }).catch(e => {
          this.$message({
            message: '导出失败',
            type: 'warning'
          });
          console.log(e)
        });
      },
      cancelInsertOrUpdate(){
        //清除表单校验
        this.$nextTick(function () {
          this.$refs.empOrderForm.clearValidate()
        });
        //关闭弹窗
        this.dialogVisible = false;
      },
      //开始日期结束日期比较
      dataCheck(){
        let start = new Date(this.filter.startDate);
        let end = new Date(this.filter.endDate);
        if (this.filter.startDate != null && this.filter.startDate !== ''
          && this.filter.endDate != null && this.filter.endDate !== '') {
          if (start > end) {
            this.$message({
              type : 'warning',
              message : '结束日期必须大于开始日期'
            })
          }
        }
      },
      //时间格式化
      dateimeFormatter(row) {
        return moment(row.orderTime).format('YYYY-MM-DD HH:mm:ss')
      },
      //汇总
      getSummaries(param) {
        const { columns } = param;
        const sums = [];
        columns.forEach((column, index) => {
          if (index === 1) {
            sums[index] = '总计';
            return;
          }
          if(index===2){
            sums[index] = this.orderCount+'次';
            return;
          }
          if(index===3){
            sums[index] = parseFloat(this.priceSum).toLocaleString()+'元';
          }
        });

        return sums;
      }
    }
  }
</script>
<style scoped>
  .emp-order-table>>>.has-gutter{
    font-size: 15px;
    font-weight: 600;
  }
  .red{
    color: #ff475d;
    font-size: 15px;
  }
</style>
