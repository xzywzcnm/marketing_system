<template>
  <section class="app-main">
    <transition name="fade">
      <router-view />
    </transition>
  </section>
</template>

<script>
export default {
  name: "AppMain",
  computed: {},
};
</script>

<style lang="scss" scoped>
/* 可以设置不同的进入和离开动画 */
.fade-enter-active {
  transition: opacity 0.4s ease;
}

.fade-leave-active {
  display: none;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.app-main {
  min-width: 500px;
  width: 100%;
  // padding-left: 10px;
  // padding-right: 10px;
  flex: 1;
  overflow: hidden;
}
</style>
