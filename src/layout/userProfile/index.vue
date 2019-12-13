<template>
  <bv-form ref="form" :model="settings" :rules="rules">
    用户中心
    <!--
    <el-upload
      class="avatar-uploader"
      :action="$APP_ROOT + '/api/file/uploads'"
      :show-file-list="false"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
    >
      <el-avatar v-if="imageUrl" :size="174" :src="imageUrl">
        <img :src="defaultAvatar">
      </el-avatar>
      <i v-else class="el-icon-plus avatar-uploader-icon" />
    </el-upload>
    <el-button @click="saveAvatar">保存头像</el-button>
    -->

    <bv-row>
      <bv-col>
        <bv-form-item label="显示标签页" prop="tagsView">
          <el-switch v-model="settings.tagsView" class="drawer-switch" />
        </bv-form-item>
      </bv-col>

      <bv-col>
        <bv-form-item label="固定头部" prop="fixedHeader">
          <el-switch v-model="settings.fixedHeader" class="drawer-switch" />
        </bv-form-item>
      </bv-col>

      <bv-col>
        <bv-form-item label="显示侧边栏图标" prop="sidebarLogo">
          <el-switch v-model="settings.sidebarLogo" class="drawer-switch" />
        </bv-form-item>
      </bv-col>

      <bv-col>
        <bv-form-item label="标签页样式" prop="tabsStyle">
          <bv-radio-group v-model="settings.tabsStyle" :items="[{code: 'default', name: '默认'}, {code: 'legacy', name: '传统'}]" />
        </bv-form-item>
      </bv-col>

      <bv-col>
        <bv-form-item label="每页显示条数" prop="tableLimit">
          <el-input maxlength="4" v-model.number="settings.tableLimit" />
        </bv-form-item>
      </bv-col>
    </bv-row>
  </bv-form>
</template>
  
<script>
  // import { Avatar } from 'element-ui'
  // import Cookies from 'js-cookie'
  // import defaultAvatar from '@/assets/avatar.png'
  import { modifySettings } from '@/api/authority/user'

  export default {
    name: 'UserProfile',
    /*components: {
      ElAvatar: Avatar
    },*/
    data() {
      return {
        settings: {...this.$store.getters.settings},
        // defaultAvatar,
        // imageUrl: this.$store.getters.avatar ? this.$APP_ROOT + '/file/view/' + (this.$store.getters.avatar || '') : '',
        // avatarUrl: null,
        rules: {
          tableLimit: [
            {
              type: 'number',
              message: '每页显示条数必须为数值',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    watch: {
      settings: {
        handler: function(settings) {
          this.$refs.form.validate(valid => {
            if (!valid) {
              return
            }
            modifySettings(settings).then(() => {}).catch(() => {})
            this.$nextTick(() => {
              this.$store.dispatch('user/changeSettings', settings)
            })
          })
        },
        deep: true
      }
    },
    computed: {
      /*fixedHeader: {
        get() {
          return this.$store.state.user.settings.fixedHeader
        },
        // 目前会出现js错误
        set(val) {
          this.$store.dispatch('settings/changeSetting', {
            key: 'fixedHeader',
            value: val
          })
        }
      },
      tagsView: {
        get() {
          return this.$store.state.user.settings.tagsView
        },
        set(val) {
          this.$store.dispatch('user/changeSetting', {
            key: 'tagsView',
            value: val
          })
        }
      },
      sidebarLogo: {
        get() {
          return this.$store.state.user.settings.sidebarLogo
        },
        set(val) {
          this.$store.dispatch('user/changeSetting', {
            key: 'sidebarLogo',
            value: val
          })
        }
      }*/
    },
    methods: {
      /*showDefaultAvatar() {
        this.imageUrl = defaultAvatar
      },*/
      handleAvatarSuccess(res, file) {
        this.imageUrl = URL.createObjectURL(file.raw)
        console.log(this.imageUrl)
        this.avatarUrl = res.filePath
      },
      beforeAvatarUpload(file) {
        const isPicture = file.type === 'image/jpeg' || file.type === 'image/png'
        const isLt2M = file.size / 1024 / 1024 < 2

        if (!isPicture) {
          this.$message.error('上传头像图片只能是 图片 格式!')
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!')
        }
        return isPicture && isLt2M
      }
      /*saveAvatar() {
        Cookies.set('avatar', this.avatarUrl)
        this.$store.dispatch('user/setAvatar', this.avatarUrl)
      }*/
      /*changeFixedHeader() {
        this.$nextTick(() => {
          this.$store.dispatch('user/changeSetting', {
            key: 'fixedHeader',
            value: this.settings.fixedHeader
          })
        })
      }*/
    }
  }
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  #app .avatar-uploader .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>