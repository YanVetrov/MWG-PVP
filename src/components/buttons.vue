<template>
  <div class="buttons">
    <transition name="fade" mode="out-in" duration="100">
      <div
        @click="$emit('raid')"
        title="RAID"
        key="0"
        v-if="currentTank.type === 'battle' && !currentTank.locked && !block"
        class="button raid"
      >
        RAID
      </div>
      <span class="timer" key="1" v-if="lockedTime">{{ lockedTime }}</span>
      <loader v-if="block" :key="5" />
      <div
        @click="$emit('mine')"
        key="2"
        v-if="currentTank.type === 'miner' && !currentTank.locked && !block"
        class="button mine"
      >
        MINE
      </div>
    </transition>
  </div>
</template>
<script>
import loader from "./loader";
export default {
  components: { loader },
  props: ["currentTank", "lockedTime", "block"]
};
</script>
