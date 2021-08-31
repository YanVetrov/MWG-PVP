<template>
  <div>
    <span class="shards_name">{{ name }}</span>
    <img :key="0" :src="require(`~/assets/${image.split('.')[0]}_crash.png`)" />
    <span style="font-size:17px"
      ><span :style="{ color: shards < 500 ? 'orange' : 'green' }">{{
        shards
      }}</span
      >/500</span
    >
    <div
      @click="$emit('shardsToNft', { shardCode: code })"
      :style="{ opacity: shards < 500 ? 0.5 : 1 }"
      class="button raid"
    >
      CRAFT UNIT
    </div>
    <div
      style="display:flex;justify-content:space-around;width:100%;align-items:center"
    >
      <div
        style="padding:2px;margin:2px"
        @click="count > 0 ? count-- : ''"
        class="button"
      >
        -
      </div>
      <span style="font-size:20px;color:orange;">{{ count }}</span>
      <div
        style="padding:2px;margin:2px;"
        @click="count < shards ? count++ : ''"
        class="button"
      >
        +
      </div>
    </div>
    <div
      @click="$emit('craftMech', { count, shardCode: code })"
      class="button raid"
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
    };
  },
  computed: {
    mechFromShards() {
      return this.count * this.mechShard ?? 0;
    },
  },
};
</script>
<style scoped>
.button {
  font-size: 12px;
  padding: 5px 0;
}
</style>
