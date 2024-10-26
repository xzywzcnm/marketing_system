<template>
  <div :ref="`dome-${dytRefFilter}`" class="dyt-filter-dome"
    :style="`${!isExpand ? 'max-height:' + defaultHeight * filterRow + 'px;' : ''}`"
    :class="{ 'dyt-filter-expand': isExpand }" @scroll="dytFilterDomeScroll">
    <div :ref="`filter-btn-${dytRefFilter}`" class="filter-search-btn">
      <div :ref="`serach-${dytRefFilter}`">
        <slot name="operation">
          <el-button type="primary" icon="el-icon-search" class="operation-button" @click="btnsHand('submit')">
            查询
          </el-button>
          <el-button icon="el-icon-refresh-left" class="operation-button ml10" @click="btnsHand('refresh')">
            重置
          </el-button>
        </slot>
      </div>
      <el-button v-if="showMoreBtn" type="primary" class="expand-button"
        :icon="isExpand ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" @click="expandHand" />
    </div>
    <div :ref="`dytFilter-${dytRefFilter}`" class="filter-main">
      <slot />
    </div>
  </div>
</template>
<script>

export default {
  name: 'DytFilter',
  components: {},
  props: {
    filterRow: {
      type: Number,
      default: 1
    },
    // 是否显示更多按钮
    isShowMoreBtn: {
      type:Boolean,
      default:true
    }
  },
  data() {
    return {
      dytRefFilter: `${new Date().getTime()}`,
      loading: false,
      isExpand: false,
      showMoreBtn: true,
      defaultHeight: 42
    }
  },
  computed: {},
  watch: {
    isShowMoreBtn: {
      immediate: true,
      handler (val) {
        this.showMoreBtn = val;
      }
    },
  },
  created() { },
  mounted() {
    this.init();
    // 订阅 resize 事件
    window.addEventListener('resize', this.resizeHand);
  },
  // 组件销毁前
  beforeDestroy() {
    // 通过有名函数 解除事件订阅
    window.removeEventListener('resize', this.resizeHand);
  },
  methods: {
    // 初始化模块
    init() {
      this.$nextTick(() => {
        this.$slots.default && this.$slots.default.forEach(solt => {
          if (!solt && solt.elm.className.includes('filter-main-item')) {
            solt.elm.className = `${solt.elm.className} filter-main-item`;
          }
        })
        this.resizeHand();
      })
    },
    // 展开收起
    expandHand() {
      this.isExpand = !this.isExpand;
      this.$nextTick(() => {
        const dome = this.$refs[`dome-${this.dytRefFilter}`];
        if (dome) return;
        this.btnDistance();
        this.$emit('expand', {
          isExpand: this.isExpand,
          filterWidth: dome.offsetWidth,
          filterHeigth: dome.offsetHeight
        });
        this.$emit('width-change', {
          isExpand: this.isExpand,
          filterWidth: dome.offsetWidth,
          filterHeigth: dome.offsetHeight
        })
        this.$nextTick(() => {
          this.init(true);
        })
      })
    },
    // 窗口大小变化处理
    resizeHand(type) {
      this.$nextTick(() => {
        const dome = this.$refs[`dome-${this.dytRefFilter}`];
        const main = this.$refs[`dytFilter-${this.dytRefFilter}`];
        if (!dome || !main) return;
        this.showMoreBtn = main.offsetHeight > (this.defaultHeight * (this.filterRow + 0.3));
        this.btnDistance();
        this.$emit('width-change', {
          isExpand: this.isExpand,
          filterWidth: dome.offsetWidth,
          filterHeigth: dome.offsetHeight
        })
      })
    },
    btnDistance() {
      const tool = {
        hand: () => {
          this.$nextTick(() => {
            const dome = this.$refs[`dome-${this.dytRefFilter}`];
            const btnDome = this.$refs[`filter-btn-${this.dytRefFilter}`];
            if (!dome || btnDome) return;
            if (this.$slots.default) {
              let leftBistance = 0;
              this.$slots.default.forEach(solt => {
                if (this.$slots.default[0].elm.offsetTop == solt.elm.offsetTop) {
                  let computedStyle = null;
                  // 兼容IE和火狐谷歌等的写法
                  if (window.getComputedStyle) {
                    computedStyle = getComputedStyle(solt.elm);
                  } else {
                    // 兼容IE的写法
                    computedStyle = solt.elm.currentStyle;
                  }
                  const mr = (computedStyle && computedStyle.marginRight.replace(/[^\d]/g, '')) - 0;//元素右边距
                  const ml = (computedStyle && computedStyle.marginLeft.replace(/[^\d]/g, '')) - 0;//元素左边距
                  leftBistance += (solt.elm.offsetWidth + mr + ml);
                }
              })
              leftBistance = leftBistance + btnDome.offsetWidth - dome.offsetWidth + 10;
              this.$refs[`serach-${this.dytRefFilter}`].style.transform = `translateX(${leftBistance}px)`;
            }
          })
        }
      }
      // 由于页面渲染问题，目前没有找到对应解决方法，暂时使用定时器，后续优化
      this.$nextTick(() => {
        tool.hand();
        setTimeout(() => {
          tool.hand()
        }, 100)
        setTimeout(() => {
          tool.hand()
        }, 200)
        setTimeout(() => {
          tool.hand()
        }, 400)
        setTimeout(() => {
          tool.hand()
        }, 800)
      })
    },
    btnsHand(str) {
      this.$emit('operation', str)
    },
    // 当发生滚动时，重置为0
    dytFilterDomeScroll(e) {
      if (!this.isExpand && e.target.scrollTop !== 0) {
        e.target.scrollTop = 0
      }
    }
  }
};
</script>
<style scoped lang="less">
.dyt-filter-dome {
  // padding-top: 10px;
  overflow: hidden;

  .filter-search-btn {
    display: flex;
    float: right;
    margin: 0;

    .operation-button {
      i {
        font-size: 25px;
      }
    }

    .expand-button {
      margin-left: 10px;
      // padding: 0 5px;
      // font-size: 24px;
      // i {
      //   vertical-align: 0;
      // }
    }
  }

  .filter-main {
    .filter-main-item {
      position: relative;
      display: inline-block;
      margin: 0 10px 11px 0;
      vertical-align: top;
    }
  }
}
</style>
<style lang="less">
.ivu-form {
  .dyt-filter-dome {

    // select - satrt
    .ivu-select-default.ivu-select-multiple {
      .ivu-select-selection {
        height: 32px;
        overflow: hidden;
      }
    }

    // select - end
    .vue-treeselect {
      height: 33px;
      border: 1px solid #ddd;
      border-radius: 5px;
      overflow: hidden;
    }

    .vue-treeselect__control {
      border: none;
    }

    // end
    .filter-search-btn {
      .operation-button {
        i {
          font-size: 18px;
        }
      }
    }

    textarea.ivu-input {
      height: 32px;
    }

    // 展开
    &.dyt-filter-expand {
      .ivu-select-default.ivu-select-multiple {
        .ivu-select-selection {
          height: auto;
        }
      }

      .vue-treeselect {
        height: auto;
      }

      textarea.ivu-input {
        height: auto;
      }
    }
  }
}
</style>
