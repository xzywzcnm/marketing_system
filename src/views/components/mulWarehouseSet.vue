<template>
  <div class="mulWarehouseSetPage">
    <div v-for="(data, key) in selectList" :key="key" class="flexCenter notLastMb10">
      <div :class="{ fixWidth: selectList.length > 1 }">
        <span class="lapa icon-up_7 blueIcon right_icons" v-if="key > 0" @click="sortItem(key)"></span>
      </div>
      <dyt-select v-model="data.selectVal" class="selectSty">
        <el-option v-for="(item, index) in list" :key="key + index" :label="item[optionLabel]" :value="item[optionValue]"
          :disabled="realList.filter((k) => k || k === 0).includes(item.id)" />
      </dyt-select>
      <span class="lapa icon-zengjia blueIcon left_icons" v-if="key === 0" @click="addItem"></span>
      <span class="lapa icon-jianshao redIcon left_icons" v-if="key > 0" @click="reduceItem(key)"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: "mulWarehouseSet",
  model: {
    prop: "value", //数组
    event: "change",
  },
  props: {
    value: {
      type: Array,
      default: () => {
        return [];
      },
    },
    optionLabel: {
      type: String,
      default() {
        return "label";
      },
    },
    optionValue: {
      type: String,
      default() {
        return "value";
      },
    },
    list: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      defaultTemp: { selectVal: "" },
      selectList: [],
    };
  },
  watch: {
    value: {
      handler(list) {
        if (!list.length) {
          this.selectList = [{ selectVal: "" }];
          return;
        }
        this.selectList = list.map((k) => {
          return { selectVal: k || k === 0 ? k - 0 : k };
        });
      },
      deep: true,
      immediate: true,
    },
    realList: {
      handler(list) {
        if (JSON.stringify(list) === JSON.stringify(this.value)) return;
        this.$emit("change", list);
      },
      deep: true,
    },
  },
  // created() {
  //   this.addItem();
  // },
  computed: {
    realList() {
      return this.selectList.map((k) => k.selectVal);
    },
  },
  methods: {
    sortItem(key) {
      let num = key - 1;
      let nowItem = this.selectList[key];
      this.reduceItem(key);
      this.selectList.splice(num, 0, nowItem);
    },
    addItem() {
      this.selectList.push(this.$common.copy(this.defaultTemp));
    },
    reduceItem(key) {
      this.selectList.splice(key, 1);
    },
  },
};
</script>
<style lang="scss">
.mulWarehouseSetPage {
  .lapa {
    font-size: 20px;
  }

  .fixWidth {
    width: 24px;
  }

  .selectSty {
    flex: 1;
    overflow: hidden;
  }

  .notLastMb10:not(:last-child) {
    margin-bottom: 6px;
  }

  .right_icons {
    margin-right: 4px;
  }

  .left_icons {
    margin-left: 4px;
  }
}
</style>