<template>
  <div class="notify_main" :class="type" @click="$emit('tap', ident)">
    <img v-if="img" :src="require(`~/assets/${img}`)" />
    {{ text }}
  </div>
</template>
<script>
export default {
  props: ["text", "type", "img", "ident"],
  created() {
    setTimeout(() => this.$emit("tap", this.ident), 10000);
  }
};
</script>
<style scoped>
.notify_main {
  max-width: 350px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-left: 2px solid #a173cd;
  margin-top: 10px;
  display: flex;
  align-items: center;
  font-size: 15px;
}

img {
  width: 50px;
  margin: 5px;
}
@media screen and (max-width: 813px) {
  .notify_main {
    margin-top: -13px;
    transform: scale(0.7);
  }
}
</style>
