<template>
  <div class="errPage-container">
    <el-row>
      <el-col :span="12">
        <!-- <h1 class="text-jumbo text-ginormous">
          抱歉，登录已超时!
        </h1> -->
        <h1 style="margin-bottom: 10px">
          抱歉，你没有该页面权限，无法访问!
        </h1>
        <span style="margin-top: 25px;font-size: 15px;">
          你可以点击 返回首页 或 重新登录 切换账号！
        </span>
        <div style="margin-top: 35px; padding-left: 30px;">
          <!-- <a
            class="bullshit__return-home"
            href="/"
          >返回首页</a> -->
          <el-button type="primary" @click="goToPageHome">
            返回首页
          </el-button>
          <el-button type="primary" @click="loginOut">
            重新登录
          </el-button>
        </div>
      </el-col>
      <el-col :span="12">
        <img :src="errGif" alt="Girl has dropped her ice cream." height="428" width="313">
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Vue from 'vue';
import { Button, Row, Col } from 'element-ui';
import errGif from '@/assets/images/403.gif';
import connectAuth from '@/utils/connectAuth';

Vue.use(Button);
Vue.use(Row);
Vue.use(Col);

export default {
  name: 'Path403',
  data() {
    return {
      errGif: errGif + '?' + +new Date(),
      ewizardClap: 'https://wpimg.wallstcn.com/007ef517-bafd-4066-aae4-6883632d9646',
    };
  },
  methods: {
    loginOut() {
      connectAuth.outLogin();
    },
    goToPageHome() {
      const location = window.location;
      window.location.href = `${location.origin}${location.pathname}`;
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.errPage-container {
  width: 800px;
  max-width: 100%;
  margin: 100px auto;

  .pan-back-btn {
    background: #008489;
    color: #fff;
    border: none !important;
  }

  .pan-gif {
    margin: 0 auto;
    display: block;
  }

  .pan-img {
    display: block;
    margin: 0 auto;
    width: 100%;
  }

  .text-jumbo {
    font-size: 46px;
    font-weight: 700;
    color: #484848;
    margin-bottom: 10px;
  }

  .list-unstyled {
    font-size: 16px;
    font-weight: bolder;
    margin-top: 10px;

    li {
      padding-bottom: 5px;
    }

    a {
      color: #008489;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
