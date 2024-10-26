/*
 * @Author: Jaycee 
 * @Date: 2021-10-07 14:54:19 
 * @Last Modified by:   Jaycee 
 * @Last Modified time: 2021-10-07 14:54:19
 */
import Vue from "vue";
import Skeleton from "./Skeleton.vue";

export default new Vue({
  components: {
    Skeleton
  },
  render: h => h(Skeleton)
});
