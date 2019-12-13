<template>
  <div class="psd-div-1" ref="div1" id="div1">
    密码1&nbsp;&nbsp;&nbsp;
    <input type="text" placeholder="请输入密码"  ref="input1" class="psd-input-1" id="psd1" />
    <br/><br/>
    密码2&nbsp;&nbsp;&nbsp;
    <input type="text" placeholder="请输入密码"  ref="input2" class="psd-input-1" />
    <br/><br/>
    <br/>
    <button class="psd-btn-1" @click="changePsd">提&nbsp;&nbsp;交</button>
  </div>
</template>

<script type="text/javascript">
  import CryptoJS from 'crypto-js'
  import { JSEncrypt } from 'jsencrypt'
  export default {
  name: 'psdChange',
    methods: {
      changePsd() {
        let result1 = this.$refs.input1.value;
        let result3 = this.$refs.input2.value;
        let result2=CryptoJS.enc.Utf8.parse(result1);
        // 实例化一个JSEncrypt对象
        let jse = new JSEncrypt();
        // 加密result3
        let encrypted = jse.encrypt(result3);
        // 输出加密结果
        // 解密加密过的字符串
        let decrypted = jse.decrypt(encrypted);
        // 打印结果,应为result3
        this.$message({
          message:"加密后的密码1是:"+result2+"\r\n加密后的密码2是:"+encrypted+"\r\n解密后的密码2是:"+decrypted,
          type:'success'
        }
        )
      }
    }
  }

</script>

<style lang="scss">
  .psd-div-1{
    margin-left: 20px;
    margin-top: 20px;
  }
  .psd-input-1{
    border-radius: 7px;
    border: 1px solid #d9d9d9;
    padding-left: 20px;
    outline: none;
  }
  .psd-btn-1{
    margin-left: 110px;
    margin-top: 20px;
    border-radius: 7px;
    outline: none;
    background-color: #00cfc9;
    height: 35px;
    width: 84px;
    color: white;
    border:none
  }
</style>
