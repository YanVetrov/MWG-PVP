<template>
  <div>
    <span class="shards_name">{{ name }}</span>
    <img
      v-if="code !== 'PUMPKIN'"
      :key="0"
      :src="require(`~/assets/${image.split('.')[0]}_crash.png`)"
    />
    <img v-else style="filter:none" :key="0" src="../assets/pumpkin_card.png" />
    <span style="font-size:17px"
      ><span :style="{ color: shards < limit ? 'orange' : 'green' }">{{
        shards
      }}</span
      >/{{ limit }}</span
    >
    <div
      @click="$emit('shardsToNft', { shardCode: code })"
      :style="{ opacity: shards < limit ? 0.5 : 1 }"
      class="button raid"
    >
      CRAFT UNIT
    </div>
    <div
      style="display:flex;justify-content:space-around;width:100%;align-items:center"
      v-if="code !== 'PUMPKIN'"
    >
      <div
        style="padding:2px;margin:2px"
        @mousedown="minus"
        @mouseup="clear"
        class="button"
      >
        -
      </div>
      <span style="font-size:20px;color:orange;">{{ count }}</span>
      <div
        style="padding:2px;margin:2px;"
        @mousedown="plus"
        @mouseup="clear"
        class="button"
      >
        +
      </div>
    </div>
    <div
      @click="$emit('craftMech', { count, shardCode: code })"
      class="button raid"
      v-if="code !== 'PUMPKIN'"
    >
      GET {{ mechFromShards }} MECH TOKENS
    </div>
  </div>
</template>
<script>
export default {
  props: ["ident", "name", "image", "shards", "code", "mechShard"],
  watch: {
    shards(fresh, old) {
      if (old === null) return 0;
      let count = fresh - old;
      if (count > 0) count = "+" + count;
    },
  },
  data() {
    return {
      count: 0,
      interval: "",
      timeout: "",
    };
  },
  methods: {
    clear() {
      clearInterval(this.interval);
      clearTimeout(this.timeout);
    },
    plus() {
      if (this.count < this.shards) this.count++;
      this.timeout = setTimeout(() => {
        this.interval = setInterval(() => {
          if (this.count < this.shards) this.count++;
          else clearInterval(this.interval);
        }, 30);
      }, 300);
    },
    minus() {
      if (this.count > 0) this.count--;
      this.timeout = setTimeout(() => {
        this.interval = setInterval(() => {
          if (this.count > 0) this.count--;
          else clearInterval(this.interval);
        }, 30);
      }, 300);
    },
  },
  computed: {
    mechFromShards() {
      return this.count * this.mechShard ?? 0;
    },
    limit() {
      if (this.code === "PUMPKIN") return 1000;
      else return 500;
    },
  },
};
</script>
<style scoped>
.button {
  font-size: 12px;
  padding: 25px 0;
}
</style>
