import Vuex from "vuex";
import * as store from "./store1.js";
export default new Vuex.Store({
  ...store,
  strict: false,
});
