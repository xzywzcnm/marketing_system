<template>
  <div v-loading="loading" class="detail-content plr10">
    <el-descriptions title="基础资料" :column="3" border>
      <el-descriptions-item label="平台">
        {{ query.platformCode || detailInfo.platformCode || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="站点">
        <span v-if="detailInfo.siteCode" class="svg-container flex-align">
          <svg v-if="siteExsit.includes(detailInfo.siteCode)" class="icon mr10" aria-hidden="true">
            <use :xlink:href="'#icon-' + detailInfo.siteCode" />
          </svg>
          <span>{{ detailInfo.siteCode }}</span>
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="店铺">
        <template v-for="(item, index) in shopList">
          <span v-if="item.accountCode === detailInfo.accountCode" :key="index + 's'">{{
            item.accountCode + '[' + item.account + ']'
          }}</span>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="Item Id">
        {{ detailInfo.itemId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="类目">
        {{ detailInfo.platformCategory || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="产品名称">
        {{ detailInfo.productName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Views">
        {{ detailInfo.pageView || 0 }}
      </el-descriptions-item>
      <el-descriptions-item label="收藏">
        {{ detailInfo.collectQuantity || 0 }}
      </el-descriptions-item>
      <el-descriptions-item label="转化率%">
        {{ detailInfo.conversionRate || 0 }}
      </el-descriptions-item>
      <el-descriptions-item label="标题">
        {{ detailInfo.title || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    <!-- 表格 -->
    <div class="mainContent mt20">
      <div class="tableWrap" style="height:100%;">
        <el-table ref="table" :data="tableData" height="100%" border :class="{ nolength: !tableData.length }">
          <el-table-column prop="autoReplenishment" label="自动补货" width="120px" />
          <el-table-column label="图片" width="120px">
            <template slot-scope="{}">
              <preview-image :url="detailInfo.mainPictureUrl" />
            </template>
          </el-table-column>
          <el-table-column prop="platformSku" label="SKU" min-width="140px" />
          <el-table-column prop="goodsStatus" label="ERP商品状态" width="120px">
            <template slot-scope="{row}">
              <span v-for="item in goodsStatusArr" :key="'goodsStatus' + item.value">{{
                item.value === row.goodsStatus ?
                item.label : ''
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="inventoryQuantity" label="库存" width="120px" />
          <el-table-column prop="price" label="售价" width="120px" />
          <el-table-column prop="soldQuantity" label="售出数量" width="120px" />
          <el-table-column prop="soldQuantityYesterday" label="昨日销量" width="120px" />
          <el-table-column label="销量" min-width="120px">
            <template slot-scope="{row}">
              <div class="mb6">
                7日：<span class="highLine">{{ row.soldQuantityWeek || 0 }}</span>
              </div>
              <div class="mb6">
                15日：<span class="highLine">{{ row.soldQuantityHalfMonth || 0 }}</span>
              </div>
              <div>
                30日：<span class="highLine">{{ row.soldQuantityMonth || 0 }}</span>
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="pageView" label="Views"></el-table-column>
          <el-table-column prop="collectQuantity" label="收藏"></el-table-column>
          <el-table-column prop="conversionRate" label="转化率%"></el-table-column> -->
          <el-table-column prop="color" label="Color" width="120px" />
          <el-table-column prop="size" label="Size" width="120px" />
        </el-table>
      </div>
    </div>
    <!-- 日志 -->
    <common-log :model-visible.sync="logVisible" :request-info="logData" />
  </div>
</template>

<script>
import previewImage from '@/components/previewImage';
import commonLog from '@/views/components/commonLog';
import { goodsStatusArr } from '@/views/marketingStrategy/pages/components/fileData.js';
export default {
  name: "OverviewDetai",
  components: { previewImage, commonLog },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      goodsStatusArr: goodsStatusArr('nostatus'),
      logVisible: false,//日志弹框
      logData: {},//日志信息
      siteExsit: ['CN', 'BR', 'US', 'DE', 'FR', 'UA', 'IT', 'UK', 'RU', 'AU', 'PL'],
      tableData: [],
      shopList: [],
      detailInfo: {},
      query: {},
    }
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (val) return;
      this.$emit('update:modelVisible', val);
    },
  },
  created() {
    this.getDetail();
    // 获取店铺列表
    // this.getotherList('queryStore', 'shopList');
    this.getotherList();
  },
  methods: {
    // 详情
    getDetail() {
      let [_self, query] = [this, this.$route.query];
      this.query = query;
      let platformCode = query.platformCode || '';
      //区分平台区分api,data,validate
      let plantformData = {
        'ebay': {
          type: 'get',
          api: _self.api.ebay.ebayQueryDetail,
          data: { params: { linkId: query.linkId, commonStoreId: query.commonStoreId } },
          validate() {
            if (!(query.linkId && query.commonStoreId)) {
              _self.$message.error("缺少“linkId, commonStoreId”参数，请重新从链接进入!");
              return false;
            }
            return true;
          },
          resultFun(data) {
            _self.detailInfo = data || {};
            _self.tableData = _self.detailInfo.ebayStoreLinkDetailVOList || [];
          },
        },
        'walmart': {
          type: 'get',
          api: '',
          data: {},
        },
      }

      let temp = plantformData[platformCode];
      if (!temp) return this.$message.error("平台异常~");
      if (!temp.validate()) return;

      this.loading = true;
      this.$http[temp.type](temp.api, temp.data).then(({ data }) => {
        temp.resultFun(data);
      }).finally(() => {
        this.loading = false;
      })
    },
    // item链接跳转
    itemGo(row) {
      row.url && window.open(row.url);
    },
    // 获取全部店铺列表
    getotherList(api, list) {
      let platformCode = this.$route.query.platformCode;
      if (!platformCode) return new Error('平台缺失');
      this.$store.dispatch('platformList/getstoreList', { platformCode }).then(list => {
        this.shopList = (list || []);
      })
    },
  }
}
</script>
<style lang="scss">
.detail-content {
  height: 100%;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;

  .el-descriptions-item__label {
    width: 120px;
  }
}
</style>
