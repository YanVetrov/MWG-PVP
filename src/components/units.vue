<template>
  <scroll :ops="ops">
    <div class="units_container">
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
          <img :src="require(`~/assets/cards/${tank.name}/dr.png`)" />
          <div class="hp_bar" v-if="!isNaN(tank.hp)">
            <div class="hp_line" :style="{ width: calcHP(tank) + '%' }"></div>
            <div class="hp_text">{{ tank.hp }}/{{ tank.strength }}</div>
          </div>
        </div>
        <label class="units_ingame" style="position:relative"
          >USE IN GAME <br />
          <switchbox
            v-if="tank.load && !tank.repairing"
            type="checkbox"
            @change="$emit('switchTank', { id: tank.id, value: $event })"
            :checked="tank.inGame"
          />
          <loader v-if="!tank.load" />
          <transition name="fade">
            <div
              class="gear"
              style="top: 38px;
    left: 32px;"
              v-if="tank.repairing"
            >
              <img src="../assets/gear.svg" style="width:50px" />
            </div>
          </transition>
        </label>
        <div class="units_action" :style="{ opacity: tank.inGame ? 1 : 0 }">
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
            :style="{ opacity: !tank.inGame || repair(tank) == 0 ? 0.5 : 1 }"
            @click="$emit('repair', { count: repair(tank), id: tank.id })"
          >
            REPAIR[
            <div class="repair_price">
              {{ Math.ceil((tank.strength - tank.hp) / 2) }}
            </div>
            ]
          </div>
        </div>
        <div class="units_action" :style="{ opacity: tank.inGame ? 1 : 0 }">
          <switchbox style="opacity:0;" />
          <div
            class="button raid"
            @click="$emit('deploy', tank)"
            key="2"
            :style="{ opacity: tank.locked || !tank.inGame ? 0.5 : 1 }"
            v-if="tank.type === 'battle'"
          >
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
  </scroll>
</template>
<script>
import switchbox from "./switch.vue";
import timer from "./timer.vue";
import loader from "./loader.vue";
export default {
  props: ["tanks", "PDT", "MDT", "CDT", "block"],
  components: { switchbox, timer, loader },
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
