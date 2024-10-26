<template>
  <div class="previewimage">
    <el-image class="pre-img" :src="url" :preview-src-list="previewSrcList" fit="cover" :style="styleObj" v-bind="$attrs">
      <slot name="error">
        <div slot="error" class="el-image__error flexAllcenter">
          <i class="el-icon-picture-outline error-icon" />
        </div>
      </slot>
      <slot name="placeholder">
        加载中...
      </slot>
    </el-image>
    <!-- 自定义内容 -->
    <div class="pre-text">
      <slot />
    </div>
  </div>
</template>
<script>
export default {
  name: "PreviewImage",
  props: {
    url: {
      type: String,
      default() { return '' },
    },
    fileList: {
      type: Array,
      default() { return [] },
    },
    styleObj: {
      type: Object,
      default() { return {} },
    },
  },
  data() {
    return {}
  },
  computed: {
    previewSrcList() {
      let list = [this.url];
      if (this.fileList && this.fileList.length) list = this.fileList;
      return list;
    },
  },
}
</script>
<style lang="scss">
.previewimage {
  position: relative;
  display: inline-block;

  .pre-img {
    width: 60px;
    height: 60px;

    .error-icon {
      font-size: 20px;
    }

    .el-image__error {
      background: #ebeef5;
    }
  }

  .pre-text {
    // margin-top: 4px;
    text-align: center;
  }

  .cancelTips {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgba(105, 104, 104, 0.6);
  }
}
</style>