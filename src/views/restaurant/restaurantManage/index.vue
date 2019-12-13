<template>
  <div class="app-container">
    <div>
      <bv-table
        ref="table"
        title="餐厅信息列表"
        :pagination="true"
        :filter.sync="filter"
        tooltip-effect="dark" stripe
        :fetch-api="queryRestaurantInfo_"
        @on-mounted="(table) => tableInstance = table"
      >
        <div slot="operates">
          <bv-button v-show="isShowStartOrder" type="success" authority="startOrder" @click="clickStartOrder()">发起订餐</bv-button>
          <bv-button v-show="isShowCancelOrder" type="danger" authority="cancelOrder" @click="cancelOrder()">取消订餐</bv-button>
          <bv-button show="none" view="add" authority="add" @click="clickInsert()">新增</bv-button>
          <bv-button show="one" view="modify" authority="modify" @click="clickEdit()">修改</bv-button>
          <bv-button v-if="deleteOne" view="remove" authority="remove" @click="handleDelete()">删除</bv-button>
        </div>
        <div slot="search">
          <bv-col>
            <el-form-item label="餐厅名称" prop="restName">
              <el-input v-model="filter.restName" />
            </el-form-item>
          </bv-col>
        </div>
        <bv-table-column type="selection" />
        <bv-table-column label="餐厅名称" prop="restName" align="center" />
        <bv-table-column label="是否可用" prop="inUseName" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.inUse"
              active-value="Y"
              inactive-value="N"
              @change="clickInUse(restaurantRole,scope.row)">
            </el-switch>
          </template>
        </bv-table-column>
        <bv-table-column label="操作" width="160" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="clickMenu(scope.row)">菜单维护</el-button>
          </template>
        </bv-table-column>
      </bv-table>
    </div>
    <bv-dialog title="维护餐厅信息" :visible.sync="dialogVisible" top="5vh">
      <bv-scrollbar>
        <el-form ref="restaurantForm" :model="restaurantInfo" status-icon :rules="rules"
                 label-width="100px" label-position="right"
                 style="width: 90%;margin-bottom: 20px"
        >
          <el-row :gutter="$CONST.row.gutter">
            <el-row>
              <el-col v-bind="$CONST.col.layout3">
                <el-form-item label="餐厅名称" prop="restName">
                  <el-input v-model.trim="restaurantInfo.restName" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col v-bind="$CONST.col.layout2">
                <el-form-item label="是否可用" prop="inUse">
                    <el-switch
                      v-model="restaurantInfo.inUse"
                      value="N"
                      active-value="Y"
                      inactive-value="N">
                    </el-switch>
                </el-form-item>
              </el-col>
            </el-row>
          </el-row>
        </el-form>
      </bv-scrollbar>
      <div slot="footer">
        <bv-button view="save" type="primary" @click="handleInsertOrEdit('restaurantForm')">保存</bv-button>
        <bv-button view="cancel" @click="cancelInsertOrUpdate">取 消</bv-button>
      </div>
    </bv-dialog>
    <bv-dialog :visible.sync="dialogVisibleMenu" top="5vh">
      <bv-scrollbar>
        <bv-table
          ref="menuTable"
          title="菜单信息列表"
          :pagination="true"
          :filter.sync="filterMenu"
          tooltip-effect="dark" stripe
          :fetch-api="queryMenuInfo_"
          :modal-append-to-body="false"
          style="margin-bottom: 20px"
          @on-mounted="(table) => tableInstanceMenu = table"
        >
          <div slot="operates">
            <bv-button show="none" view="add" authority="add" @click="clickInsertMenu()">新增</bv-button>
            <bv-button show="one" view="modify" authority="modify" @click="clickEditMenu()">修改</bv-button>
            <bv-button v-if="deleteOneMenu"  show="one" view="remove" authority="remove" @click="handleDeleteMenu()">删除</bv-button>
          </div>
          <bv-table-column type="selection" />
          <bv-table-column label="菜单名称" prop="menuName" align="center" />
          <bv-table-column label="价格" prop="menuPrice" align="center" />
          <bv-table-column label="是否可用" prop="inUseName" align="center" >
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.inUse"
                active-value="Y"
                inactive-value="N"
                @change="clickInUse(menuRole,scope.row)">
              </el-switch>
            </template>
          </bv-table-column>
        </bv-table>
      </bv-scrollbar>
      <div slot="footer">
        <bv-button view="cancel" @click="dialogVisibleMenu=false">取 消</bv-button>
      </div>
    </bv-dialog>
    <bv-dialog title="维护菜单信息" :visible.sync="insertMenuDialog" top="5vh">
      <bv-scrollbar>
        <el-form ref="menuForm" :model="menuInfo" status-icon :rules="menuRules"
                 label-width="100px" label-position="right"
                 style="width: 90%;margin-bottom: 20px"
        >
          <el-row :gutter="$CONST.row.gutter">
            <el-row>
              <el-col v-bind="$CONST.col.layout3">
                <el-form-item label="菜单名称" prop="menuName">
                  <el-input v-model.trim="menuInfo.menuName" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col v-bind="$CONST.col.layout3">
                <el-form-item label="价格" prop="menuPrice">
                  <el-input v-model.trim="menuInfo.menuPrice" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col v-bind="$CONST.col.layout2">
                <el-form-item label="是否可用" prop="inUse">
                    <el-switch
                      v-model="menuInfo.inUse"
                      value="N"
                      active-value="Y"
                      inactive-value="N">
                    </el-switch>
                </el-form-item>
              </el-col>
            </el-row>
          </el-row>
        </el-form>
      </bv-scrollbar>
      <div slot="footer">
        <bv-button view="save" type="primary" @click="handleInsertMenu('menuForm')">保存</bv-button>
        <bv-button view="cancel" @click="cancelInsertMenu">取 消</bv-button>
      </div>
    </bv-dialog>
    <bv-dialog title="发起订餐" :visible.sync="startOrderDialog" top="5vh" :append-to-body="true">
      <bv-scrollbar>
        <el-row>
          <el-col v-bind="$CONST.col.layout2">
            <bv-table
              ref="allPresetTimeTable"
              title="预设订餐信息列表"
              :pagination="true"
              :filter.sync="filterPresetTime"
              tooltip-effect="dark" stripe
              :fetch-api="queryAllPresetTime"
              style="margin-bottom: 20px"
              @on-mounted="(table) => tableInstancePresetTime = table"
            >
              <div slot="operates">
                <bv-button show="oneOrMore" view="remove" @click="handleDeletePresetTime()">删除</bv-button>
              </div>
              <bv-table-column type="selection" />
              <bv-table-column label="开始时间" prop="startDate" :formatter="startTimeFormatter" align="center" />
              <bv-table-column label="结束时间" prop="endDate" :formatter="endTimeFormatter" align="center" />
            </bv-table>
          </el-col>
          <el-col v-bind="$CONST.col.layout2">
            <el-form ref="orderForm" :model="orderInfo" status-icon :rules="orderRules"
                     label-width="100px" label-position="right"
                     style="width: 90%;margin-top: 50px"
            >
              <el-row :gutter="$CONST.row.gutter">
                <el-row>
                  <el-col v-bind="$CONST.col.layout3">
                    <el-form-item label="开始时间" prop="startDate">
                      <el-date-picker
                        v-model="orderInfo.startDate"
                        type="datetime"
                        placeholder="请选择"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col v-bind="$CONST.col.layout3">
                    <el-form-item label="截止时间" prop="endDate">
                      <el-date-picker
                        v-model="orderInfo.endDate"
                        type="datetime"
                        placeholder="请选择"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-row>
            </el-form>
          </el-col>
        </el-row>
      </bv-scrollbar>
      <div slot="footer">
        <bv-button view="save" type="primary" @click="handleInsertOrder('orderForm')">保存</bv-button>
        <bv-button view="cancel" @click="cancelInsertOrder">取 消</bv-button>
      </div>
    </bv-dialog>
  </div>
</template>

<script>
  import {queryRestaurantInfo,addRestaurantInfo,editRestaurantInfo,deleteRestaurantInfo,
          queryMenuInfo,addMenuInfo,editMenuInfo,deleteMenuInfo,
          addOrderInfo,deleteOrderInfo,isHaveOrder,queryAllPresetTime,deletePresetTimeInfo} from '@/api/restaurant'
  import moment from 'moment'

  export default {
    name:'RestaurantManage',
    data() {
      var checkNumber = (rule, value, callback) => {
        if(value){
          if (!/^[0-9]*$/.test(value)) {
            callback(new Error('请输入数字'));
          } else {
            callback()
          }
        }else{
          callback()
        }
      };
      return {
        restaurantRole:'restaurantRole',
        menuRole:'menuRole',
        menuOptions:[],
        orderInfo:{
          startDate:'',
          endDate:''
        },
        startOrderDialog:false,
        menuInfo:{},
        tableInstanceMenu:{},
        tableInstancePresetTime:{},
        tableInstance: {},
        // 过滤条件
        filterMenu:{},
        filterPresetTime:{},
        filter: {},
        queryRestaurantInfo,
        dialogVisible:false,
        isAdd:false,
        isShowStartOrder: false,
        isShowCancelOrder: false,
        restaurantInfo:{},
        rules:{
          restName: [
            {required: true, message:'餐厅名称不能为空', trigger: 'blur'},
            {max: 30, message: '限制为30位以下', trigger: 'blur'}
          ],
          inUse: [
            {required: true, message:'请选择是否可用', trigger: 'change'},
          ],
        },
        menuRules:{
          menuName: [
            {required: true, message:'菜单名称不能为空', trigger: 'blur'},
            {max: 30, message: '限制为30位以下', trigger: 'blur'}
          ],
          inUse: [
            {required: true, message:'请选择是否可用', trigger: 'change'},
          ],
          menuPrice:[
            {required: true, message:'价格不能为空', trigger: 'blur'},
            { validator: checkNumber, message: '价格必须为非负整数',trigger:'blur'}
          ]
        },
        orderRules:{
          startDate: [
            {required: true, message:'请选择开始时间', trigger: 'blur'},
          ],
          endDate: [
            {required: true, message:'请选择结束时间', trigger: 'blur'},
          ],
        },
        restId:'',
        queryMenuInfo,
        dialogVisibleMenu:false,
        insertMenuDialog:false,
        isAddMenu:false,
        queryAllPresetTime
      }
    },
    computed:{
      //判断可用状态，控制删除按钮
      deleteOne(){
        if(this.tableInstance.selection
          && this.tableInstance.selection.length == 1&&this.tableInstance.selection[0].inUse=='N'){
          return true
        } else{
          return false;
        }
      },
      deleteOneMenu(){
        if(this.tableInstanceMenu.selection
          && this.tableInstanceMenu.selection.length == 1&&this.tableInstanceMenu.selection[0].inUse=='N'){
          return true
        } else{
          return false;
        }
      }
    },
    created() {

    },
    methods: {
      queryRestaurantInfo_(data){
        this.isHaveOrderNow();
        return this.queryRestaurantInfo(data);
      },
      //新增餐厅按钮
      clickInsert() {
        //弹窗显示标志置为true
        this.dialogVisible=true;
        //新增标志置为true
        this.isAdd=true;
        this.restaurantInfo={};
        this.$nextTick(function () {
          this.$refs.restaurantForm.clearValidate()
        });
      },
      //新增菜单按钮
      clickInsertMenu() {
        //弹窗显示标志置为true
        this.insertMenuDialog=true;
        //新增标志置为true
        this.isAddMenu=true;
        this.menuInfo={};
        this.$nextTick(function () {
          this.$refs.menuForm.clearValidate()
        });
      },
      //修改餐厅按钮
      clickEdit(){
        //弹窗显示标志置为true
        this.dialogVisible=true;
        //新增标志置为false
        this.isAdd=false;
        //将选中的数据赋值给this.projInfo
        this.restaurantInfo={...this.tableInstance.table.selection[0]};
        this.$nextTick(function () {
          this.$refs.restaurantForm.clearValidate()
        });
      },
      //修改菜单按钮
      clickEditMenu(){
        //弹窗显示标志置为true
        this.insertMenuDialog=true;
        //新增标志置为false
        this.isAddMenu=false;
        //将选中的数据赋值给this.projInfo
        this.menuInfo={...this.tableInstanceMenu.table.selection[0]};
        this.$nextTick(function () {
          this.$refs.menuForm.clearValidate()
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
              addRestaurantInfo(_that.restaurantInfo).then(res =>{
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
              editRestaurantInfo(_that.restaurantInfo).then(res =>{
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
      //新增、修改菜单保存按钮
      handleInsertMenu(formName) {
        //表单校验
        let _that=this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.menuInfo.restId=this.restId
            if (_that.isAddMenu) {
              //将数据存入数据库
              addMenuInfo(_that.menuInfo).then(res =>{
                this.$message({
                  message:res.data.retMsg,type: res.data.level
                })
                if(res.data.level==='success'){
                  //刷新页面
                  _that.tableInstanceMenu.fetchData();
                  //关闭弹窗
                  _that.insertMenuDialog = false;
                }
              })
            } else {
              //将修改的数据更新到数据库
              editMenuInfo(_that.menuInfo).then(res =>{
                  // 修改成功后执行
                  if(res.data.level=="success"){
                    //刷新页面
                    _that.tableInstanceMenu.fetchData();
                    //关闭弹窗
                    _that.insertMenuDialog = false;
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
      //取消新增、修改餐厅按钮
      cancelInsertOrUpdate(){
        //清除表单校验
        this.$nextTick(function () {
          this.$refs.restaurantForm.clearValidate()
        });
        //关闭弹窗
        this.dialogVisible = false;
      },
      //取消新增修改菜单按钮
      cancelInsertMenu(){
        //清除表单校验
        this.$nextTick(function () {
          this.$refs.menuForm.clearValidate()
        });
        //关闭弹窗
        this.insertMenuDialog = false;
      },
      //取消新增订餐按钮
      cancelInsertOrder(){
        //清除表单校验
        this.$nextTick(function () {
          this.$refs.orderForm.clearValidate()
        });
        //关闭弹窗
        this.startOrderDialog = false;
      },
      //删除餐厅按钮
      handleDelete () {
        let _that = this;
        _that.$confirm('确定要删除此信息吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //根据this.selection[0] 中的对象的id进行删除
          deleteRestaurantInfo(_that.tableInstance.table.selection.map(item => item.restId).join()).then(() =>{
            _that.$message({
              message:'删除成功',
              type: 'success'
            })
              //刷新页面
            _that.tableInstance.fetchData()

          })

        }).catch(() => {
        });

      },
      //删除菜单按钮
      handleDeleteMenu () {
        let _that = this;
        _that.$confirm('确定要删除此信息吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass:'zZindex'
        }).then(() => {
          //根据this.selection[0] 中的对象的id进行删除
          deleteMenuInfo(_that.tableInstanceMenu.table.selection.map(item => item.menuId).join()).then(() =>{
            _that.$message({
              message:'删除成功',
              type: 'success'
            })
            //刷新页面
            _that.tableInstanceMenu.fetchData()

          })

        }).catch(() => {
        });

      },
      //菜单维护按钮
      clickMenu(row){
        this.restId=row.restId
        this.dialogVisibleMenu=true
        this.$nextTick(function () {
          this.tableInstanceMenu.fetchData()
        })
      },
      //查询餐厅下的菜单
      queryMenuInfo_(data) {
        data.restId = this.restId;
        return this.queryMenuInfo(data);
      },
      //发起订餐按钮
      clickStartOrder(){
        //弹出发起订餐弹窗
        this.startOrderDialog=true
        this.orderInfo={}
        //清空校验
        this.$nextTick(function () {
          this.$refs.orderForm.clearValidate()
          //刷新预设订餐信息
          this.tableInstancePresetTime.fetchData()
        });
      },
      //发起订餐保存按钮
      handleInsertOrder(formName) {
        //开始日期结束日期比较
        if(!this.dataCheck()){ return;}
        //表单校验
        let _that=this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            //将数据存入数据库
            // _that.orderInfo.restId=this.restId
            addOrderInfo(_that.orderInfo).then(res =>{
              this.$message({
                message:res.data.retMsg,type: res.data.level
              })
              if(res.data.level==='success'){
                //刷新页面
                _that.tableInstance.fetchData();
                //关闭弹窗
                _that.startOrderDialog = false;
              }
            })
          }else {
            //校验没有通过时的处理
            return false
          }
        })
      },
      //取消订餐按钮
      cancelOrder () {
        let _that = this;
        _that.$confirm('确定要取消订餐吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //根据this.selection[0] 中的对象的id进行删除
          deleteOrderInfo().then(() =>{
            _that.$message({
              message:'取消成功',
              type: 'success'
            })
            //刷新页面
            _that.tableInstance.fetchData()

          })
        }).catch(() => {
        });
      },
      //查询是否正在订餐
      isHaveOrderNow(){
        isHaveOrder().then(response=>{
          this.isShowStartOrder = response.data.isShowStartOrder;
          this.isShowCancelOrder = response.data.isShowCancelOrder;
        })
      },
      //删除预设订餐信息
      handleDeletePresetTime() {
        let _that = this;
        _that.$confirm('确定要删除此信息吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //根据this.selection[0] 中的对象的id进行删除
          deletePresetTimeInfo(_that.tableInstancePresetTime.table.selection.map(item => item.sysGuid).join()).then(res=>{
            _that.$message({
              message:res.data.retMsg,
              type: res.data.level
            })
            //刷新页面
            _that.tableInstancePresetTime.fetchData()

          })
        }).catch(() => {
        });
      },
      //开始日期结束日期比较
      dataCheck(){
        let start = new Date(this.orderInfo.startDate);
        let end = new Date(this.orderInfo.endDate);
        if (this.orderInfo.startDate != null && this.orderInfo.startDate !== ''
          && this.orderInfo.endDate != null && this.orderInfo.endDate !== '') {
          if (start >= end) {
            this.$message({
              type : 'warning',
              message : '结束日期必须大于开始日期'
            })
            return false;
          }else {
            return true;
          }
        }
      },
      //时间格式化
      startTimeFormatter(row) {
        return moment(row.startDate).format('YYYY-MM-DD HH:mm:ss')
      },
      endTimeFormatter(row) {
        return moment(row.endDate).format('YYYY-MM-DD HH:mm:ss')
      },
      clickInUse(role,row){
        let _that = this;
        if(role=="restaurantRole") {
          _that.restaurantInfo = row;
          //更新数据
          editRestaurantInfo(_that.restaurantInfo).then(res => {
            //修改失败刷新页面
              if (res.data.level == "error") {
                //刷新页面
                _that.tableInstance.fetchData();
              }
              this.$message({
                message: res.data.retMsg, type: res.data.level
              })
            }
          )
        }
          if(role=="menuRole"){
            _that.menuInfo = row;
            //更新数据
            editMenuInfo(_that.menuInfo).then(res => {
              //修改失败刷新页面
              if (res.data.level == "error") {
                //刷新页面
                _that.tableInstanceMenu.fetchData();
              }
              this.$message({
                message: res.data.retMsg, type: res.data.level
              })
            }
          )
        }
        }
      }
  }
</script>
<style>
  .zZindex {
    z-index:4000 !important;
  }
</style>
