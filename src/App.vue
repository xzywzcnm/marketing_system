<template>
  <div id="app">
    <div v-if="showSke">
      <skeleton />
    </div>
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import skeleton from "@/skeleton/default/Skeleton.vue";
export default {
  name: 'App',
  components: {
    skeleton,
  },
  computed: {
    ...mapGetters(["showSke"]),
  },
  mounted () {},
}
</script>

<style>
#app {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #515a6e;
  line-height: 20px;
}
</style>