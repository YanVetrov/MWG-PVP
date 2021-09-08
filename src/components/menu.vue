<template>
  <div class="shards_info">
    <!-- <div class="shards_info_button animate_bubble" @click="$emit('open')">
      INFO
    </div> -->
    <div
      class="shards_wrapper"
      @click.self="$emit('missclick')"
      :style="{ transition: 'opacity .3s ease' }"
    >
      <div
        class="shards_container"
        :style="{
          transform: show ? `scale(${1})` : 'scale(0)',
          transition: 'all .3s ease',
          position: 'relative',
        }"
      >
        <div class="close" @click="$emit('missclick')">
          <img src="../assets/close.svg" />
        </div>
        <div class="shards_count">
          {{ balance }} MWM
          <span style="margin-left:10px;color:silver">{{ MECH }} MECH</span>
          <!-- <div class="tabs">
            <div
              class="tab"
              @click="$emit('tabChange', i)"
              :class="{ active_tab: t === tab }"
              v-for="(t, i) in tabs"
              :style="t === 'Game' ? { color: 'black' } : {}"
              v-show="t !== 'Game' || game"
            >
              {{ t }}
            </div>
          </div> -->
        </div>
        <div class="menu_container">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["show", "tanks", "tab", "tabs", "balance", "MECH"],
  data() {
    return {
      opacity: 0,
      height: 0,
      game: localStorage.getItem("game"),
    };
  },
  computed: {
    scale() {
      if (window.innerWidth > 2000) return 1.8;
      else if (window.innerWidth > 1800) return 1.6;
      else if (window.innerWidth > 1500) return 1.2;
      else if (window.innerWidth > 813) return 1;
      else return 0.8;
    },
  },
  watch: {
    show() {
      if (!this.show) {
        this.opacity = 0;
        setTimeout(() => (this.height = 0), 400);
      } else {
        this.height = "100%";
        this.opacity = 1;
      }
    },
  },
  created() {
    this.game = localStorage.getItem("game");
  },
};
</script>
