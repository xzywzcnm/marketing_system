<template>
  <div class="login-container">
    <div class="login-container-title-wrap">
      <div class="login-container-title">
        <img src="../../../assets/images/lapa_login_logo.png">
        <span style="font-size:18px;margin-left:10px">营销系统</span>
      </div>
    </div>
    <div class="login-container-content">
      <div class="login-bg">
        <div class="login-container-form">
          <el-form
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            auto-complete="on"
            class="login-form"
            label-position="left"
            @submit.native.prevent
          >
            <div class="login-form-title">
              账号登录
            </div>

            <el-form-item prop="username">
              <el-input
                v-model.trim="loginForm.username"
                auto-complete="on"
                name="username"
                placeholder="请输入账号"
                type="text"
              >
                <i
                  slot="prefix"
                  class="iconfont iconyonghu"
                />
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model.trim="loginForm.password"
                name="password"
                placeholder="请输入密码"
                type="password"
                @keyup.native.enter="loginSubmit($event)"
              >
                <i
                  slot="prefix"
                  class="iconfont iconlock"
                />
              </el-input>
            </el-form-item>

            <el-button
              :loading="loading"
              class="login-submit-btn"
              type="primary"
              @click="loginSubmit($event)"
            >
              登录
            </el-button>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

import { setToken } from "@/assets/scripts/token";
export default {
  name: "Login",
  data () {
    return {
      loading: false,
      loginRules: {
        username: [
          { required: true, message: "账号不能为空", trigger: "blur" },
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
        ],
      },
      loginForm: {
        username: "",
        password: "",
      },
      flag: false,
    };
  },
  methods: {
    //登录提交
    loginSubmit (event) {
      event && event.target && event.target.blur();
      this.$refs["loginForm"].validate(async (valid) => {
        if (valid) {
          this.loading = true;
          this.$store.dispatch('user/userLogin', this.loginForm).then(res => {
            setToken(res);
            this.$message.success('登录成功!');
            this.$router.push(`/`);
          }).catch(err => {
            this.$message.error(err || '登录错误，请重试!');
            this.loginForm.password = '';
          }).finally(() => {
            this.loading = false;
          })
        }
      });
    },
  },
};
</script>
<style lang="scss">
.login-form .el-form-item__content {
  line-height: 40px;
}
.login-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;

  .login-container-title-wrap {
    width: 100%;
    border-bottom: 1px solid #eee;

    .login-container-title {
      display: flex;
      width: 1200px;
      margin: 0 auto;
      height: 69px;
      display: flex;
      align-items: center;
    }
  }

  .login-container-content {
    /* border-top: 1px solid #EEEEEE; */
    height: 620px;
    min-height: 620px;
    background: url("../../../assets/images/bg.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;

    .login-bg {
      width: 540px;
      // background: url("../../../assets/images/bg2.png");
      background-size: auto;
      background-repeat: no-repeat;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-container-form {
      position: relative;
      margin: 0 auto;

      .login-form {
        width: 360px;
        padding: 30px 30px 50px 30px;
        background: #fff;
        color: #333333;
        border-radius: 2px;

        .el-input__inner {
          height: 44px;
          line-height: 44px;
        }

        .el-input__prefix {
          left: 10px;
          top: 2px;
        }

        .login-form-title {
          font-size: 24px;
          font-weight: 500;
          color: #555;
          margin-bottom: 38px;
          text-align: center;
        }

        .el-form-item--medium .el-form-item__content,
        .el-form-item--medium .el-form-item__label {
          line-height: 44px;
        }

        .el-input--medium .el-input__inner {
          height: 44px;
        }

        .rememberMe {
          margin-bottom: 40px;

          .el-form-item__content,
          .el-form-item__label {
            line-height: 14px;
            height: 14px;
          }
        }

        .login-submit-btn {
          width: 100%;
          height: 44px;
        }
      }
    }
  }

  .pms-message {
    text-align: center;
    color: #606266 !important;
    margin-top: 10px;
    margin-bottom: 10px;

    .pms-footer-text:hover {
      color: #f60;
      text-decoration: underline;
    }
  }
}
</style>
<style type="text/css">
@media screen and (max-height: 768px) {
  .login-container > .login-container-content {
    height: 580px;
    min-height: 580px;
  }

  .login-container .login-container-content .login-container-form .login-form {
    top: 70px;
  }
}

@media screen and (max-height: 665px) {
  .login-container > .login-container-content {
    height: 480px;
    min-height: 480px;
  }

  .login-container .login-container-content .login-container-form .login-form {
    top: 30px;
  }
}
</style>
