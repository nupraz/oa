<template>
  <el-header :height="variables.headerHeight" class="navbar">
    <bv-hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <bv-breadcrumb id="breadcrumb-container" class="app-breadcrumb breadcrumb-container" />

    <el-tooltip v-show="$route.meta && $route.meta.help" content="使用说明" effect="dark" placement="bottom">
      <div id="help-container" @click="dialogHelpVisible = true">
        <bv-icon icon-class="help" />
      </div>
    </el-tooltip>

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <el-tooltip content="全局检索" effect="dark" placement="bottom">
          <bv-header-search id="header-search" class="right-menu-item header-search" />
        </el-tooltip>
        <el-tooltip :content="$store.getters.screenfull ? '退出全屏' : '全屏'" effect="dark" placement="bottom">
          <bv-screenfull id="screenfull" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <el-avatar :size="40" :src="avatarUrl">
            <img :src="defaultAvatar">
          </el-avatar>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item>
            <span style="display:block;" @click="startModifyPassword">修改密码</span>
          </el-dropdown-item>
          <router-link to="/user/profile">
            <el-dropdown-item>
              用户中心
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <bv-dialog title="修改密码" :visible.sync="modifyPasswordVisible" width="450px" @close="onDialogClose">
      <bv-form ref="passwordForm" :inline="false" :model="item" :rules="rules">
        <bv-form-item label="原密码" prop="password">
          <el-input
            v-model="item.password"
            placeholder="原密码"
            type="password"
          />
        </bv-form-item>
        <bv-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="item.newPassword"
            placeholder="新密码"
            type="password"
          />
        </bv-form-item>
        <bv-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="item.confirmPassword"
            placeholder="确认密码"
            type="password"
          />
        </bv-form-item>
      </bv-form>
      <div slot="footer">
        <bv-button view="save" @click="savePassword">保存</bv-button>
        <bv-button view="cancel" @click="modifyPasswordVisible = false">取消</bv-button>
      </div>
    </bv-dialog>
    <el-dialog :visible.sync="dialogHelpVisible" top="5vh" width="1200px" @close="dialogHelpVisible = false">
      <el-scrollbar>
        <bv-help :path="$route.meta && $route.meta.help && require('@/assets/help/' + $route.meta.help)" />
      </el-scrollbar>
    </el-dialog>
  </el-header>
</template>

<script>
import { mapGetters } from 'vuex'
import { Avatar } from 'element-ui'
import { Breadcrumb, Screenfull, HeaderSearch } from '@bestvike/components'
import { modifyPassword } from '@/api/authority'
import variables from '@/styles/variables.scss'
import defaultAvatar from '@/assets/avatar.png'

export default {
  name: 'BvNavbar',
  components: {
    ElAvatar: Avatar,
    BvBreadcrumb: Breadcrumb,
    BvScreenfull: Screenfull,
    BvHeaderSearch: HeaderSearch
  },
  data() {
    const checkConfirmPassword = (rule, value, callback) => {
      if (value !== this.item.newPassword) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    }

    return {
      avatarUrl: '',
      defaultAvatar,
      modifyPasswordVisible: false,
      dialogHelpVisible: false,
      item: {
        password: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少为6位', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码至少为6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请输入确认密码', trigger: 'blur' },
          { min: 6, message: '密码至少为6位', trigger: 'blur' },
          { validator: checkConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'name',
      'avatar',
      'device'
    ]),
    variables() {
      return variables
    }
  },
  watch: {
    avatar() {
      this.avatarUrl = this.$APP_ROOT + '/file/view/' + this.avatar
    }
  },
  mounted() {
    if (this.avatar) {
      this.avatarUrl = this.$APP_ROOT + '/file/view/' + this.avatar
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      const loading = this.$loading()
      await this.$store.dispatch('user/logout')
      loading.close()
      this.$router.push('/login')
    },
    onDialogClose() {
      this.modifyPasswordVisible = false
      // this.item.password = null
      // this.item.newPassword = null
      // this.item.confirmPassword = null
      this.$refs.passwordForm.resetFields()
    },
    startModifyPassword() {
      this.modifyPasswordVisible = true
    },
    savePassword() {
      this.$refs.passwordForm.validate((valid) => {
        if (!valid) {
          return false
        }
        modifyPassword({...this.item}).then(() => {
          this.modifyPasswordVisible = false
          this.$refs.passwordForm.resetFields()
        }).catch(() => {})
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.navbar {
  height: $headerHeight;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container, #help-container {
    line-height: $headerHeight;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  #help-container {
    width: 40px;
    text-align: center;
  }

  .breadcrumb-container {
    float: left;
    line-height: $headerHeight;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: $headerHeight;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
