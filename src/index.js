import Vue from "vue";
import App from "./App.vue";
import vuescroll from "vuescroll";
import "./style.css";
Vue.config.productionTip = false;
import Vuex from "vuex";

new Vue({
  render: h => h(App),
}).$mount("#app");
Vue.use(vuescroll, {
  ops: {},
  name: "scroll",
});
Vue.use(Vuex);
