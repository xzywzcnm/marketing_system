<template>
  <el-table-column v-if="['selection', 'index', 'expand'].includes(columnConfig.type)" :type="columnConfig.type"
    :width="columnConfig.width" />
  <el-table-column v-else-if="columnConfig.children && columnConfig.children.length > 0" v-bind="columnConfig">
    <dytTableHead v-for="(col, index) in columnConfig.children" :key="index" :column-config="col">
      <!-- 不带参数插槽 -->
      <template v-for="slot in slots" :slot="slot">
        <slot :name="slot">
          {{ scope.row[col.prop] }}
        </slot>
      </template>
      <!-- 带参数插槽 -->
      <template v-for="scopeSlots in scopedSlots" :slot="scopeSlots" slot-scope="scope">
        <slot :name="scopeSlots" v-bind="scope">
          {{ scope.row[col.prop] }}
        </slot>
      </template>
      <!-- 默认插槽 注意：当还存在子级时，默认插槽需要透传，不要写到此次-->
      <template v-if="!col.children || col.children === 0" slot-scope="scope">
        <slot v-bind="scope">
          {{ scope.row[col.prop] }}
        </slot>
      </template>

      <template v-if="col.children && col.children.length && col.header" slot-scope="scope">
        <slot v-bind="scope">
          {{ scope.row[col.prop] }}
        </slot>
      </template>
    </dytTableHead>

    <!-- 头部 -->
    <template slot="header" v-if="columnConfig.header">
      <slot :name="columnConfig.header"></slot>
    </template>
  </el-table-column>
  <!-- 非子级时 -->
  <el-table-column v-else v-bind="columnConfig">
    <template slot-scope="scope">
      <!-- 具名插槽 -->
      <slot v-if="columnConfig.slot" v-bind="scope" :name="columnConfig.slot">
        {{ scope.row[columnConfig.slot] }}
      </slot>
      <!-- 默认插槽 -->
      <slot v-bind="scope">
        {{ scope.row[columnConfig.prop] }}
      </slot>
    </template>

    <!-- 头部 -->
    <template v-if="columnConfig.header">
      <template slot="header">
        <slot :name="columnConfig.header"></slot>
      </template>
    </template>
  </el-table-column>
</template>
<script>
export default {
  name: "DytTableHead",
  props: {
    columnConfig: {
      type: Object,
      default() {
        return {
          children: []
        }
      }
    },
  },
  data() {
    return {}
  },
  computed: {
    slots() {
      return Object.keys(this.$slots)
    },
    scopedSlots() {
      return Object.keys(this.$scopedSlots)
    }
  },
  mounted() { },
}
</script>