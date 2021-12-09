<template>
  <div class="units_container">
    <transition-group name="fade" tag="div" mode="out-in" class="units_column">
      <div class="units_line" v-for="tank in tanks" :key="tank.asset_id">
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
              tank.stuff.reduce((acc, el) => (acc += el.weight * el.amount), 0)
            }}/{{ tank.capacity }}
            <div
              @click="$emit('dropStuff', { id: tank.asset_id })"
              class="button"
              style="padding:5px;margin:10px;"
            >
              drop[{{ tank.stuff.reduce((acc, el) => (acc += el.amount), 0) }}]
            </div>
          </div>
          <div
            @click="
              selectedUnits.length < 10 ? (tank.selected = !tank.selected) : ''
            "
            v-if="garageId !== tank.asset_id"
            style="display:flex;position:absolute;align-items:center;color:wheat;width:30%;"
          >
            <div
              class="button"
              :class="{ raid: !tank.selected }"
              style="padding:5px;margin:10px;"
            >
              {{ tank.selected ? "-" : "+" }}
            </div>
          </div>
          <div class="rarity" :class="tank.rarity.toLowerCase()">
            {{ tank.rarity }}
          </div>
          <img
            :style="{ opacity: tank.load && !tank.repairing ? 1 : 0.5 }"
            :src="require(`~/assets/cards/${tank.image}/dr.png`)"
          />
          <button
            @click="$emit('unstake', { id: tank.asset_id })"
            class="unstake"
            v-if="garageY === 1 && garageX === 1"
          >
            unstake
          </button>
          <div
            class="hp_bar"
            v-if="!isNaN(tank.hp) && garageId !== tank.asset_id"
          >
            <div class="hp_line" :style="{ width: calcHP(tank) + '%' }"></div>
            <div class="hp_text">{{ tank.hp }}/{{ tank.strength }}</div>
          </div>
          <switchbox
            v-if="garageId !== tank.asset_id"
            :checked="tank.discountEnabled"
            @change="
              tank.discountTypeEnabled = false;
              tank.discountEnabled = $event;
            "
            :text="PDT || 0"
            :logo="true"
            :disabled="PDT === 0"
            color="purple"
          />
          <switchbox
            v-if="garageId !== tank.asset_id"
            @change="
              tank.discountEnabled = false;
              tank.discountTypeEnabled = $event;
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
            v-if="garageId !== tank.asset_id"
            class="button raid"
            :style="{
              opacity: Math.ceil((tank.strength - tank.hp) / 2) == 0 ? 0.5 : 1,
            }"
            @click="
              $emit('repair', {
                count: repair(tank),
                id: tank.asset_id,
                token: tank.discountEnabled
                  ? 'PDT'
                  : tank.discountTypeEnabled
                  ? tank.type === 'battle'
                    ? 'CDT'
                    : 'MDT'
                  : null,
              })
            "
          >
            REPAIR[
            <div class="repair_price">
              {{ repair(tank) }}
            </div>
            ]
          </div>
          <div
            v-if="garageId !== tank.asset_id"
            class="button raid"
            @click="$emit('deploy', tank)"
            key="2"
          >
            <span v-if="tank.unlockedTime < Date.now()">DEPLOY</span>
            <timer v-else :time="tank.unlockedTime" />
          </div>
          <div
            v-if="garageId === tank.asset_id"
            class="button raid"
            @click="$emit('attack', tank)"
            key="4"
          >
            <span v-if="tank.unlockedTime < Date.now()">FIRE MODE</span>
            <timer v-else :time="tank.unlockedTime" />
          </div>
          <div
            v-if="garageId === tank.asset_id"
            class="button raid"
            @click="$emit('pick', { location: garageX * 100000 + garageY })"
            key="3"
          >
            PICK
          </div>
        </div>
      </div>

      <div v-if="tanks && tanks.length === 0" key="no_data" class="no_data">
        No units found.
      </div>
    </transition-group>
    <div class="garage_column">
      <div style="display:flex;">
        <button
          :class="{ active: filterGarage === '' }"
          @click="filterGarage = ''"
        >
          all
        </button>
        <button
          :class="{ active: filterGarage === 'count' }"
          @click="filterGarage = 'count'"
        >
          with units
        </button>
        <button
          :class="{ active: filterGarage === 'empties' }"
          @click="filterGarage = 'empties'"
        >
          empties
        </button>
      </div>
      <div class="garage_container">
        <div class="garage" v-for="(garage, i) in filteredGarages" :key="i">
          <transition name="fade">
            <div
              @click="$emit('teleport', { units: selectedUnits, garage })"
              class="teleport_selected"
              v-if="
                selectedUnits.length &&
                  !(garage.posX === garageX && garage.posY === garageY)
              "
            >
              teleport units there [{{ garage.amount * selectedUnits.length }}
              MWM]
            </div>
          </transition>

          <div class="garage_info">
            <img src="../assets/teleport.png" />
            <div class="garage_coordinates">
              X:{{ garage.posX }} Y:{{ garage.posY }}
            </div>
            <div class="garage_count">
              YOUR UNITS:
              {{
                units.filter(
                  el => el.posY === garage.posY && el.posX === garage.posX
                ).length
              }}
            </div>
            <div
              class="here"
              v-if="garage.posX == garageX && garage.posY == garageY"
            >
              YOU'RE HERE
            </div>
            <div
              v-else
              @click="$emit('enterGarage', garage)"
              class="button raid"
            >
              ENTER GARAGE
            </div>
          </div>
        </div>
      </div>
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
  props: [
    "tanks",
    "units",
    "PDT",
    "MDT",
    "CDT",
    "block",
    "garages",
    "garageX",
    "garageY",
    "garageId",
    "garageOwner",
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
    selectedUnits() {
      return this.tanks.filter(el => el.selected);
    },
  },

  methods: {
    repair(tank) {
      let discount = 0;
      if (tank.discountEnabled) discount = 0.03;
      if (tank.discountTypeEnabled) discount = 0.2;
      let repair = Math.ceil(tank.strength - tank.hp) / 2;
      return Math.ceil(repair - repair * discount);
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
  width: 96%;
  display: flex;
  flex-wrap: wrap;
  overflow-y: scroll;
  height: 100%;
}
.units_line {
  width: 25%;
}

.garage_column {
  padding: 20px;
  width: 90%;
  overflow-y: scroll;
  height: 100%;
}
.garage_info {
  align-items: center;
  display: flex;
  flex-direction: column;
}
.garage_column .button {
  margin: 10px;
  padding: 5px 22px;
}
.garage_container {
  display: flex;
  flex-wrap: wrap;
  padding: 20px 0;
  justify-content: space-around;
}
.garage {
  width: 40%;
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
  width: 25%;
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
@media screen and (max-width: 813px) {
  .units_line {
    width: 50%;
  }
}
</style>
