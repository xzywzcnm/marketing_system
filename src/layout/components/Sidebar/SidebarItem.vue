<template>
  <div>
    <template v-for="(item, index) in menuList">
      <!-- 存在子级 -->
      <el-submenu
        v-if="item && !$common.isEmpty(item.children)"
        :key="`submenu-${item.id}${index}`"
        :index="item.id"
      >
        <!-- 菜单父级 -->
        <template slot="title">
          <i
            v-if="!$common.isEmpty(item.icon)"
            :class="`lapa icon-${item.icon}`"
          />
          <span>{{ item.name }}</span>
        </template>
        <!-- 子级菜单 -->
        <SidebarItem
          v-if="!$common.isEmpty(item.children)"
          :key="`dyt-submenu-${index}`"
          :menu-list="item.children"
        />
      </el-submenu>
      <!-- 没子级菜单 -->
      <template v-else-if="item && !$common.isEmpty(item.path) && !item.hidden">
        <el-menu-item
          :key="`menu-item-${index}`"
          :index="item.path"
          @click="menuItemClick(item)"
        >
          <i
            v-if="!$common.isEmpty(item.icon)"
            :class="`lapa icon-${item.icon}`"
          />
          {{ item.name }}
        </el-menu-item>
      </template>
    </template>
  </div>
</template>

<script>

export default {
  name: "SidebarItem",
  props: {
    // 数据
    menuList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {};
  },
  methods: {
    menuItemClick (item) {
      this.$route.path !== item.path && this.$router.push({ path: `${item.path}` });
    }
  }
};
</script>
<style lang="scss" scoped>
.side-title-left {
  display: flex;
  align-items: center;
  padding-right: 20px;
  svg {
    margin-right: 6px;
  }
  > span {
    flex: 1;
  }
}
.side-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
  font-weight: bold;
}
</style>
