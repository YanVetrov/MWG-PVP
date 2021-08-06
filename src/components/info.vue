<template>
  <div class="info">
    <!-- <div class="info_container">
      <div class="info_line" v-for="line in lines" :key="line.key">
        <div class="info_key">{{ line.key }}</div>
        <div class="info_value" :key="line.key">
          {{ currentTank[line.key] }}
        </div>
      </div>
    </div> -->

    <div class="repair info_button" @click="$emit('info', 0)">
      INFO
    </div>
    <span class="console">MetalWarGame:console {{ user }} > </span>
    <transition-group tag="div" name="fade" class="notification_container">
      <div
        class="info_notification"
        :class="not.type"
        v-for="not in notify"
        :key="not.id"
        @click="$emit('notificationTap', not.id)"
      >
        <div class="notification_time">
          <img v-if="not.img" :src="require(`~/assets/${not.img}`)" />{{
            getDate(not.id)
          }}
        </div>
        <vue-typer :type-delay="40" :repeat="0" :text="not.text"></vue-typer>
      </div>
    </transition-group>
    <div
      class="repair"
      @click="$emit('repair', { count: repair, id: currentTank.id })"
      :style="{ opacity: repair == 0 ? 0.5 : 1 }"
    >
      REPAIR[
      <div class="repair_price">{{ repair }}</div>
      ]
    </div>
  </div>
</template>
<script>
export default {
  props: ["lines", "currentTank", "unique", "packs", "units", "shards", "user"],
  methods: {
    getDate(id) {
      let date = new Date(id);
      let hours = date.getHours();
      if (hours < 10) hours = "0" + hours;
      let minutes = date.getMinutes();
      if (minutes < 10) minutes = "0" + minutes;
      return `${hours}:${minutes}`;
    }
  },
  computed: {
    repair() {
      let discount = 0;
      if (this.currentTank.discountEnabled) discount = 0.03;
      if (this.currentTank.discountTypeEnabled) discount = 0.2;
      return Math.ceil(
        this.currentTank.repair - this.currentTank.repair * discount
      );
    },
    notify() {
      return this.$store.getters["global/cache"].slice().reverse();
    }
  }
};
</script>
<style scoped>
.info_button {
  background: rgba(0, 0, 0, 0.3);
  text-shadow: 1px 1px 2px black;
  -webkit-text-stroke-width: 0.005px;
  -webkit-text-stroke-color: #a173cd;
  font-size: 25px;
  border: 2px solid #a173cd;
}
.info_notification {
  display: flex;
  align-items: center;
  font-size: 11px;
  padding: 5px;
  text-align: left;
  opacity: 1;
}
.info_notification img {
  width: 35px;
  margin: 3px;
}
.notification_container {
  height: 70%;
  /* background: rgba(100, 250, 100, 0.1); */
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  color: white;
  /* font-family: monospace; */
  font-weight: 400;
}

.notification_time {
  font-size: 9px;
  width: 20%;
  color: gray;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.console {
  display: block;
  font-size: 9px;
  text-align: left;
  width: 100%;
}
@media screen and (max-width: 813px) {
  .info_notification {
    display: flex;
    align-items: center;
    font-size: 9px;
    padding: 5px;
    text-align: center;
  }
  .info_notification img {
    width: 20px;
    margin: 2px;
  }
  .notification_container {
    height: 50%;
  }
  .notification_time {
    width: 30%;
    font-size: 7px;
  }
  .console {
    font-size: 8px;
  }
}
</style>
