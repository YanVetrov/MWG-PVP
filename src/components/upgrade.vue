<template>
  <div class="upgrade">
    <div style="color:green">{{ amount | number_format }}:</div>
    <button @click="buy">{{ cost | number_format }} SHH</button>
    <div class="upgrade-info">{{ help }}</div>
  </div>
</template>
<style scoped>
.upgrade {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
<script>
export default {
  props: ["cash", "initial_cost", "increase", "title", "tooltip"],
  data: function() {
    return {
      //cost: this.initial_cost,
      cost_increase: this.increase,
      base_cost: this.initial_cost,
      amount: 0,
      name: this.title,
      help: this.tooltip
    };
  },
  computed: {
    cost: function() {
      return (this.base_cost * Math.pow(this.cost_increase, this.amount)) | 0;
    }
  },
  template: "#upgrade-template",
  methods: {
    buy: function(event) {
      if (this.cash >= this.cost) {
        this.$emit("purchase", this.cost);
        this.$emit("upgrade");
        //this.cost_increase += 1;
        this.amount += 1;
      }
    }
  }
};
</script>
