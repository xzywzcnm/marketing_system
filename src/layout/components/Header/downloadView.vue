<template>
  <div class="download-view">
    <el-popover v-model="downloadViewVisible" placement="bottom-end" width="800" trigger="manual" :offset="200"
      popper-class="downloadPopover">
      <div class="download-view-table">
        <div class="download-view-title">
          <div class="popoverTitle">
            <span class="title">今日离线导出任务</span>
            <div>
              <el-button type="primary" size="mini" :loading="pageLoading" @click="getList">
                刷 新
              </el-button>
              <span class="lapa icon-close closeIcon" @click="showDownloadList(false)" />
            </div>
          </div>
        </div>
        <el-table v-loading="pageLoading || downLoading" :data="tableData" border max-height="400">
          <el-table-column label="导出类型" width="110">
            <template slot-scope="{row}">
              {{ exportType[row.type] && exportType[row.type].label }}
            </template>
          </el-table-column>
          <el-table-column prop="fileName" label="文件名" min-width="160" />
          <el-table-column prop="createName" label="导出人" min-width="100" />
          <el-table-column label="导出时间" width="140">
            <template slot-scope="{row}">
              <div>{{ row.gmtCreate || "-" }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="{row}">
              <span v-if="statuslist[row.status]" :style="{ color: statuslist[row.status].color }">
                {{ statuslist[row.status].label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60">
            <template slot-scope="{row}">
              <el-button v-if="row.status == 1" type="text" @click="downLoad(row)">
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="btnAuth.includes('exportManage_export')" slot="reference" title="今天的离线导出任务" class="referenceFooter"
        @click="showDownloadList(!downloadViewVisible)">
        <span class="lapa icon-xiazaidaoru blueIcon" style="font-size: 18px;" />
        <span class="view-download-total">({{ timeInfo.total }})</span>
      </div>
    </el-popover>
  </div>
</template>

<script>
import FetchFun from '@/utils/listPage';
import { exportType } from '@/layout/components/fileData';
export default {
  name: "DownloadView",
  data() {
    return {
      downloadViewVisible: false,
      tableData: [],
      // total: 0,
      pageLoading: false,
      statuslist: {
        0: { label: '导出中', value: 0 },
        1: { label: '导出成功', value: 1 },
        2: { label: '导出失败', value: 2, color: '#F56C6C' },
      },
      exportType: exportType,
      searchOptions: {
        startExportTime: '',
        endExportTime: '',
        pageSize: 99999,
        pageNum: 1
      },
      // frequency: 0,
      // countDown: null,
      // haveInHandDown: null,
      // nextDayRest: null,
      downLoading: false,

      timeInfo: {
        timerFlag: null,//定时器标志
        frequency: 0,//调用次数
        windowOpen: true,//当前窗口是否激活
        finish: false,//结束调用
      },
    }
  },
  computed: {
    btnAuth() {
      let permissionsIds = this.$store.getters['permissionsIds'];
      return permissionsIds;
    },
  },
  created() {
    this.initData();
    this.$bus.on('marketing-admin-headDownloadView', this.changeList);//接收操作更新
    this.$bus.on('marketing-admin-headDownloadList', this.getNewsList);//接收消息信息

    window.addEventListener('focus', this.windowFocus);
    window.addEventListener('blur', this.windowBlur);
    this.$once('hook:beforeDestory', () => {
      window.removeEventListener('focus', this.windowFocus);
      window.removeEventListener('blur', this.windowBlur);
      this.clearTime();
    })
  },
  methods: {
    initData() {
      const tDay = this.$common.dayjs().format('YYYY-MM-DD');
      this.searchOptions['minGmtCreate'] = `${tDay} 00:00:00`;
      this.searchOptions['maxGmtCreate'] = `${tDay} 23:59:59`;
      this.getList();
    },
    // 更新并设置当前定时器的进度
    setLocal() {
      let { finish, frequency } = this.timeInfo;
      let temp = { finish, frequency };
      localStorage.setItem('exportInfo', JSON.stringify(temp));
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
      let data = localStorage.getItem('exportInfo');
      if (data) {
        let timeInfo = JSON.parse(data);
        this.timeInfo.finish = timeInfo.finish || false;
        this.timeInfo.frequency = timeInfo.frequency || 0;
        this.setLocal();
      }
      !this.timeInfo.finish && this.getList('update');
    },
    // 窗口丢失，移除定时器
    windowBlur() {
      this.timeInfo.windowOpen = false;
    },
    // 广播收到最新列表
    getNewsList(list) {
      this.tableData = list;
      this.timeInfo.total = list.length;
    },
    // 展示类别弹窗
    showDownloadList(val) {
      this.downloadViewVisible = val;
    },
    // 其他地方改变时候
    changeList() {
      this.timeInfo.finish = false;
      this.timeInfo.frequency = 0;//重置刷新次数
      this.setLocal();
      this.timeInfo.windowOpen && this.getList('update');
      // if (this.countDown) {
      //   clearInterval(this.countDown);
      //   this.frequency = 0
      // }
      // this.getDownloadList('update');
      // this.countDown = setInterval(() => {
      //   this.getDownloadList('update');
      //   this.frequency++;
      //   //  设置半个小时候自动停止刷新
      //   if (this.frequency > 100 * 6) {
      //     clearInterval(this.countDown);
      //     this.frequency = 0;
      //   }
      // }, 1000 * 3);
    },
    clearTime() {
      clearTimeout(this.timeInfo.timerFlag);
      this.timeInfo.timerFlag = null;
    },
    // 获取列表数据
    getList(val) {
      this.clearTime();//清除定时器
      // const tDay = this.$common.dayjs().format('YYYY-MM-DD');
      // const nextRestTime = this.$common.dayjs(`${tDay} 23:59:59`).add(2, 'second');
      // const diffTime = nextRestTime.diff(this.$common.dayjs(), 'millisecond');

      // // 每次请求之后重新计算，设置 0 点时刷新列表数据
      // clearTimeout(this.nextDayRest);
      // this.nextDayRest = setTimeout(() => { this.getDownloadList('update'); }, diffTime);
      // if (val !== 'update' && this.pageLoading) return;

      let reqParams = FetchFun.returnSearchOptions(this.searchOptions, "post");
      let mapi = this.api.export.reconReportList + reqParams.params;

      this.pageLoading = val !== 'update';
      this.$http({
        method: 'post',
        url: mapi,
        data: reqParams.data,
        ignoreMessage: true,//忽略报错
      }).then(({ data }) => {
        let list = data.list || [];
        this.$bus.emit('marketing-admin-headDownloadList', list);//广播消息列表
        if (!this.timeInfo.windowOpen) return;//窗口关闭不再调用
        let unfinishList = list.filter(k => { return k.status === 0 });//执行中的任务
        if (this.timeInfo.total < list.length || unfinishList.length) {
          // 超过半个小时
          if (this.timeInfo.frequency >= 100 * 6) {
            this.stopGet();
            return false;
          }
          this.timeInfo.timerFlag = setTimeout(() => {
            this.getList('update');
            this.timeInfo.finish = false;
            this.timeInfo.frequency++;
            this.setLocal();
            // }, 3000);
          }, 30000);
        } else {
          this.stopGet();
        }
        // this.haveInHandDown && clearTimeout(this.haveInHandDown);
        // if (res.status === 200) {
        //   let haveInHand = [];
        //   this.tableData = res.data.list.map(m => {
        //     if (m.status == 0) {
        //       haveInHand.push(m.status);
        //     }
        //     return { ...m, downFileLoading: false }
        //   });
        //   if (this.total !== res.data.total && this.countDown) {
        //     this.frequency = 0;
        //     clearInterval(this.countDown);
        //     this.haveInHandDown = setTimeout(() => {
        //       if (haveInHand.length > 0) {
        //         this.getDownloadList('update');
        //       }
        //     }, 1000 * 3);
        //   } else if (haveInHand.length > 0) {
        //     this.haveInHandDown = setTimeout(() => {
        //       this.getDownloadList('update');
        //     }, 1000 * 3)
        //   }
        //   this.total = res.data.total;
        // }
      }).catch(() => {
        this.stopGet();// 报错不再调用
      }).finally(() => {
        this.pageLoading = false;
      });
    },
    // 导出
    downLoad(row) {
      this.downLoading = true;
      this.$http({
        type: 'get',
        url: this.api.export.downLoadExcel,
        params: { id: row.id },
        // responseType: 'blob',
        timeout: 600000,
      }).then(res => {
        if (res.status !== 200) return;
        // let { resData, filename } = res.data || {};
        // this.$common.downFile(resData, filename);
        if (!res.data) {
          this.$message.error("文件路径缺失，请联系管理员~");
          return;
        }
        this.$common.downLink(res.data);
        this.$message.success('导出成功');
      }).finally(() => {
        this.downLoading = false;
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.download-view {
  .referenceFooter {
    display: flex;
    align-items: center;
    margin-right: 20px;
    cursor: pointer;

    .view-download-total {
      margin-left: 4px;
      color: #F56C6C;
      font-size: 12px;
    }
  }
}

.downloadPopover {
  .download-view-table {
    .download-view-title {
      .popoverTitle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;

        .title {
          font-size: 16px;
        }

        .closeIcon {
          font-size: 18px;
          cursor: pointer;
          margin-left: 10px;

          &:hover {
            font-weight: bold;
          }
        }
      }

    }
  }
}
</style>
