<template>
  <div v-if="powerList.length" style="display:inline-block;">
    <el-dropdown v-if="dropdownMenuList.length" v-bind="$attrs" v-on="$listeners" @command="commandChange">
      <span>
        <el-button type="primary" :disabled="defaultBtn.disabled" :loading="btnLoading"
          @click="commandChange(defaultBtn.command)">
          {{ defaultBtn.label }}
          <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
      </span>
      <el-dropdown-menu slot="dropdown" class="dyt-dropdownPage">
        <span v-for="(item, index) in dropdownMenuList" :key="index" :title="item.title">
          <el-dropdown-item :command="item.command" :disabled="item.disabled || item.loading">
            {{ item.label }}
          </el-dropdown-item>
        </span>
      </el-dropdown-menu>
    </el-dropdown>
    <el-button v-else type="primary" :loading="defaultBtn.loading" :disabled="defaultBtn.disabled"
      @click="commandChange(defaultBtn.command)">
      {{ defaultBtn.label }}
    </el-button>
  </div>
</template>
<script>
export default {
  name: "DytDropdown",
  props: {
    dropdownList: {
      type: Array,
      default() { return [] }
    },
    loading: {
      type: Boolean,
      default() { return false }
    }
  },
  data() {
    return {}
  },
  computed: {
    powerList() {
      let list = this.dropdownList.filter(k => k.power);
      return list;
    },
    defaultBtn() {
      return this.powerList[0] || {};
    },
    dropdownMenuList() {
      return this.powerList.slice(1);
    },
    btnLoading() {
      let flag = false;
      this.dropdownMenuList.forEach(k => {
        k.loading && (flag = true);
      })
      return flag;
    }
  },
  methods: {
    commandChange(e) {
      this.$emit('commandChange', e);
    },
  },
}
</script>
<style lang="scss" scoped>
// .dyt-dropdownPage {
// .liDsabled {
//   cursor: default;
//   color: #bbb;
//   pointer-events: none;
// }
// }
</style>