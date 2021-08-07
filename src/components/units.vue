<template>
  <scroll :ops="ops">
    <div class="units_container">
      <div class="units_column">
        <div
          class="units_line"
          :style="{ opacity: tank.load && !tank.repairing ? 1 : 0.5 }"
          v-for="tank in tanks"
          :key="tank.id"
        >
          <div class="units_image">
            <div
              class="crash"
              style="font-size:14px;width:auto"
              v-if="calcHP(tank) == 0"
            >
              NEED REPAIR
            </div>
            <div
              v-if="tank.stuff.reduce((acc, el) => (acc += el.amount), 0) > 0"
              style="display:flex;position:absolute;align-items:center;color:wheat;width:80%;"
            >
              {{
                tank.stuff.reduce(
                  (acc, el) => (acc += el.weight * el.amount),
                  0
                )
              }}/{{ tank.capacity }}
              <div
                @click="$emit('dropStuff', { id: tank.asset_id })"
                class="button"
                style="padding:5px;margin:10px;"
              >
                drop[{{
                  tank.stuff.reduce((acc, el) => (acc += el.amount), 0)
                }}]
              </div>
            </div>
            <img :src="require(`~/assets/cards/${tank.name}/dr.png`)" />
            <div class="hp_bar" v-if="!isNaN(tank.hp)">
              <div class="hp_line" :style="{ width: calcHP(tank) + '%' }"></div>
              <div class="hp_text">{{ tank.hp }}/{{ tank.strength }}</div>
            </div>
            <switchbox
              :checked="tank.discountEnabled"
              @change="
                $emit('enableDiscount', {
                  value: $event,
                  id: tank.id,
                  type: 'all',
                })
              "
              :text="PDT || 0"
              :logo="true"
              :disabled="PDT === 0"
              color="purple"
            />
            <switchbox
              @change="
                $emit('enableDiscount', {
                  value: $event,
                  id: tank.id,
                  type: tank.type,
                })
              "
              :checked="tank.discountTypeEnabled"
              :text="tank.type === 'battle' ? CDT || 0 : MDT || 0"
              :color="tank.type === 'battle' ? 'red' : 'green'"
              :logo="true"
              :disabled="
                (tank.type === 'battle' && CDT === 0) ||
                  (tank.type === 'miner' && MDT === 0)
              "
            />
            <div
              class="button raid"
              :style="{
                opacity:
                  Math.ceil((tank.strength - tank.hp) / 2) == 0 ? 0.5 : 1,
              }"
              @click="
                $emit('repair', {
                  count: Math.ceil((tank.strength - tank.hp) / 2),
                  id: tank.asset_id,
                })
              "
            >
              REPAIR[
              <div class="repair_price">
                {{ Math.ceil((tank.strength - tank.hp) / 2) }}
              </div>
              ]
            </div>
            <div class="button raid" @click="$emit('deploy', tank)" key="2">
              <span v-if="!tank.locked">DEPLOY</span>
              <timer v-else :time="tank.unlockedTime" />
            </div>
          </div>
        </div>
        <div v-if="tanks && tanks.length === 0" class="no_data">
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
          if you have units but they are not displayed in this window, try
          changing the rpc endpoint in
          <button @click="$emit('tab', 4)">settings</button> or check the ban
          status of your wallet.
        </div>
      </div>
      <div class="garage_column">
        <div style="display:flex;">
          <div class="button raid" @click="filterGarage = ''">all</div>
          <div class="button raid" @click="filterGarage = 'count'">
            with units
          </div>
          <div class="button raid" @click="filterGarage = 'empties'">
            empties
          </div>
        </div>
        <div class="garage_container">
          <div class="garage" v-for="(garage, i) in filteredGarages" :key="i">
            <img src="../assets/teleport.png" />
            <div class="garage_info">
              <div class="garage_name">TELEPORT</div>
              <div class="garage_coordinates">
                X:{{ garage.posX }} Y:{{ garage.posY }}
              </div>
              <div class="garage_count">YOUR UNITS: {{ garage.count }}</div>
              <div @click="$emit('enterGarage', garage)" class="button raid">
                ENTER GARAGE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </scroll>
</template>
<script>
import switchbox from "./switch.vue";
import timer from "./timer.vue";
import loader from "./loader.vue";
export default {
  props: [
    "tanks",
    "PDT",
    "MDT",
    "CDT",
    "block",
    "garages",
    "garageX",
    "garageY",
  ],
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
  computed: {
    filteredGarages() {
      if (this.filterGarage === "count")
        return this.garages.filter(el => el.count > 0);
      else if (this.filterGarage === "empties")
        return this.garages.filter(el => el.count == 0);
      else return this.garages;
    },
  },
  methods: {
    repair(tank) {
      let discount = 0;
      if (tank.discountEnabled) discount = 0.03;
      if (tank.discountTypeEnabled) discount = 0.2;
      return Math.ceil(tank.repair - tank.repair * discount);
    },
    getTime(time) {
      let minutes = Math.floor((time - Date.now()) / 60000);
      let seconds = (((time - Date.now()) % 60000) / 1000).toFixed(0);
      let hours = Math.floor(minutes / 60);
      minutes = minutes % 60;
      return hours + ":" + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    },
    calcHP(tank) {
      return (tank.hp / tank.strength) * 100;
    },
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
}
.units_image {
  width: auto;
  position: relative;
}
.units_column {
  width: 50%;
  display: flex;
  flex-wrap: wrap;
}
.units_line {
  width: 50%;
}
.garage_column {
  padding: 25px;
  width: 35%;
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
.garage_coordinates,
.garage_count {
  font-size: 12px;
}
</style>
