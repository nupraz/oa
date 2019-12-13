<template>
  <div class="login-container">
    <div class="login-header">
      <div class="logo"><img :src="logoUrl"></div>
      <div class="mission">努力超越&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;追求卓越</div>
    </div>
    <div class="login-banner">
      <el-carousel trigger="click" :interval="5000">
        <el-carousel-item v-for="item in banners" :key="item">
          <img :src="item">
        </el-carousel-item>
      </el-carousel>
    </div>
    <div class="login-form">
      <bv-form ref="loginForm" :inline="false" label-width="0" :model="loginForm" :rules="loginRules" autocomplete="on">
        <bv-form-item prop="id" class="item-container">
          <span class="svg-container">
            <bv-icon icon-class="user" />
          </span>
          <el-input
            v-model="loginForm.id"
            placeholder="账号"
            name="id"
            type="text"
            autocomplete="on"
            tabindex="1"
          />
        </bv-form-item>

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
            tabindex="3"
            :maxlength="passtokenLength"
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
              tabindex="4"
            />
          </el-col>
          <el-tooltip content="点击刷新">
            <el-col :span="6" class="validate-code-container">
              <img :src="validateCodeUrl" @click="refreshValidateCode">
            </el-col>
          </el-tooltip>
        </bv-form-item>

        <el-button :loading="loading" type="primary" tabindex="5" @click.native.prevent="handleLogin($event, 'click')">登录</el-button>
      </bv-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Carousel, CarouselItem } from 'element-ui'
import { validate } from '@bestvike/utils'
import logoUrl from '@/assets/login/logo.png'
import banner1 from '@/assets/login/banner1.png'
import banner2 from '@/assets/login/banner2.png'
import banner3 from '@/assets/login/banner3.png'

export default {
  name: 'Login',
  components: {
    ElCarousel: Carousel,
    ElCarouselItem: CarouselItem
  },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validate.validUsername(value)) {
        callback(new Error('请输入正确的账号'))
      } else {
        callback()
      }
    }
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
      banners: [
        banner1,
        banner2,
        banner3
      ],
      logoUrl,
      // needValidateCode: false,
      validateCodeUrl: this.$APP_ROOT+'/api/authority/code?t=' + new Date().getTime(),
      loginType: process.env.VUE_APP_LOGINTYPE,
      loginForm: {
        id: '',
        password: '',
        passtoken: '',
        validateCode: ''
      },
      loginRules: {
        id: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        passtoken: [{ required: true, trigger: 'blur', validator: validatePasstoken }]
      },
      // 最大密码长度
      passwordLength: 20,
      passtokenLength: 7,
      capsTooltip: false,
      loading: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  computed: {
    ...mapGetters([
      'needValidateCode',
      'needRefreshValidateCode'
    ])
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
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
    handleLogin(event, from) {
      if (!from && this.needValidateCode) {
        return
      }
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              /*console.log(routes)
              if (this.redirect && this.redirect !== '/' && this.redirect !== '/dashboard' && routes && routes.indexOf()) {

              }*/
              this.$router.push({ path: this.redirect || '/dashboard', query: this.otherQuery })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
              if (this.needRefreshValidateCode) {
                this.refreshValidateCode()
              }
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss">
  /* 修复input 背景不协调 和光标变色 */
  /* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

  /*$bg:#283443;
  $light_gray:#999999;
  $cursor: #999999;

  @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
    .login-container .el-input input {
      color: $cursor;
      &::first-line {
        color: $light_gray;
      }
    }
  }*/

  /* reset element-ui css */
  .login-container {
    .validate-code-container {
      text-align: center;

      > img {
        padding-top: 6px;
      }
    }
  }
  .login-banner {
    width: 100%;
    height: 560px;

    .el-carousel__container {
      height: 560px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  @media only screen and (max-width: 1280px) {
    .login-banner {
      height: 500px;

      .el-carousel__container {
        height: 500px;
      }
    }
  }
</style>
<style lang="scss" scoped>

$layout_width: 1200px;

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;

  > .login-header {
    width: $layout_width;
    height: 50px;
    display: flex;
    justify-content: space-between;

    > img {
      height: 38px;
    }
    > .mission {
      line-height: 50px;
      color: #333744;
    }
  }
  > .login-form {
    width: 1200px;
    position: absolute;
    left: 50%;
    margin-left: -600px;
    top: 50%;
    margin-top: -125px;
    display: flex;
    justify-content: flex-end;
    z-index: 3000;

    > .el-form {
      padding: 30px;
      width: 410px;
      overflow: hidden;
      // margin-top: -110px;
      background: #ffffff;
      border-radius: 5px;

      > .el-button--medium {
        width: 100%;
        padding: 15px 20px;
      }
    }
  }
  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
