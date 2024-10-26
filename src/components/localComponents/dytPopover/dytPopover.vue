<template>
  <div class="dytPopoverPage">
    <el-tooltip effect="dark" placement="top-start" :disabled="!showEllipsis" popper-class="tooltip-self">
      <div :ref="poref" class="ellips2">
        {{ content }}
      </div>
      <p slot="content" class="ellipsTips">
        {{ content }}
      </p>
    </el-tooltip>
  </div>
</template> 
<script>
export default {
  name: 'DytPopover',
  props: {
    content: { type: String, default: '' },
  },
  data() {
    return {
      poref: 'pover' + new Date().getTime() + Math.round(Math.random() * 100),
      showEllipsis: false,//是否要显示省略号
    }
  },
  mounted() {
    this.showEllipsis = this.hasEllipsis();
  },
  methods: {
    // 是否出现省略号
    hasEllipsis() {
      let box = this.$refs[this.poref];
      if (!box) return false;
      // console.log("scrollHeight: ", box.scrollHeight)
      // console.log("offsetHeight: ", box.offsetHeight)
      return box.scrollHeight > box.offsetHeight;//true:出现了省略号;false:没有出现省略号;
    }
  }
}

</script>

<style lang="less">
.dytPopoverPage {
  .ellips2 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.tooltip-self .ellipsTips {
  max-width: 500px;
  word-break: break-all;
  white-space: wrap;
  line-height: 18px;
}
</style>
