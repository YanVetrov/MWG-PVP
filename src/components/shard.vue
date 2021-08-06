<template>
  <div
    @click="
      shards >= 500
        ? $emit('shardsToNft', { shardCode: code })
        : $store.commit('global/notify', {
            text: 'the number of shards must be more than 500',
            type: 'regular',
            img: image
          })
    "
  >
    <span class="shards_name">{{ name }}</span>
    <img :key="0" :src="require(`~/assets/${image.split('.')[0]}_crash.png`)" />
    <span style="font-size:17px"
      ><span :style="{ color: shards < 500 ? 'orange' : 'green' }">{{
        shards
      }}</span
      >/500</span
    >
    <div :style="{ opacity: shards < 500 ? 0.5 : 1 }" class="button raid">
      CRAFT UNIT
    </div>
  </div>
</template>
<script>
export default {
  props: ["ident", "name", "image", "shards", "code"],
  watch: {
    shards(fresh, old) {
      if (old === null) return 0;
      let count = fresh - old;
      if (count > 0) count = "+" + count;
      this.$store.commit("global/notify", {
        text: `${this.name}: ${count} Shards`,
        img: this.image,
        type: "success"
      });
    }
  }
};
</script>
<style scoped>
.button {
  font-size: 12px;
}
</style>
