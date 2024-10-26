import {
  pick,
  clone,
  cloneDeep,
  orderBy,
  findIndex,
  find,
  uniqBy,
  filter,
} from 'lodash';
import Vue from 'vue';


let buildLodash = {
  install: function(Vue) {
    Object.defineProperty(Vue.prototype, '_', {
      value: {
        // debounce,
        pick,
        clone,
        cloneDeep,
        orderBy,
        findIndex,
        find,
        uniqBy,
        filter,
      },
    });
  }
};

Vue.use(buildLodash);
