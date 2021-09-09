<template>
  <div class="units_container" style="overflow-y:scroll;">
    <div class="units_line" v-for="pack in packs" :key="pack.id">
      <div class="units_image">
        <img :src="require(`~/assets/${pack.image}`)" />
      </div>

      <div class="units_action big" @click="$emit('unpack', { id: pack.id })">
        <div class="button raid" style="flex-direction:column">
          <div class="mini">{{ pack.name }}</div>
          <div class="medium">UNPACK</div>
          <!-- <div class="yellow">{{ pack.count }}</div> -->
        </div>
      </div>
    </div>
    <div v-if="packs && packs.length === 0" class="no_data">
      No packs found. You can buy packs on
      <a
        target="_blank"
        href="https://wax.atomichub.io/market?collection_name=metalwargame&order=desc&schema_name=box&sort=created&symbol=WAX"
        >this link.</a
      >
      <br />
      <img src="../assets/pack50.png" />
      <img src="../assets/pack500.png" />
    </div>
  </div>
</template>
<script>
export default {
  props: ["packs"],
  data() {
    return {
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
.big {
  width: 80%;
}
.units_line {
  justify-content: space-between;
}
.units_action div {
  width: 100%;
}
.mini {
  -webkit-text-stroke-width: 0;
  color: #a173cd;
  font-size: 20px;
  margin: 0;
}
.medium {
  font-size: 30px;
}
.button {
  height: 130px;
}
.yellow {
  color: yellow;
  font-size: 25px;
}
</style>
