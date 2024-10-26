<template>
  <header class="global_head">
    <div class="global_head__main">
      <div class="head__main__left">
        <img src="../../assets/images/lapa_logo.png">
        <span>营销系统</span>
      </div>
      <div class="global_userMsg">
        <div class="global_userMsg__left" />
        <div class="global_userMsg__right">
          <div class="backUsercenter" @click="goToLapa">
            <span class="lapa icon-fanhui headerIcon mr6" />
            <span>返回认证中心</span>
          </div>
          <news-tip />
          <downloadView />
          <el-dropdown class="globalUserName" @command="handleCommand">
            <div class="el-dropdown-link">
              <span class="lapa icon-yonghu headerIcon mr10" />
              {{ userName }}
              <i class="userOpera el-icon-caret-bottom" />
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="exitEvent">
                退出
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
  </header>
</template>
<script>
import { mapGetters } from "vuex";
import newsTip from './Header/newsTip';
import connectAuth from '@/utils/connectAuth';
import downloadView from './Header/downloadView';

export default {
  name: "Header",
  components: { downloadView, newsTip },
  data() {
    return {
      username: ''
    };
  },
  computed: {
    ...mapGetters(["userInfo"]),
    newsNum() {
      let num = 9;
      if (num > 99) num = '99+';
      return num;
    },
    userName() {
      let userInfo = this.userInfo || {};
      let securityUser = userInfo.securityUser || {};
      return securityUser.name || userInfo.username || userInfo.loginName;
    },
  },
  watch: {
    $route: {//监听路由
      handler(val, oldval) {
        // this.routePath = val.path;
        // console.log(this.userInfo)
      },
      deep: true
    },
  },
  methods: {
    // 下拉菜单
    handleCommand(command) {
      if (command === "exitEvent") {
        this.exitEvent();
      }
    },
    goToLapa() {
      connectAuth.backOauth();
    },
    // 退出
    async exitEvent() {
      // await this.$store.dispatch("user/logout");
      // this.$router.push(`/login`);
      connectAuth.outLogin();
    },
  },
};
</script>
<style lang="scss" scoped>
$sidebarWidth: 240px; //侧边栏宽度

@mixin flex {
  display: flex;
  align-items: center;
}

.global_head,
.global_head__main,
.global_userMsg,
.head__main__left,
.userMsg__left__block,
.global_userMsg__left {
  height: 100%;
}

.global_userMsg__right {
  height: 100%;

  .backUsercenter {
    display: flex;
    align-items: center;
    padding: 6px 14px;
    margin: 0 30px 0 10px;
    border-radius: 14px;
    cursor: pointer;

    &:hover {
      background: rgba(216, 216, 216, 0.22);
    }

    .icon {
      height: 22px;
      margin-right: 0px;
    }
  }

  .headerIcon {
    font-size: 18px;
  }

  .icon-yonghu {
    font-weight: bold;
  }

  .mr6 {
    height: 22px;
    margin-right: 6px;
  }
}

.global_head {
  background: #fff;
  color: #515a6e;

  .global_head__main {
    @include flex;
    justify-content: space-between;

    .head__main__left {
      @include flex;
      font-size: 16px;
      padding-left: 20px;
      width: $sidebarWidth;
      background: #00cdb5;

      >img {
        width: 66px;
        height: auto;
        margin-right: 10px;
      }

      >span {
        color: #ffffff;
      }
    }
  }

  .lapaIcons {
    font-size: 18px;
    margin-right: 6px;
  }
}

.global_userMsg {
  flex: 1;
  @include flex;
  justify-content: space-between;
  padding-right: 16px;
  box-shadow: 0 1px 5px 1px #ccc;

  .global_userMsg__left {
    @include flex;

    .userMsg__left__block {
      width: 80px;
      @include flex;
      justify-content: center;
      cursor: pointer;
    }

    .userMsg__left__block--active {
      background: #f13c3c;
    }
  }

  .global_userMsg__right {
    @include flex;
  }
}

.globalUserName {
  >div {
    cursor: pointer;
    outline: 0;
  }

  .userOpera {
    margin-left: 6px;
    vertical-align: middle;
  }

  .el-dropdown-link {
    display: flex;
    align-items: center;

    .usericon {
      font-size: 20px;
    }
  }
}
</style>