<template>
  <div class="units_container">
    <div class="units_line" v-for="tank in unusedUnits" :key="tank.id">
      <div class="units_image" @click="$emit('stakeUnit', { id: tank.id })">
        <img :src="require(`~/assets/cards/${tank.image}/dr.png`)" />
        Click to use in game
      </div>
    </div>

    <div
      v-if="unusedUnits && unusedUnits.length === 0"
      key="no_data"
      class="no_data"
    >
      No units found. You can buy units on
      <a
        target="_blank"
        href="https://wax.atomichub.io/market?collection_name=metalwargame&order=desc&schema_name=unit&sort=created&symbol=WAX"
        >this link</a
      >
      or units packs on
      <a
        target="_blank"
        href="https://wax.atomichub.io/market?collection_name=metalwargame&order=desc&schema_name=packs&sort=created&symbol=WAX"
        >this link.</a
      >
      <br />
      <!-- <img src="~/assets/hamster.png" />
        <img src="~/assets/wolf.png" />
        <img src="~/assets/hamster_pack.png" />
        <img src="~/assets/mega_pack.png" /> -->
      <br />
      if you have units but they are not displayed in this window, try changing
      the rpc endpoint in
      <button @click="$emit('tab', 4)">settings</button> or check the ban status
      of your wallet.
    </div>
    <!-- <div class="selected_units">
      <div class="selected_unit" v-for="tank in selectedUnits" :key="tank.id">
        <img :src="require(`~/assets/cards/${tank.name}/dr.png`)" />
        <div class="selected_unit_name">{{ tank.name }}</div>
      </div>
    </div> -->
  </div>
</template>
<script>
import switchbox from "./switch.vue";
import timer from "./timer.vue";
import loader from "./loader.vue";
export default {
  props: ["unusedUnits"],
  components: { switchbox, timer, loader },
  data() {
    return {
      filterGarage: "",
      ops: {
        rail: {
          border: "1px solid #a173cd",
          size: "12px",
          specifyBorderRadius: "0",
          gutterOfEnds: "35px",
          keepShow: false,
          gutterOfSide: "-15px",
        },
        scrollButton: {
          enable: true,
          background: "#a173cd",
          opacity: 1,
          step: 180,
          mousedownStep: 30,
        },
        bar: {
          showDelay: 500,
          onlyShowBarOnScroll: false,
          keepShow: true,
          background: "#a173cd",
          opacity: 1,
          hoverStyle: false,
          minSize: 0,
          size: "6px",
          disable: false,
        },
      },
    };
  },
};
</script>
<style scoped>
.button {
  font-size: 12px;
  padding: 12px 0;
}
.units_container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
}
.units_image {
  color: rgb(150, 150, 150);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  margin: 5px;
  text-align: center;
  cursor: pointer;
}
.units_image:hover {
  background: rgba(102, 51, 153, 0.3);
  border-color: transparent;
  transform: scale(1.05);
  color: rgb(207, 255, 203);
}
.units_column {
  width: 96%;
  display: flex;
  flex-wrap: wrap;
}
.units_line {
  width: 200px;
  padding-top: 10px;
  flex-wrap: wrap;
  justify-content: space-around;
}
.units_image img {
  width: 100%;
}
.garage_column {
  padding: 20px;
  width: 90%;
}
.garage_column .button {
  margin: 10px;
  padding: 5px 22px;
}
.garage_container {
  display: flex;
  flex-wrap: wrap;
  padding: 20px 0;
}
.garage {
  width: 100%;
  display: flex;
  align-items: center;
  color: white;
  margin-bottom: 25px;
  position: relative;
}
.teleport_selected {
  position: absolute;
  width: 30%;
  left: 0;
  padding: 28px;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.3);
  color: lime;
  text-align: center;
  cursor: pointer;
}
.garage img {
  width: 47%;
}
.garage_name {
  color: wheat;
  font-size: 20px;
}
.garage .button {
  margin: 0;
  padding: 12px 0;
  margin-top: 10px;
}
.here {
  color: rgb(131, 213, 165);
  font-size: 15px;
}
.garage_coordinates,
.garage_count {
  font-size: 12px;
}
</style>
