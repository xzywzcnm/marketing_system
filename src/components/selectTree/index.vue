<template>
  <div>
    <div class="select-tree">
      <el-select
        v-model="value"
        multiple
        placeholder="请选择"
        :popper-append-to-body="false"
        class="select-list"
        filterable
        :filter-method="filterTree"
        collapse-tags
        clearable
      >
        <el-option
          v-if="data.length"
          :label="1"
          :value="1"
        >
          <el-tree
            ref="tree2"
            :data="data"
            :props="defaultProps"
            default-expand-all
            :filter-node-method="filterNode"
            show-checkbox
            :check-on-click-node="true"
            :expand-on-click-node="false"
            node-key="id"
            @check="checkChange"
          />
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
export default {
  name: "SelectTree",
  props: {
    mulselect: {//model值
      type: Array,
      default () {
        return [];
      }
    },
    dataList: {//列表值
      type: Array,
      default () {
        return [];
      }
    }
  },
  data () {
    return {
      data: [{
        id: 1,
        label: '一级 1',
        children: [{
          id: 4,
          label: '二级 1-1',
          children: [{
            id: 9,
            label: '三级 1-1-1'
          }, {
            id: 10,
            label: '三级 1-1-2'
          }]
        }]
      }, {
        id: 2,
        label: '一级 2',
        children: [{
          id: 5,
          label: '二级 2-落实到附近螺丝水'
        }, {
          id: 6,
          label: '二级 2-2'
        }]
      }, {
        id: 3,
        label: '一级 3',
        children: [{
          id: 7,
          label: '二级 3-1'
        }, {
          id: 8,
          label: '二级 3-2'
        }]
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      value: [],//显示select上的勾选值
      checkList: [],//记录勾选的值
    };
  },
  mode: {
    prop: 'mulselect'
  },
  watch: {
    checkList: {
      handler (newName, oldName) {
        this.$emit("update:mulselect", newName || []);
        this.value = [];
        if (!newName) return;
        this.value = newName.map(k => { return k.label });
      },
      deep: true,
      immediate: true
    },
    dataList: {
      handler (newName, oldName) {
        this.data = this.$common.copy(newName || []);
      },
      deep: true,
      immediate: true
    },
  },
  methods: {
    // 树形数据筛选
    filterNode (value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 勾选值
    checkChange (a, b) {
      this.checkList = b.checkedNodes || [];
    },
    // 树形数据筛选
    filterTree (val) {
      this.$refs.tree2.filter(val);
    }
  }
}
</script>

<style lang="scss">
.select-tree {
  position: relative;
  width: 260px;
  .select-list {
    .el-select-dropdown__item {
      height: auto;
      background: #fff !important;
    }
    .el-tree-node__label {
      font-weight: normal;
    }
  }
}
</style>