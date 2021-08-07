import Vue from "vue";
import App from "./App.vue";
import vuescroll from "vuescroll";
import "./style.css";
Vue.config.productionTip = false;
Vue.use(Vuex);
import Vuex from "vuex";
import * as state from "./store1.js";
let store = new Vuex.Store({
  ...state,
  strict: false,
});
new Vue({
  store,
  render: h => h(App),
}).$mount("#app");
Vue.use(vuescroll, {
  ops: {},
  name: "scroll",
});
