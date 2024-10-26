<template>
  <div class="numIntervalPage" v-if="isShow">
    <div class="wordflexCenter">
      <span class="label">{{ temp.name }}</span>
      <div class="labelContent">
        <span v-if="temp.minNumber === temp.maxNumber">
          <span :class="{ dangerPrice: !temp.hideError && temp.minNumber < 0 }">{{ temp.minNumber || 0 }}</span>
          <span>{{ temp.unit || '' }}</span>
        </span>
        <span v-else>
          <span :class="{ dangerPrice: !temp.hideError && temp.minNumber < 0 }">
            {{ temp.minNumber || 0 }}
          </span>
          <!-- <span>{{ temp.unit || '' }}</span> -->
          <span> - </span>
          <span :class="{ dangerPrice: !temp.hideError && temp.maxNumber < 0 }">
            {{ temp.maxNumber || 0 }}
          </span>
          <span>{{ temp.unit || '' }}</span>
        </span>
        <!-- 插槽 -->
        <slot class="aaa" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SalePriceComponentsNumInterval",
  props: {
    options: {
      type: Object,
      default() { return {} }
    },
  },
  data() {
    return {
      temp: {}
    }
  },
  watch: {
    options: {
      deep: true,
      immediate: true,
      handler(val) {
        if (!val) return;
        let data = this.$common.copy(val);
        let { minNumber, maxNumber } = data;
        data.minNumber = minNumber ? parseFloat(Number(minNumber).toFixed(2)) : 0;
        data.maxNumber = maxNumber ? parseFloat(Number(maxNumber).toFixed(2)) : 0;
        this.temp = data;
      }
    },
  },
  computed: {
    // 校验是否都为空值，为空值不展示
    isShow() {
      let { minNumber, maxNumber } = this.options;
      const minFlag = !!(minNumber || minNumber === 0);
      const maxFlag = !!(maxNumber || maxNumber === 0);
      return minFlag || maxFlag;
    },
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
.numIntervalPage {
  // display: flex;
  line-height: 18px;

  .label {
    white-space: nowrap;
  }

  .labelContent {
    flex: 1;
  }

  .dangerPrice {
    color: #FC2D1A;
  }
}
</style>