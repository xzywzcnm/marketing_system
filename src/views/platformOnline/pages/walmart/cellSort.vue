<template>
  <div class="cellSortPage">
    <i class="el-icon-caret-top sort-icon sort-top" :class="{ 'sort-selected': type === 'ASC' }"
      @click="changeSortType('ASC')" />
    <i class="el-icon-caret-bottom sort-icon sort-bottom" :class="{ 'sort-selected': type === 'DESC' }"
      @click="changeSortType('DESC')" />
  </div>
</template>

<script>
export default {
  name: 'cellSrot',
  props: {
    sortType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      type: '',
    }
  },
  watch: {
    sortType: {
      handler(val) {
        if (val === this.type) return;
        this.type = val;
      },
      deep: true,
      immediate: true
    },
  },
  methods: {
    changeSortType(sort) {
      let result = this.type === sort ? '' : sort;
      this.type = result;
      this.$emit('update:sortType', result);
      this.$nextTick(() => {
        this.$emit('sortChange', result);
      })
    },
  },
}
</script>
<style lang="less">
.cellSortPage {
  display: flex;
  flex-direction: column;
  margin-left: 2px;
  position: absolute;
  right: 0px;

  .sort-icon {
    font-size: 18px;
    color: #c0c4cc;
    cursor: pointer;
    height: 10px;
    line-height: 10px;
  }

  .sort-selected {
    color: #409eff;
  }
}
</style>