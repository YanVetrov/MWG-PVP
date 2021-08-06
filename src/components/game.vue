<template>
  <div style="display:flex;flex-direction:column;align-items:center;width:100%">
    <div
      id="stats"
      style="display: flex;
    width: 100%;transform:translateY(100px)"
    >
      <div
        style="display: flex;
    justify-content: space-around;
    width: 100%;"
      >
        <li>{{ clickrate | number_format }} shard/click</li>
        <li>{{ cash_per_second | number_format }} shard/sec</li>
      </div>
    </div>
    <div
      style="    display: flex;
    flex-direction: column;align-items:center"
    >
      <div
        style="text-align:center;font-size: 30px;
    color: green;"
      >
        <span
          :style="{
            transform: `scale(${scale})`,
            color: cash >= 500 ? 'green' : 'orange',
            display: 'inline-block'
          }"
          >{{ cash | number_format }}</span
        >
        <span style="font-size:20px;color:white"> SHH</span>
      </div>
      <img src="~/assets/hamster_crash.png" />
      <button style="font-size:30px;color:green" @click="do_click">
        + {{ clickrate | number_format }} Shard
      </button>
    </div>

    <div id="store" style="font-size:12px;width:100%;margin-top:20px;">
      <div style="display:flex;justify-content:space-around">
        <div>
          <upgrade
            :title="'Tool'"
            :tooltip="'Double shard per click'"
            :cash="cash"
            :initial_cost="10"
            :increase="2.8"
            @purchase="charge"
            @upgrade="double_clickrate"
          ></upgrade>
        </div>
        <div>
          <upgrade
            :title="'Factory'"
            :tooltip="'+ 1 SHH per sec'"
            :cash="cash"
            :initial_cost="30"
            :increase="1.15"
            @purchase="charge"
            @upgrade="increase_cash_sec"
          ></upgrade>
        </div>
        <div>
          <upgrade
            :title="'Factory'"
            :tooltip="'+ 10 SHH per sec'"
            :cash="cash"
            :initial_cost="3000"
            :increase="1.2"
            @purchase="charge"
            @upgrade="increase_cash_sec_by_ten"
          ></upgrade>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
* {
  color: white;
}
img {
  width: 80px;
  margin: 10px;
}
</style>
<script>
import upgrade from "./upgrade";
export default {
  components: { upgrade },
  data() {
    return {
      cash: 0,
      clickrate: 1,
      cps_multiplier: 1,
      cps_units: 0,
      show: false,
      scale: 1,
      timeout: "",
      cache: 0
    };
  },
  computed: {
    cash_per_second: function() {
      return this.cps_units * this.cps_multiplier;
    }
  },
  filters: {
    number_format: function(number) {
      if (number >= 1e6) return numberformat.formatShort(Number(number));
      else return number.toLocaleString("en-US");
    }
  },
  methods: {
    charge: function(cost) {
      this.cash -= cost;
      this.$emit("gameclick");
    },
    double_clickrate: function() {
      this.clickrate *= 2;
    },
    increase_cash_sec: function() {
      this.cps_units += 1;
    },
    increase_cash_sec_by_ten: function() {
      this.cps_units += 10;
    },
    do_click: function() {
      //   this.$emit("gameclick");
      this.cash += this.clickrate;
      this.cache = this.cash;
      this.scale = 1.3;
      setTimeout(() => (this.scale = 1), 100);
    }
  },
  created: function() {
    var that = this;
    window.setInterval(function() {
      that.cash += that.cash_per_second;
    }, 1000);
  }
};
</script>
