<template>
  <div class="app-container">
    <bv-table ref="table" title="员工绩效导入" :key="random" :pagination="false" :filter.sync="filter" :data="tableData"  @on-mounted="(table) => tableInstance = table" >
      <div slot="operates">
        <bv-button view="save" type="success" @click="reportExcelDownload">模板下载</bv-button>
        <bv-button view="import" @click="insertSaleInfo">导入数据</bv-button>
        <bv-button type="success" @click="handleInsert" :disabled="hasData">保存</bv-button>
      </div>
      <!--<div slot="search" class="search">
        <bv-col >
          <el-form-item label="日期" prop="assessMonth">
            <el-date-picker
              v-model="filter.assessMonth"
              type="month"
              placeholder="选择月份" value-format="yyyyMM" clearable>
            </el-date-picker>
          </el-form-item>
        </bv-col>
        <bv-col >
        <el-form-item label="部门" prop="depName">
          <el-input v-model="filter.depName" />
        </el-form-item>
        </bv-col>
      </div>-->
      <!--<bv-table-column type="selection" />-->
      <bv-table-column label="月份" prop="assessMonth" align="center"/>
      <bv-table-column label="部门" prop="deptName" align="center"/>
      <bv-table-column label="评委" prop="jurName" align="center"/>
      <bv-table-column label="员工" prop="empName" align="center"/>
      <bv-table-column label="评分" prop="empScore" align="center"/>
      <bv-table-column label="原因" prop="assessRemark" align="center"/>
      <bv-table-column label="时间" prop="recordTime" align="center"/>
    </bv-table>
    <bv-dialog title="调整平均分信息" :visible.sync="justdialogVisibleName" top="20vh" @close="cancelInsert">
      <bv-scrollbar style="height: 300px">
        <el-alert v-for="item in justmsg" :key="item.assessMonth" type="warning" :closable="false">
          <b>{{ item.assessMonth}}></b>    系统内平均分：<b>{{item.sysDeptAverage}}</b> 分  导入平均分：<b>{{item.importDeptAverage}}</b> 分   需要给员工调整 <b>{{item.adjustScore}}</b> 分
        </el-alert>
      </bv-scrollbar>
      <div slot="footer">
        <bv-button view="cancel" @click="submitInsert">确认保存</bv-button>
        <bv-button view="cancel" @click="justdialogVisibleName=false">取 消</bv-button>
      </div>
    </bv-dialog>
    <el-dialog title="员工绩效信息导入" :visible.sync="exportEmptModal" width="30%">
      <el-upload
        ref="uploadFile"
        class="upload-demo-sale"
        drag
        :action="upload_url"
        :auto-upload="false"
        :on-change="fileChange"
        :file-list="fileList"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">只能上传xls/xlsx文件</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <bv-button size="small" type="success" @click="submitUpload">上传</bv-button>
        <bv-button @click="exportModalCancel">取 消</bv-button>
      </span>
    </el-dialog>
  </div>


</template>

<script>
  import {importEmpFile,downloadEmpTemplate,insertEmpRecord} from '@/api/report/statistic'
  const maxFileSize = 20;
  export default {
    name: 'empReport',
    data() {
      return {
        random:1,
        // 过滤条件
        filter: {
          assessMonth:"",
          depName:"",
        },
        upload_url: 'url',
        importEmpFile,
        modifyType: null,
        justdialogVisibleName:false,
        hasData:true,
        rules: {
        },
        //msg:[{"fuzzy":null,"fuzzyLike":null,"page":0,"limit":0,"sort":null,"id":"1","depId":"0021","assessMonth":"201910","assessScore":106.00,"initScore":0.00,"cooperateRemark":"{[\"juryname\":\"评委1\",\"cooperate_remark\":\"协同扣分原因人体人多个地方官\"]}","manageTime":"2019-11-04 17:26:53","deptName":"二级部门2-1","userId":null}]
        msg:[],
        justmsg:[],
        tableInstance: {},
        uploadVisible: false,
        exportEmptModal:false,
        //存放文件数据
        fileList: [],

      }
    },
    created() {
    },
    computed: {
      tableData:{
        get(){
          return this.msg
        },
        set(){

        }
      }

    },
    methods: {
      submitInsert(){
          let data = {
            "justlist":this.justmsg,
            "recordlist":this.msg
          }
        insertEmpRecord(data).then(ret => {

            if(ret.data.retCode == "0000"){
              this.$message.success(ret.data.retMsg)
              this.justdialogVisibleName = false
              this.msg = []
              this.justmsg = []
              this.depreport = []
              this.random = Math.random()
              this.hasData = true
            }else{
              this.$message.error(ret.data.retMsg)
            }
          })
      },
      handleInsert(){
        if(this.msg.length ==0){
          this.$message.warning("还没有导入数据！")
          return;
        }
        this.justdialogVisibleName = true
      },
      cancelInsert(){
        this.justdialogVisibleName = false
      },
      showUpload(){
        if(this.$refs.uploadFile != undefined){
          this.$refs.uploadFile.clearFiles()
        }
        this.exportEmptModal = true
      },
      //导入数据按钮点击
      insertSaleInfo() {
        if(this.msg.length !=0){
          this.$confirm('重新导入会清空表格已有数据 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            //防止闪屏 延时800ms
            setTimeout(this.showUpload,"800")
          })
        } else{
          if(this.$refs.uploadFile != undefined){
            this.$refs.uploadFile.clearFiles()
          }
          this.exportEmptModal = true
        }


      },
      submitUpload(){
        let path = '\\empExport';
        let isHaveFiles = false;
        let file = [];
        let fileSource = [];
        if (this.$refs.uploadFile.uploadFiles.length > 0) {
          isHaveFiles = true;
          file.push(this.$refs.uploadFile.uploadFiles[0].raw);
          fileSource.push("员工绩效文件");
        }
        // 没有上传文件时
        if (!isHaveFiles) {
          this.$message({
            type: 'warning',
            message: '请至少上传1个文件!'
          });
          return;
        }
        //传递当前用户id  ==  manageUser
        let data = {
          fileSource: fileSource,
          manageUser: 'admin',
          path: path
        };
        importEmpFile(file, data).then(ret => {
          //清除上传的文件
          this.$refs.uploadFile.clearFiles()
          let code = ret.data.retCode
          if (code) {
            if(code == "9999"){
              this.$message({
                type: ret.data.level,
                message: ret.data.retMsg
              });
            }else if(code == "0000"){
              this.random = Math.random()
              this.msg = ret.data.list
              this.justmsg = ret.data.justList
              if(this.tableData.length>=1){
                this.hasData = false
              }
            }

          } else {
            this.$message({
              type: 'warning',
              message: '导入数据为空'
            });
          }
          this.exportEmptModal = false;
        }).catch(() => {
          this.exportEmptModal = false;
          this.$refs.uploadFile.clearFiles()
        });

      },
      //取消导入
      exportModalCancel(){
        this.exportEmptModal = false;
        this.$message({
          type: 'info',
          message: '取消上传!'
        });
        this.$refs.uploadFile.clearFiles()
      },
      fileChange(file, fileList) {
        let isLt = file.size / 1024 / 1024 < 20
        if (!isLt) {
          this.$message.error('上传文件大小不能超过' + maxFileSize + 'MB!')
          this.fileList = fileList.slice(1, 1)
          return
        }
        let testmsg=file.name.substring(file.name.lastIndexOf('.')+1)
        let extension = testmsg === 'xls'
        let extension2 = testmsg === 'xlsx'
        if(!extension && !extension2) {
          this.$message({
            message: '上传文件只能是 xls、xlsx格式!',
            type: 'warning'
          });
          this.fileList = fileList.slice(1, 1);
          return;
        }
        this.fileList = fileList.slice(-1);
      },
      //模板文件下载
      reportExcelDownload() {
        let data = {};
        data.fileName = 'empRecord.xls';
        downloadEmpTemplate(data).then(res => {
          let blob = new Blob([res.data]);
          let url = this.getObjectURL(blob);
          let link = document.createElement('a');
          link.style.display = 'none';
          link.href = url;
          // 获取文件名
          link.download = 'empRecord.xls';
          document.body.appendChild(link);
          link.click();
          URL.revokeObjectURL(link.href);
          this.$message.success("下载成功")
        });
      },

      getObjectURL(file) {
        let url = null;
        if (window.createObjectURL !== undefined) {
          url = window.createObjectURL(file);
        } else if (window.webkitURL !== undefined) {
          url = window.webkitURL.createObjectURL(file);
        } else if (window.URL !== undefined) {
          url = window.URL.createObjectURL(file);
        }
        return url;
      },

    }
  }
</script>

<style scoped>
  .upload-demo-sale>>>.el-upload.el-upload--text {
    width: 100%;
  }
  .upload-demo-sale>>>.el-upload-dragger {
    width: 100%;
  }

</style>
