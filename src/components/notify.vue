<template>
  <div class="notify_container" @click="$emit('clear')">
    <transition-group name="slide" tag="div">
      <banner
        v-for="(message, i) in notify"
        :key="i"
        :text="message.text"
        :img="message.img"
        :type="message.type"
        :ident="i"
        @tap="notify.splice($event, 1)"
      />
    </transition-group>
  </div>
</template>
<script>
import banner from "./banner.vue";
export default {
  components: { banner },
  props: ["notify"],
};
</script>
<style scoped>
.notify_container {
  position: fixed;
  right: 10px;
  top: 35px;
  z-index: 6;
  width: 350px;
}
@media screen and (max-width: 813px) {
  .notify_container {
    right: -24px;
    top: 10px;
  }
}
</style>
