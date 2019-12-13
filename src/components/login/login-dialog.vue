<template>
  <bv-dialog title="登录" width="480px" :visible.sync="needLogin">
    <bv-form ref="loginForm" class="login-form" :inline="false" label-width="0" :model="loginForm" :rules="loginRules">
      <el-tooltip v-if="loginType === 'password' || loginType === 'any' || loginType === 'both'" v-model="capsTooltip" content="大小写锁定键已打开" placement="right" manual>
        <bv-form-item prop="password" class="item-container">
          <span class="svg-container">
            <bv-icon icon-class="password" />
          </span>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            name="password"
            :show-password="true"
            tabindex="2"
            :maxlength="passwordLength"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
          />
        </bv-form-item>
      </el-tooltip>
      <bv-form-item v-if="loginType === 'passtoken' || loginType === 'both'" prop="passtoken" class="item-container">
        <span class="svg-container">
          <bv-icon icon-class="password" />
        </span>
        <el-input
          v-model="loginForm.passtoken"
          type="password"
          placeholder="动态密码"
          name="passtoken"
          :show-password="true"
          tabindex="2"
          :maxlength="passtokenLength"
          @keyup.native="checkCapslock"
          @blur="capsTooltip = false"
        />
      </bv-form-item>

      <bv-form-item v-if="needValidateCode" prop="validateCode">
        <el-col :span="18" class="item-container">
          <span class="svg-container">
            <bv-icon icon-class="validateCode" />
          </span>
          <el-input
            v-model="loginForm.validateCode"
            placeholder="校验码"
            name="validateCode"
            type="text"
            tabindex="3"
          />
        </el-col>
        <el-tooltip content="点击刷新">
          <el-col :span="6" class="validate-code-container">
            <img :src="validateCodeUrl" @click="refreshValidateCode">
          </el-col>
        </el-tooltip>
      </bv-form-item>
      <el-button style="display:none" @click.native.prevent="doLogin">登录</el-button>
    </bv-form>
    <div slot="footer">
      <bv-button :loading="loading" type="primary" tabindex="4" view="save" @click.native.prevent="doLogin">登录</bv-button>
      <bv-button view="cancel" @click="cancelLogin">取消</bv-button>
    </div>
  </bv-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'LoginDialog',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码至少为6位'))
      } else {
        callback()
      }
    }
    const validatePasstoken = (rule, value, callback) => {
      if (value.length !== 7) {
        callback(new Error('动态密码必须为7位'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        id: '',
        password: '',
        validateCode: ''
      },
      loginRules: {
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        passtoken: [{ required: true, trigger: 'blur', validator: validatePasstoken }]
      },
      passtokenType: 'password',
      // 最大密码长度
      passwordLength: 20,
      passtokenLength: 7,
      capsTooltip: false,
      validateCodeUrl: this.$APP_ROOT + '/api/authority/code?t=' + new Date().getTime(),
      loginType: process.env.VUE_APP_LOGINTYPE,
      loading: false
    }
  },
  computed: {
    ...mapGetters([
      'needValidateCode',
      'needRefreshValidateCode'
    ]),
    needLogin: {
      get() {
        return this.$store.state.app.needLogin
      },
      set() {
        this.$store.dispatch('app/triggerLogin', false)
      }
    }
  },
  methods: {
    refreshValidateCode() {
      this.validateCodeUrl =this.$APP_ROOT+ '/api/authority/code?t=' + new Date().getTime()
      this.loginForm.validateCode = ''
    },
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    doLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          if (!this.loginForm.id) {
            this.loginForm.id = this.$store.state.user.id
          }
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              // this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
              this.$store.dispatch('app/confirmLogin')
              this.loginForm.password = ''
            })
            .catch(() => {
              this.loading = false
              if (this.needRefreshValidateCode) {
                this.refreshValidateCode()
              }
            })
        } else {
          return false
        }
      })
    },
    cancelLogin() {
      this.$store.dispatch('app/cancelLogin')
      this.loginForm.password = ''
    }
  }
}
</script>