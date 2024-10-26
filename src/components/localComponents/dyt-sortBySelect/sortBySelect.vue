<template>
  <span class="sortby-select" v-if="sortButtonList.length">
    <span>排序：</span>
    <el-select v-model="currentSortField" placeholder="请选择" class="sort-select"
      :class="currentSortType !== '' ? 'active' : ''" @change="changeSortField">
      <el-option v-for="item in sortButtonList" :key="item.sortField" :label="`按${item.sortHeader}`"
        :value="item.sortField" />
    </el-select>
    <el-button v-if="currentSortType" class="sort-button" :class="currentSortType === '' ? '' : 'active'"
      @click="changeSortType()">
      <span class="sort-button__icon">
        <span>
          {{ currentSortType === '' ? '无序' : (currentSortType === 'ASC' ? '升序' : '降序') }}
        </span>
        <span v-if="currentSortType === 'ASC'" class="lapa icon-shengxu lapaIcon" />
        <span v-if="currentSortType === 'DESC'" class="lapa icon-jiangxu lapaIcon" />
      </span>
    </el-button>
  </span>
</template>

<script>
/**
 * @description 排序下拉按钮组件（使用方法可参考 orderGrossDetail.vue）
 * @param {Array} sortButtonList // 排序按钮列表
 * @param {String} sortHeader // 必填，按钮文字
 * @param {String} sortField // 必填，排序prop
 * @param {String} sortType // 非必填，ASC / DESC，为空则默认降序。
 * @param {Boolean} default // 非必填，true / false / ''，是否默认显示
 *
 * 注：当页面需在首次进入时就有默认排序，请将要默认排序的按钮放在sortButtonList的第一位，
 * 另外，为避免重复请求，父组件在 created 中就不要再 fetch() 了
 *
 * 传进来的按钮列表数组格式：
 *  sortButtonList: [
      {
        sortHeader: '入库时间',
        sortField: 'warehousingTime',
        sortType: 'ASC'
        default: true,
      },
      {
        sortHeader: '采购时间',
        sortField: 'purchaseTime',
      },
    ],
 */
export default {
  name: "DytSortBySelect",
  props: {
    // 排序按钮列表
    sortButtonList: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      currentSortField: "", // 当前排序prop
      currentSortType: "", // 当前排序Type
      defaultSort: {},//默认排序
    };
  },
  watch: {
    sortButtonList: {//设置默认值
      deep: true,
      immediate: true,
      handler(val) {
        if (!Array.isArray(val)) return;
        let list = val.filter(k => k.default);
        if (!list.length) return;
        this.currentSortField = list[0].sortField || '';
        this.currentSortType = list[0].sortType || '';
        this.defaultSort = list[0] || {};
      }
    },
  },
  methods: {
    // 向父组件传递 sortType sortField
    changeSortField(e) {
      if (e === '') {
        let defaultSort = this.defaultSort;
        this.currentSortType = defaultSort.sortType || '';
        this.currentSortField = defaultSort.sortField || '';
      } else {
        this.sortButtonList.find((obj) => {
          if (obj.sortField === this.currentSortField) {
            // 有设置默认排序则使用默认，没设置则默认降序
            this.currentSortType = obj.sortType || "DESC";
          }
        });
      }
      this.$emit("sortInfo", this.currentSortType, this.currentSortField);
    },
    changeSortType() {
      // 避免没有 sortField 的情况
      if (!this.currentSortField) {
        this.$message.warning("请选择要按哪一列数据排序！");
        return;
      }
      // 反选
      this.currentSortType = this.currentSortType === "ASC" ? "DESC" : "ASC";
      this.$emit("sortInfo", this.currentSortType, this.currentSortField);
    },
  },
};
</script>
<style lang="scss">
.sortby-select {
  .sort-select {
    width: 110px;

    .el-input__inner {
      color: #838a9d;
      padding: 0 20px 0 10px;
    }

    .el-input__icon {
      width: 15px;
    }
  }

  .sort-select.active {
    .el-input .el-input__inner {
      color: #4d8ce9 !important;
      border-color: #4d8ce9 !important;
    }
  }

  .sort-button {
    margin-left: 10px;
    padding: 8px 10px;
    font-size: 14px;

    .sort-button__icon {
      display: inline-flex;
      align-items: center;
    }
  }

  .sort-button.active {
    border-color: #4d8ce9 !important;
    color: #4d8ce9 !important;
  }

  .sort-button:hover,
  .sort-button:focus {
    background-color: #ffffff;
  }
}
</style>
