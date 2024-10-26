<template>
  <div class="detailModel__main">
    <transition name="fade">
      <div v-show="detailVisible" class="detailModel__main__page">
        <div class="detailModel__main__page__content">
          <div class="page__content__acticle">
            <slot />
          </div>
          <slot name="footer">
            <div class="page__content__footer">
              <el-button type="primary" :loading="loading" @click="confirmBtn">
                确认
              </el-button>
              <el-button @click="cancelBtn">
                取消
              </el-button>
            </div>
          </slot>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  name: "DetailModel",
  components: {},
  props: {
    detailVisible: {
      type: Boolean,
      default() { return false }
    }
  },
  data() {
    return {
      loading: false,
    }
  },
  created() { },
  methods: {
    // 确定
    confirmBtn() {
      this.$emit("confirmBtn");
    },
    // 取消
    cancelBtn() {
      this.$emit("cancelBtn");
    }
  },
}
</script>
<style lang="scss" scoped>
.detailModel__main {

  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.5s;
  }

  .fade-enter,
  .fade-leave-to

  /* .fade-leave-active below version 2.1.8 */
    {
    opacity: 0;
    transform: translateX(100%);
  }

  .detailModel__main__page {
    background: #fff;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  .detailModel__main__page__content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .page__content__acticle {
    flex: 1;
    overflow: hidden;
  }

  .page__content__footer {
    padding: 20px 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>