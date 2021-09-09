<template>
  <div
    class="units_container"
    style="display:flex;flex-direction:column;align-items:center;overflow-y:scroll;"
  >
    <div class="units_line" style="width:100%">
      <div
        class="button raid"
        style="flex-direction:column;height:auto;font-size:16px;width:60%;margin-top:20px;padding:16px 0"
        @click="$emit('exchange', { id: 0, pdt: PDTCount, cdt: CDTcount })"
      >
        <div>EXCHANGE {{ PDTCount }} PDT = {{ count }} CDT</div>
        <div style="color:wheat">[{{ PDT }} PDT available]</div>
      </div>
      <div
        class="button raid"
        style="height:auto;font-size:16px;width:10%;margin-top:20px"
        @click="multiCount(-1)"
      >
        <div>-</div>
      </div>
      <div
        class="button raid"
        style="height:auto;font-size:16px;width:10%;margin-top:20px"
        @click="multiCount(1)"
      >
        <div>+</div>
      </div>
      <div
        class="button raid"
        style="height:auto;font-size:16px;width:20%;margin-top:20px"
        @click="multiCount(Math.floor(PDT / 12) - count)"
      >
        <div>ALL</div>
      </div>
    </div>
    <div class="units_line" v-for="tank in unique" :key="tank.id">
      <div class="units_image">
        <img
          :style="{ opacity: tank.locked ? 0.5 : 1 }"
          :src="require(`~/assets/${tank.image}`)"
        />
        <div style="color:wheat;text-align:center">{{ tank.name }}</div>
      </div>
      <label class="units_ingame" style="position:relative"
        >USE IN GAME <br />
        <switchbox
          type="checkbox"
          @change="$emit('switchTank', { id: tank.id, value: $event })"
          :checked="tank.inGame"
        />
      </label>
      <div class="units_action min" v-if="tank.inGame">
        <div
          class=" mini"
          @click="$emit('raid', tank)"
          key="2"
          :style="{ opacity: tank.locked ? 0.5 : 1 }"
          v-if="tank.type === 'unit'"
        >
          RAID
        </div>
        <div
          @click="$emit('mine', tank)"
          key="2"
          :style="{
            opacity: tank.locked ? 0.5 : 1,
            textAlign: 'center',
            fontSize: '14px',
          }"
          v-if="tank.type === 'discount'"
          class=" mini"
        >
          next token:
          <span style="color:wheat">{{ getNextClaim(tank.last_claim) }}</span>
          <br /><br />Last claim:
          <span style="color:wheat">{{ getDate(tank.last_claim) }}</span>
        </div>
      </div>
      <div class="units_action " v-if="tank.inGame">
        <div
          class="button raid"
          style="flex-direction:column;height:auto"
          @click="$emit('claim', { id: tank.id })"
        >
          <!-- <div class="mini">{{ tank.name }}</div> -->

          <div>CLAIM[{{ getCount(tank.last_claim) }}]</div>
        </div>
      </div>
    </div>

    <div v-if="unique && unique.length === 0" class="no_data">
      No unique units found. You can buy unique units on
      <a
        target="_blank"
        href="https://wax.atomichub.io/market?collection_name=metalwargame&order=desc&schema_name=collectibles&sort=created&symbol=WAX"
        >this link.</a
      >
      <br />
      <img src="../assets/CDT.png" />
      <img src="../assets/PDT.png" />
      <img src="../assets/MDT.png" />
    </div>
  </div>
</template>
<script>
import switchbox from "~/components/switch.vue";
export default {
  props: ["tanks", "unique", "PDT"],
  components: { switchbox },
  data() {
    return {
      count: 1,
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
  computed: {
    CDTcount() {
      return this.count;
    },
    PDTCount() {
      return this.count * 12;
    },
  },
  methods: {
    multiCount(val) {
      if ((this.count + val) * 12 > this.PDT || this.count + val < 0) return 0;
      this.count += val;
    },
    getDate(num) {
      let date = new Date(num * 1000);
      if (isNaN(date)) return "not found.";
      return `${date.getDate()}/${date.getMonth() +
        1} ${date.getHours()}:${date.getMinutes()}`;
    },
    getCount(num) {
      let tokens = Math.floor((Date.now() / 1000 - num) / 60 / 30);
      if (tokens < 0 || isNaN(tokens)) return 0;
      return tokens;
    },
    getNextClaim(num) {
      let counts = Date.now() / 1000 - num;
      let minutes = 30 - ((counts / 60) % 30);
      let seconds = 60 * (minutes % 1);
      minutes = Math.floor(minutes);
      seconds = Math.floor(seconds);
      if (minutes < 10) minutes = "0" + minutes;
      if (seconds < 10) seconds = "0" + seconds;
      return `${minutes}:${seconds}`;
    },
  },
};
</script>
<style scoped>
.big {
  width: 50%;
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
