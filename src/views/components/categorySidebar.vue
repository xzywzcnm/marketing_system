<template>
  <div>
    <template v-for="(item, index) in menuList">
      <!-- 存在子级 -->
      <el-submenu
        v-if="item && !$common.isEmpty(item.children)"
        :key="`categorySubmenu-${item.productCategoryId}${index}`"
        :index="item.productCategoryId"
      >
        <!-- 菜单父级 -->
        <template slot="title">
          <span>{{ item.name }}</span>
        </template>
        <!-- 子级菜单 -->
        <categorySidebar
          v-if="!$common.isEmpty(item.children)"
          :key="`category-submenu-${index}`"
          :menu-list="item.children"
          @menuItemClick="menuItemClick"
        />
      </el-submenu>

      <!-- 没子级菜单 -->
      <template v-else>
        <el-menu-item
          :key="`categoryMenu-item-${index}`"
          :index="item.productCategoryId"
          @click="menuItemClick(item)"
        >
          {{ item.name }}
        </el-menu-item>
      </template>
    </template>
  </div>
</template>

<script>
import categorySidebar from "@/views/components/categorySidebar.vue";
export default {
  name: "categorySidebar",
  components: { categorySidebar },
  props: {
    // 数据
    menuList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {};
  },
  methods: {
    menuItemClick(item) {
      this.$emit("menuItemClick", item);
    },
  },
};
</script>
