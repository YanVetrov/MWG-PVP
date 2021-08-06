<template>
  <transition name="fade" v-if="show">
    <div
      class="tanks_container"
      :style="{
        transform: `translateY(${translate}px)`,
        transition: 'all .5s ease'
      }"
      @mousedown.prevent="$emit('clickdown')"
      @mousemove="$emit('move', $event)"
      @mousewheel.prevent="
        $emit('wheel', $event);
        step = 0;
      "
      @touchmove.prevent="test($event)"
    >
      <div
        v-for="(tank, i) in tanks"
        :key="tank.id"
        :style="{
          opacity: tank.locked || !tank.load || tank.repairing ? 0.5 : 1,
          transform: transform(i),
          transition: 'all .3s ease',
          position: 'absolute'
        }"
        @click="tester(tank.id)"
      >
        <div class="crash" v-if="calcHP(tank) == 0">NEED REPAIR</div>
        <img
          class="tank"
          :src="require('~/assets/' + tank.image)"
          :class="{ reverse: reversed && tank.id === currentTank.id }"
        />
        <transition name="fade">
          <loader
            v-if="!tank.load"
            style="transform: translate(33px, -100px);padding:0"
          />
        </transition>
        <transition name="fade">
          <div class="gear" v-if="tank.repairing">
            <img src="~/assets/gear.svg" style="width:50px" />
          </div>
        </transition>
        <transition name="reverse">
          <div
            class="info_bar delay300"
            v-if="reversed && tank.id === currentTank.id"
          >
            <div class="info_container">
              <div class="info_line" v-for="line in lines" :key="line.key">
                <div class="info_key">{{ line.key }}</div>
                <div class="info_value" :key="line.key">
                  {{ currentTank[line.key] }}
                </div>
              </div>
            </div>
          </div>
        </transition>
        <div class="hp_bar">
          <div class="hp_line" :style="{ width: calcHP(tank) + '%' }"></div>
          <div
            class="hp_text"
            :style="{
              color: reversed && tank.id === currentTank.id ? '#00aa99' : ''
            }"
          >
            {{ tank.hp }}/{{ tank.strength }}
          </div>
        </div>
      </div>
      <loader v-if="!load && tanks.length === 0" />
    </div>
  </transition>
</template>
<script>
import loader from "~/components/loader.vue";
export default {
  components: { loader },
  props: ["currentTank", "tanks", "currentIndex", "load", "lines"],
  data() {
    return {
      initY: null,
      initX: null,
      draging: false,
      width: 63,
      translate: 0,
      wheelBlocked: false,
      renderBlock: false,
      reversed: false,
      show: false,
      step: 0,
      timeout: ""
    };
  },
  computed: {
    tanksLenght() {
      return this.tanks.length;
    }
  },
  methods: {
    tester(id) {
      console.log(id, this.currentTank.id);
      this.step++;
      this.timeout = setTimeout(() => (this.step = 0), 10000);
      if (this.step === 15 && !localStorage.getItem("game"))
        this.$emit("enableGame");
      if (id === this.currentTank.id) this.reversed = !this.reversed;
      else {
        this.step = 0;
        this.$emit("tap", id);
        this.reversed = false;
      }
    },

    transform(i) {
      let scale = 0;
      let translateY = 0;
      let multiplier = window.innerWidth < 813 ? 1.5 : 1;
      let scaleMultiplier = 1;
      if (this.currentIndex === i) scale = 1 * scaleMultiplier;
      if (this.currentIndex + 1 === i || this.currentIndex - 1 === i) {
        scale = 0.53 * scaleMultiplier;
        if (this.currentIndex + 1 === i) translateY = 330 / multiplier;
        else translateY = -330 / multiplier;
      }
      if (this.currentIndex + 2 === i || this.currentIndex - 2 === i) {
        scale = 0.4 * scaleMultiplier;
        if (this.currentIndex + 2 === i) translateY = 690 / multiplier;
        else translateY = -690 / multiplier;
      }
      if (i > this.currentIndex + 2) translateY = 1000;
      if (i < this.currentIndex - 2) translateY = -1000;
      return `scale(${scale}) translateY(${translateY}px)`;
    },
    test(e) {
      console.log(e);
      this.$emit("clickdown");
      this.$emit("move", e.touches[0]);
    },
    calcHP(tank) {
      return (tank.hp / tank.strength) * 100;
    }
  },
  mounted() {
    setTimeout(
      () => this.$emit("tap", this.tanks[0] ? this.tanks[0].id : 0),
      10
    );
    setTimeout(() => (this.show = true), 1000);
  },
  watch: {
    tanksLenght() {
      if (this.tanksLenght > 0)
        setTimeout(
          () => this.$emit("tap", this.tanks[0] ? this.tanks[0].id : 0),
          10
        );
    }
  }
};
</script>
<style scoped>
.reverse {
  transition: filter 0.3s 0.05s ease, transform 0.3s ease,
    box-shadow 0.5s 0.1s ease;
  transform: scale(-1.5, 1.5);
  filter: blur(1px) brightness(0.3) sepia(50%);
  box-shadow: 3px 3px 15px rgba(0, 0, 0, 0.5);
}
.info_bar {
  position: absolute;
  top: -6%;
  height: 100%;
  width: 100%;
  transform: scale(1.2);
  color: white;
  font-size: 10px;
}
.info_line {
  font-size: 10px;
  padding: 5px;
  text-shadow: 1px 1px 3px;
}
.info_key {
  color: wheat;
}
.tiredless {
  text-align: center;
  color: wheat;
  font-size: 13px;
}

@media screen and (max-width: 813px) {
  .info_line {
    font-size: 7px;
    padding: 2px 0px;
  }
  .tiredless {
    text-align: center;
    color: wheat;
    font-size: 11px;
  }
}
</style>
