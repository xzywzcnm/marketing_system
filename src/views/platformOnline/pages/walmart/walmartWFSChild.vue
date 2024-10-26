<template>
  <div class="page-main walmartChildPage">
    <dyt-table ref="dytTable" :column-info="columnInfo" :table-head="wfsChildTableHead" :table-search="tableSearch"
      :span-method="mergeRowWithCol" :is-show-sort="false" :header-cell-style="headerStyle" :cell-style="setCellStyle"
      @getAllData="getAllData" v-bind="$attrs">
      <template slot="pictureInfo" slot-scope="{ row }">
        <preview-image :url="row.mainPictureUrlQuikly" :fileList="[row.mainPictureUrl]">
          <div class="mt4Content">
            <div v-if="saleList[row.status]" :style="saleList[row.status].style">
              {{ saleList[row.status].label }}
            </div>
            <el-tooltip placement="right" content="评分/评价数" v-if="row.averageRating || row.reviewsCount">
              <div>{{ row.averageRating || 0 }} / {{ row.reviewsCount || 0 }}</div>
            </el-tooltip>
          </div>
        </preview-image>
      </template>
      <template slot="baseInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div class="clipContent flex-jcCenter">
            <el-tooltip placement="top" :content="row.title" :disabled="!(row.title && row.title.length)">
              <div class="text-ellipsis">{{ row.title || "-" }}</div>
            </el-tooltip>
            <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.title)"
              v-if="row.title" />
          </div>
          <div v-if="row.skuList">
            <div class="clipContent flex-jcCenter" v-for="(item, index) in row.skuList" :key="index + 'sku'">
              <div class="highLine clipText" title="SKU">{{ item.sku }}</div>
              <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, item.sku)"
                v-if="item.sku" />
            </div>
          </div>
          <div v-else>-</div>
          <div class="clipContent flex-jcCenter">
            <div title="平台SKU">{{ row.platformSku || "-" }}</div>
            <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.platformSku)"
              v-if="row.platformSku" />
          </div>
          <div class="clipContent flex-jcCenter">
            <span class="highCursor clipText" @click="itemGo(row)" title="itemId">{{ row.itemId || "-" }}</span>
            <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.itemId)"
              v-if="row.itemId" />
          </div>
          <div class="clipContent flex-jcCenter">
            <div title="GTIN">{{ row.gtin || "-" }}</div>
            <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.gtin)" v-if="row.gtin" />
          </div>
          <div class="clipContent flex-jcCenter">
            <div title="店铺">{{ row.accountCode || "-" }}</div>
          </div>
        </div>
      </template>
      <template slot="priceInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div style="padding-bottom:4px;">
            <el-tooltip effect="dark" :content="'当前购物车价格：' + String(row.buyBoxItemPrice || 0)" placement="top"
              :disabled="row.isSellerBuyBoxWinner == 1" :open-delay="500">
              <div class="lapa icon-huaban carIcon" :class="{ highCheck: row.isSellerBuyBoxWinner == 1 }" />
            </el-tooltip>
          </div>
          <div>{{ row.price || 0 }}</div>
          <div>{{ row.comparisonPrice || 0 }}</div>
          <div>({{ row.currency || "" }})</div>
        </div>
      </template>
      <!-- 库存二级表头 -->
      <template slot="stockInfo2" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div>{{ row.stockInfo2 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartSellAbleStatus" v-if="row.index === 1"
            @sortChange="changeSortType('walmartSellAbleStatus')" />
        </div>
      </template>
      <template slot="stockInfo3" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div>{{ row.stockInfo3 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartWfsSellAbleStatus" v-if="row.index === 1"
            @sortChange="changeSortType('walmartWfsSellAbleStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartWfsInboundStatus" v-if="row.index === 2"
            @sortChange="changeSortType('walmartWfsInboundStatus')" />
        </div>
      </template>
      <!-- 销量二级表头 -->
      <template slot="saleInfo1" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div title="可售天数" v-if="row.index === 0">{{ row.saleInfo1 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.daysAvailableForSaleStatus" v-if="row.index === 0"
            @sortChange="changeSortType('daysAvailableForSaleStatus')" />
          <div v-else>{{ row.saleInfo1 }}</div>
        </div>
      </template>
      <template slot="saleInfo2" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div>{{ row.saleInfo2 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD1SaleStatus" v-if="row.index === 1"
            @sortChange="changeSortType('walmartD1SaleStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartWfsD1SaleStatus" v-if="row.index === 2"
            @sortChange="changeSortType('walmartWfsD1SaleStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartTotalD1SaleStatus" v-if="row.index === 3"
            @sortChange="changeSortType('walmartTotalD1SaleStatus')" />
        </div>
      </template>
      <template slot="saleInfo3" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div>{{ row.saleInfo3 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD3SaleStatus" v-if="row.index === 1"
            @sortChange="changeSortType('walmartD3SaleStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartWfsD3SaleStatus" v-if="row.index === 2"
            @sortChange="changeSortType('walmartWfsD3SaleStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartTotalD3SaleStatus" v-if="row.index === 3"
            @sortChange="changeSortType('walmartTotalD3SaleStatus')" />
        </div>
      </template>
      <template slot="saleInfo4" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div>{{ row.saleInfo4 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD7SaleStatus" v-if="row.index === 1"
            @sortChange="changeSortType('walmartD7SaleStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartWfsD7SaleStatus" v-if="row.index === 2"
            @sortChange="changeSortType('walmartWfsD7SaleStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartTotalD7SaleStatus" v-if="row.index === 3"
            @sortChange="changeSortType('walmartTotalD7SaleStatus')" />
        </div>
      </template>
      <template slot="saleInfo5" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div>{{ row.saleInfo5 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD15SaleStatus" v-if="row.index === 1"
            @sortChange="changeSortType('walmartD15SaleStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartWfsD15SaleStatus" v-if="row.index === 2"
            @sortChange="changeSortType('walmartWfsD15SaleStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartTotalD15SaleStatus" v-if="row.index === 3"
            @sortChange="changeSortType('walmartTotalD15SaleStatus')" />
        </div>
      </template>
      <template slot="saleInfo6" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div>{{ row.saleInfo6 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD30SaleStatus" v-if="row.index === 1"
            @sortChange="changeSortType('walmartD30SaleStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartWfsD30SaleStatus" v-if="row.index === 2"
            @sortChange="changeSortType('walmartWfsD30SaleStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartTotalD30SaleStatus" v-if="row.index === 3"
            @sortChange="changeSortType('walmartTotalD30SaleStatus')" />
        </div>
      </template>
      <!-- 利润二级表头 -->
      <template slot="profitInfo2" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div>{{ row.profitInfo2 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD1ProfitStatus" v-if="row.index === 1"
            @sortChange="changeSortType('walmartD1ProfitStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD30RefundStatus" v-if="row.index === 3"
            @sortChange="changeSortType('walmartD30RefundStatus')" />
        </div>
      </template>
      <template slot="profitInfo3" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div>{{ row.profitInfo3 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD3ProfitStatus" v-if="row.index === 1"
            @sortChange="changeSortType('walmartD3ProfitStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD60RefundStatus" v-if="row.index === 3"
            @sortChange="changeSortType('walmartD60RefundStatus')" />
        </div>
      </template>
      <template slot="profitInfo4" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div>{{ row.profitInfo4 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD7ProfitStatus" v-if="row.index === 1"
            @sortChange="changeSortType('walmartD7ProfitStatus')" />
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD90RefundStatus" v-if="row.index === 3"
            @sortChange="changeSortType('walmartD90RefundStatus')" />
        </div>
      </template>
      <template slot="profitInfo5" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div>{{ row.profitInfo5 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD15ProfitStatus" v-if="row.index === 1"
            @sortChange="changeSortType('walmartD15ProfitStatus')" />
        </div>
      </template>
      <template slot="profitInfo6" slot-scope="{ row}">
        <div class="flexCenter flex-jcCenter">
          <div>{{ row.profitInfo6 }}</div>
          <cellSort :sortType.sync="sortTypeStatusInfo.walmartD30ProfitStatus" v-if="row.index === 1"
            @sortChange="changeSortType('walmartD30ProfitStatus')" />
        </div>
      </template>
      <template slot="remarks" slot-scope="{ row }">
        <el-tooltip placement="top" v-if="row.linkNotes" class="mb20">
          <div slot="content" style="max-width: 400px;">{{ row.linkNotes }}</div>
          <div class="text-ellipsis">{{ row.linkNotes }}</div>
        </el-tooltip>
        <div class="el-icon-edit-outline highCursor" style="font-size:20px;" @click="filterRemark(row)"></div>
      </template>
      <template slot="times" slot-scope="{ row }">
        <div class="flexCenter flex-jcCenter">
          <div class="timeWidth">{{ row.shelvedTime || "-" }}</div>
        </div>
      </template>
    </dyt-table>
    <!-- 备注 -->
    <remarks :model-visible.sync="remarkInfo.visible" :data="remarkInfo.data" @search="getList" />
  </div>
</template>

<script>
import previewImage from "@/components/previewImage";
import { childSortButtonList, wfsChildTableHead, processFloatPoint, wfsChildSortButtonList } from './fileData.js';
import { saleList } from '../components/fileData.js';
import { getSalesStatus } from '@/utils/staticDataOrigin';
import { siteExsit } from "@/views/marketingStrategy/pages/components/fileData.js";
import dropdownComfun from "@/views/components/dropdownComfun";
import { deliveryTypeList } from './fileData.js';
import cellSort from './cellSort';
import remarks from './remarks';

export default {
  name: "WalmartWalmartChild",
  components: { previewImage, cellSort, remarks },
  props: {
    searchOptions: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      saleList: saleList,
      goodsStatusArr: getSalesStatus(), //ERP商品状态
      siteExsit: siteExsit,
      multipleSelection: [], //表格选中列表
      total: 0,
      replenishment: { //库存管理
        visible: false,
        data: null,
      },
      powerList: {
      },
      sortButtonList: childSortButtonList,
      tableSearch: {
        requestApi: this.api.walmart.listSub,
        requestType: 'post',
        searchParmas: {},
        handleData: true,
      },
      columnInfo: {
        controlHead: false,
        platformCode: 'walmart',
        moduleCode: 'walmartChild',
      },
      offShelfLoading: false,
      deliveryTypeList: deliveryTypeList,
      wareSetInfo: {//仓库设置
        visible: false,
        data: {},
        len: 0,
      },
      allWarehouseList: [],
      preSortType: '',
      preSortField: '',
      sortFieldArr: [],
      sortTypeArr: [],
      sortTypeStatusInfo: {
        walmartSellAbleStatus: '',
        walmartWfsSellAbleStatus: '',
        walmartWfsInboundStatus: '',
        walmartD1SaleStatus: '',
        walmartD3SaleStatus: '',
        walmartD7SaleStatus: '',
        walmartD15SaleStatus: '',
        walmartD30SaleStatus: '',
        walmartWfsD1SaleStatus: '',
        walmartWfsD3SaleStatus: '',
        walmartWfsD7SaleStatus: '',
        walmartWfsD15SaleStatus: '',
        walmartWfsD30SaleStatus: '',
        walmartTotalD1SaleStatus: 'DESC',
        walmartTotalD3SaleStatus: '',
        walmartTotalD7SaleStatus: '',
        walmartTotalD15SaleStatus: '',
        walmartTotalD30SaleStatus: '',
        walmartD1ProfitStatus: '',
        walmartD3ProfitStatus: '',
        walmartD7ProfitStatus: '',
        walmartD15ProfitStatus: '',
        walmartD30ProfitStatus: '',
        walmartD30RefundStatus: '',
        walmartD60RefundStatus: '',
        walmartD90RefundStatus: '',
        daysAvailableForSaleStatus: ''
      },
      defaultSort: {
        sortField: 'wsl.shelved_time',
        sortType: 'DESC',
      },
      remarkInfo: {
        visible: false,
        data: {},
      }
    };
  },
  computed: {
    power() {// 权限
      return this.$common.getPower(this.powerList);
    },
    selectionRows() {
      let falg = false;
      Object.keys(this.powerList).forEach(k => {
        if (k == 'inventoryManage') return;//跳过库存管理
        !falg && (falg = this.power[k]);
      })
      return falg;
    },
    wfsChildTableHead() {
      let list = this.$common.copy(wfsChildTableHead);
      return list;
    }
  },
  watch: {
    searchOptions: {
      handler(val) {
        this.tableSearch.searchParmas = {
          ...val,
          pageNum: 1,
          pageSize: 30,
          sortField: 'wsl.sold_quantity_yesterday',
          sortType: 'DESC',
        };
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    // 获取全部仓库列表
    this.$store.dispatch("platformList/getAllWarehouseList").then((list) => {
      this.allWarehouseList = list || [];
    });
  },
  methods: {
    // 公用下拉
    commonList(data) {
      return dropdownComfun.commonList(data, {
        powerList: this.power,
        multipleSelection: this.multipleSelection,
        total: this.total,
      });
    },
    search() {
      this.$refs['dytTable'].search();
    },
    getList() {
      this.$refs['dytTable'].getList();
    },
    // 返回列表页数据
    getAllData(data) {
      this.total = data.total || 0;
      const allWarehouseList = this.allWarehouseList;
      let list = data.list.map(k => {
        let rateList = ['grossProfitRateTotalYesterday', 'grossProfitRateTotalThreeDay', 'grossProfitRateTotalSevenDay', 'grossProfitRateTotalFifteenDay', 'grossProfitRateTotalMonth', 'refundFeeRateTotalMonth', 'refundFeeRateTotalSixtyDay', 'refundFeeRateTotaNinetyDay'];
        rateList.forEach(ak => {
          let num = processFloatPoint(k[ak] || 0, 2, 100);
          (ak in k) && (k[ak] = num + '%');
        })
        const warehouseIdList = k.warehouseIds ? k.warehouseIds.split(',') : [];
        k.erpWarehouseVOList = warehouseIdList.map(k => Number(k)).map(k => {
          let item = { warehouseId: k, warehouseName: k };
          allWarehouseList.forEach(uk => {
            k === uk.id && (item = uk);
          })
          return item;
        })
        k.mainPictureUrlQuikly = this.$common.handleSmallPicture(k.mainPictureUrl);

        // 正常状态SKU和映射SKU处理统一格式
        let [skuList, goodsStatus] = [[], k.erpGoodsStatus];
        if ([6].includes(goodsStatus)) {// goodsStatus为6展示无状态SKU
          skuList.push({ sku: null });
        } else if ([7].includes(goodsStatus)) {// goodsStatus为7展示erpSkuMappingVO信息->根据skuType展示
          let erpSkuMappingVO = k.erpSkuMappingVO || [];
          let blindBox = false;//是否盲盒
          erpSkuMappingVO.forEach(vo => {
            if (blindBox) return;
            blindBox = vo.skuType == 1;// 映射类型，0：组合产品，1：随机发一个SKU产品
            skuList.push({
              sku: blindBox ? k.erpSku : vo.erpSku,
            })
          })
        } else { // goodsStatus为0-5展示erpSku 或者不在其中状态的也展示最基础的
          skuList.push({ sku: k.erpSku });
        }
        k.skuList = skuList;
        return k;
      })
      let wfsList = []
      list.forEach(item => {
        for (let i = 1; i < 5; i++) {
          wfsList.push(item)
        }
      })
      let resultList = wfsList.map((item, index) => {
        let rows = index % 4;
        if (rows === 0) {
          return {
            ...item,
            stockInfo1: '',
            stockInfo2: 'Walmart',
            stockInfo3: 'WFS',
            saleInfo1: `可售:${item.daysAvailableForSale !== null ? item.daysAvailableForSale : '-'}`,
            saleInfo2: 'D1',
            saleInfo3: 'D3',
            saleInfo4: 'D7',
            saleInfo5: 'D15',
            saleInfo6: 'D30',
            profitInfo1: ' ',
            profitInfo2: 'D1',
            profitInfo3: 'D3',
            profitInfo4: 'D7',
            profitInfo5: 'D15',
            profitInfo6: 'D30',
            index: index
          }
        } else if (rows === 1) {
          return {
            ...item,
            stockInfo1: '可售',
            stockInfo2: item.walmartAvailQuantity !== null ? item.walmartAvailQuantity : '-',
            stockInfo3: item.wfsAvailQuantity !== null ? item.wfsAvailQuantity : '-',
            saleInfo1: 'WFS',
            saleInfo2: item.soldQuantityYesterdayWfs !== null ? item.soldQuantityYesterdayWfs : '-',
            saleInfo3: item.soldQuantityThreeDayWfs !== null ? item.soldQuantityThreeDayWfs : '-',
            saleInfo4: item.soldQuantityWeekWfs !== null ? item.soldQuantityWeekWfs : '-',
            saleInfo5: item.soldQuantityHalfMonthWfs !== null ? item.soldQuantityHalfMonthWfs : '-',
            saleInfo6: item.soldQuantityMonthWfs !== null ? item.soldQuantityMonthWfs : '-',
            profitInfo1: '毛利率',
            profitInfo2: item.grossProfitRateTotalYesterday !== null ? item.grossProfitRateTotalYesterday : '-',
            profitInfo3: item.grossProfitRateTotalThreeDay !== null ? item.grossProfitRateTotalThreeDay : '-',
            profitInfo4: item.grossProfitRateTotalSevenDay !== null ? item.grossProfitRateTotalSevenDay : '-',
            profitInfo5: item.grossProfitRateTotalFifteenDay !== null ? item.grossProfitRateTotalFifteenDay : '-',
            profitInfo6: item.grossProfitRateTotalMonth !== null ? item.grossProfitRateTotalMonth : '-',
            index: index
          }
        } else if (rows === 2) {
          return {
            ...item,
            stockInfo1: '在途',
            stockInfo2: 'N/A',
            stockInfo3: item.wfsInboundQuantity !== null ? item.wfsInboundQuantity : '-',
            saleInfo1: '自发货',
            saleInfo2: item.soldQuantityYesterdaySelfShipment !== null ? item.soldQuantityYesterdaySelfShipment : '-',
            saleInfo3: item.soldQuantityThreeDaySelfShipment !== null ? item.soldQuantityThreeDaySelfShipment : '-',
            saleInfo4: item.soldQuantityWeekSelfShipment !== null ? item.soldQuantityWeekSelfShipment : '-',
            saleInfo5: item.soldQuantityHalfMonthSelfShipment !== null ? item.soldQuantityHalfMonthSelfShipment : '-',
            saleInfo6: item.soldQuantityMonthSelfShipment !== null ? item.soldQuantityMonthSelfShipment : '-',
            profitInfo1: '',
            profitInfo2: 'D30',
            profitInfo3: 'D60',
            profitInfo4: 'D90',
            profitInfo5: '',
            profitInfo6: '',
            index: index
          }
        } else {
          return {
            ...item,
            stockInfo1: '',
            stockInfo2: '',
            stockInfo3: '',
            saleInfo1: '合计',
            saleInfo2: item.soldQuantityYesterday,
            saleInfo3: item.soldQuantityThreeDay,
            saleInfo4: item.soldQuantityWeek,
            saleInfo5: item.soldQuantityHalfMonth,
            saleInfo6: item.soldQuantityMonth,
            profitInfo1: '退款率',
            profitInfo2: item.refundFeeRateTotalMonth !== null ? item.refundFeeRateTotalMonth : '-',
            profitInfo3: item.refundFeeRateTotalSixtyDay !== null ? item.refundFeeRateTotalSixtyDay : '-',
            profitInfo4: item.refundFeeRateTotaNinetyDay !== null ? item.refundFeeRateTotaNinetyDay : '-',
            profitInfo5: '',
            profitInfo6: '',
            index: index
          }
        }
      })
      data.returnData(resultList);
    },
    // 更新主子链接列表
    refreshAll() {
      this.$emit("refreshAll", "keepPageSearch");
    },
    // item链接跳转
    itemGo(row) {
      row.url && window.open(row.url);
    },
    // 单个排序
    changeSortType(type) {
      Object.keys(this.sortTypeStatusInfo).forEach(k => {
        if (type === k) return;
        this.$set(this.sortTypeStatusInfo, k, null);
      })
      this.changeSortType2();
    },
    // 多个排序
    changeSortType2() {
      let [defaultSort, sortFeildList, sortTypeList] = [this.defaultSort, [], []];
      let sortTypeStatusInfo = this.sortTypeStatusInfo;
      Object.keys(sortTypeStatusInfo).forEach(k => {
        if (sortTypeStatusInfo[k]) {
          let sortFeild = wfsChildSortButtonList[k];
          sortFeildList.push(sortFeild);
          sortTypeList.push(sortTypeStatusInfo[k]);
        }
      })
      if (!sortFeildList.length) sortFeildList.push(defaultSort.sortField);
      if (!sortTypeList.length) sortTypeList.push(defaultSort.sortType);
      this.$set(this.tableSearch.searchParmas, 'sortField', sortFeildList.join('|'));
      this.$set(this.tableSearch.searchParmas, 'sortType', sortTypeList.join('|'));
      this.$nextTick(() => {
        this.getList();
      })
    },
    // 合并表头
    headerStyle({ row, column, rowIndex, columnIndex }) {
      let styleObj = {};
      // 合并列(数量代表列数)
      row[3].colSpan = 3;
      row[6].colSpan = row[12].colSpan = 6;
      let arr = [4, 5, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17];
      arr.forEach(k => {
        row[k].colSpan = 0;
      })
      if (arr.includes(columnIndex)) {
        styleObj.display = 'none';
      } else {
        styleObj.borderRight = '1.5px solid #b5c2e5';
      }
      return styleObj;
    },
    // 合并table单元格
    mergeRowWithCol({ row, column, rowIndex, columnIndex }) {
      if ([0, 1, 2, 18, 19].includes(columnIndex)) {
        // 判断当前列是否需要合并
        if (rowIndex % 4 === 0) {
          // 每4行合并为1行
          return {
            rowspan: 4,
            colspan: 1
          };
        } else {
          // 其他行不合并
          return {
            rowspan: 0,
            colspan: 0
          };
        }
      } else {
        return {
          rowspan: 1,
          colspan: 1
        };
      }
    },
    // 设置行样式
    setCellStyle({ row, column, rowIndex, columnIndex }) {
      // 链接与链接的线条，加粗
      let styleObj = {};
      if (rowIndex > 0 && (rowIndex % 4) === 0) {
        styleObj.borderTop = '1px solid #d5dff9';
      }
      // 一级表头增加右边框线
      if ([0, 1, 2, 5, 11, 17, 18].includes(columnIndex)) {
        styleObj.borderRight = '1.5px solid #b5c2e5';
      }

      // 二级表头增加背景颜色
      let temp = {};
      temp['Walmart'] = row.stockInfo2 === 'Walmart' && columnIndex === 5;
      temp['WFS'] = row.stockInfo3 === 'WFS' && columnIndex === 4;
      let fun = (type, typeNum, cIndex) => {
        let arr = ['D1', 'D3', 'D7', 'D15', 'D30'];
        arr.forEach((k, i) => {
          temp[type + i] = (row[type + typeNum] === k && columnIndex === cIndex);
          typeNum++;
          cIndex++;
        })
      }
      fun('saleInfo', 2, 7);
      fun('profitInfo', 2, 13);
      // 毛利率值也要加背景
      temp['gross'] = (rowIndex / 2) % 2 === 1 && [13, 14, 15].includes(columnIndex);
      Object.keys(temp).forEach(k => {
        if (temp[k]) styleObj.background = '#efefef';
      })
      return styleObj;
    },
    filterRemark(row) {
      this.remarkInfo.data = this.$common.copy(row);
      this.remarkInfo.visible = true;
    }
  }
};
</script>
<style lang="less" scoped>
.walmartChildPage {
  .carIcon {
    font-size: 26px;
  }

  .highCheck {
    color: #009BED;
  }
}
</style>
