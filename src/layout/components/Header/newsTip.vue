<template>
  <div class="newsTipPage">
    <el-popover placement="bottom" width="430" trigger="click" popper-class="poper-newsTipPage"
      @show="popoverChange('show')" @hide="popoverChange('hide')">
      <div class="tips-content">
        <div class="tips-item">
          <ul class="tips-ul">
            <li v-for="(item, index) in newList" :key="index" class="tips-lis">
              <div class="lis-content">
                <div v-if="item.isRead === 0" class="new">
                  NEW
                </div>
                <div class="content">
                  <span v-if="typeList[item.type]" class="titles">{{ typeList[item.type].label }}</span>
                  <!-- 0未完成、2任务丢失------子链接数量用预估链接总数量（estimateLinkTotal） -->
                  <!-- 1完成-----子链接数量用修改链接总数量（modifyLinkTotal） -->
                  <span>
                    子链接数量：
                    {{ item.status === 1 ? (item.modifyLinkTotal || 0) : (item.estimateLinkTotal || 0) }}
                  </span>
                </div>
                <div class="times">
                  <span>创建时间：{{ item.gmtCreate }}</span>
                  <div style="width:176px;text-align:left;">
                    <span v-if="item.status === 1">完成时间：{{ item.finishTime }}</span>
                    <span v-if="item.status === 2" style="color:#f56c6c;">执行失败</span>
                    <span v-if="item.status === 0">执行中</span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="remind">
          {{ newList.length ? '最多保留三天内的消息' : '暂无消息' }}
        </div>
      </div>
      <span slot="reference" class="lapa icon-msg lapaIcons newIcon">
        <span v-if="newsNum" class="newsNum">{{ newsNum }}</span>
      </span>
    </el-popover>
  </div>
</template>
<script>
export default {
  name: "NewsTip",
  data() {
    return {
      listParmas: {
        pageNum: 1,
        pageSize: 99999,
      },
      newList: [],//所有消息列表
      unReadList: [],//未读列表
      typeList: {
        1: { label: '售价估算', value: 1 },
        2: { label: '修改价格', value: 2 },
      },
      timeInfo: {
        timerFlag: null,//定时器标志
        frequency: 0,//调用次数
        windowOpen: true,//当前窗口是否激活
        finish: false,//结束调用
      },
    }
  },
  computed: {
    newsNum() {
      let num = this.unReadList.length;
      if (num > 99) num = '99+';
      return num;
    },
  },
  created() {
    this.getList();
    this.$bus.on('marketing-admin-newsTip', this.changeList);//接收操作更新
    this.$bus.on('marketing-admin-newsTipList', this.getNewsList);//接收消息信息

    window.addEventListener('focus', this.windowFocus);
    window.addEventListener('blur', this.windowBlur);
    this.$once('hook:beforeDestory', () => {
      window.removeEventListener('focus', this.windowFocus);
      window.removeEventListener('blur', this.windowBlur);
      this.clearTime();
    })
  },
  methods: {
    // 更新并设置当前定时器的进度
    setLocal() {
      let { finish, frequency } = this.timeInfo;
      let temp = { finish, frequency };
      localStorage.setItem('timeInfo', JSON.stringify(temp));
    },
    // 停止刷新
    stopGet() {
      this.timeInfo.finish = true;//更新完成
      this.timeInfo.frequency = 0;
      this.setLocal();
      this.timeInfo.timerFlag && this.clearTime();
    },
    // 窗口聚焦
    windowFocus() {
      this.timeInfo.windowOpen = true;
      let data = localStorage.getItem('timeInfo');
      if (data) {
        let timeInfo = JSON.parse(data);
        this.timeInfo.finish = timeInfo.finish || false;
        this.timeInfo.frequency = timeInfo.frequency || 0;
        this.setLocal();
      }
      !this.timeInfo.finish && this.getList();
    },
    // 窗口丢失，移除定时器
    windowBlur() {
      this.timeInfo.windowOpen = false;
    },
    // 广播收到最新列表
    getNewsList(list) {
      this.newList = list;
      this.unReadList = list.filter(k => { return k.isRead === 0 });
      this.timeInfo.total = list.length;
    },
    // 以最新为主，刷新列表，超过30分钟停止
    changeList() {
      this.timeInfo.finish = false;
      this.timeInfo.frequency = 0;//重置刷新次数
      this.setLocal();
      this.timeInfo.windowOpen && this.getList();
    },
    clearTime() {
      clearTimeout(this.timeInfo.timerFlag);
      this.timeInfo.timerFlag = null;
    },
    getList() {
      this.clearTime();//清除定时器

      this.$http({
        method: 'get',
        url: this.api.common.noticeTaskList,
        params: this.listParmas,
        ignoreMessage: true,//忽略报错
      }).then(({ data }) => {
        let list = data.list || [];
        this.$bus.emit('marketing-admin-newsTipList', list);//广播消息列表

        if (!this.timeInfo.windowOpen) return;//窗口关闭不再调用

        let unfinishList = list.filter(k => { return k.status === 0 });//执行中的任务
        if (this.timeInfo.total < list.length || unfinishList.length) {
          // 超过半个小时
          if (this.timeInfo.frequency >= 100 * 6) {
            this.stopGet();
            return false;
          }
          this.timeInfo.timerFlag = setTimeout(() => {
            this.getList();
            this.timeInfo.finish = false;
            this.timeInfo.frequency++;
            this.setLocal();
            // }, 3000);
          }, 30000);
        } else {
          this.stopGet();
        }
      }).catch(() => {
        //报错不再调用
        this.stopGet();
      })
    },
    popoverChange(e) {
      let _self = this;
      let fun = {
        show() { },
        hide() {//标记已读
          let list = _self.unReadList.map(k => { return k.id });
          if (!list.length) return;
          _self.clearTime();//清除定时器
          _self.$http.post(_self.api.common.noticeTaskUpdateRead, list).then(() => {
            _self.getList();
          })
        }
      }
      fun[e] && fun[e]();
    }
  },
};
</script>
<style lang="scss">
.newsTipPage {
  margin-right: 30px;

  .newIcon {
    position: relative;
    cursor: pointer;
    font-weight: bold;
    font-size: 18px;

    .newsNum {
      position: absolute;
      top: -50%;
      right: 0%;
      height: 18px;
      line-height: 18px;
      font-size: 12px;
      display: inline-block;
      color: white;
      padding: 0 6px;
      border-radius: 10px;
      white-space: nowrap;
      background-color: #f56c6c;
      transform: scale(.8) translateX(60%);
    }
  }
}

.poper-newsTipPage {
  padding: 0;
  max-height: 600px;
  overflow: auto;

  /*滚动条样式*/
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgba(245, 247, 250, 0.1);
  }

  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 0;
    background: rgba(245, 247, 250, 0.1);
  }

  .tips-content {
    .tips-item {
      padding: 0 10px;

      .tips-lis {
        padding: 6px 0;
        border-bottom: 1px solid #dcdfe6;
      }
    }

    .lis-content {
      .new {
        font-size: 12px;
        font-weight: bold;
        color: #f56c6c;
        font-style: italic;
      }

      .content {
        padding: 2px 0;

        .titles {
          font-weight: bold;
          margin-right: 20px;
        }
      }

      .times {
        font-size: 12px;

        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }

    .remind {
      text-align: center;
      font-size: 12px;
      color: #c0c4cc;
      padding: 10px 0;
    }
  }
}
</style>