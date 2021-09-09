<template>
  <div
    class="track_container"
    @click="$emit('tap')"
    :style="{ left: left + 'px' }"
  >
    <div class="now playing" id="music">
      <span class="bar n1">A</span>
      <span class="bar n2">B</span>
      <span class="bar n3">c</span>
      <span class="bar n4">D</span>
      <span class="bar n5">E</span>
      <span class="bar n6">F</span>
      <span class="bar n7">G</span>
      <span class="bar n8">H</span>
    </div>
    <div class="track_name">
      <div style="font-size:10px">now playing:</div>
      <div>{{ title }}</div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["title"],
  data() {
    return {
      left: -500,
    };
  },
  watch: {
    title() {
      this.left = 0;
      setTimeout(() => (this.left = -500), 5000);
    },
  },
};
</script>
<style scoped>
.track_container {
  position: fixed;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  padding: 20px;
  left: 20px;
  top: 20px;
  display: flex;
  color: antiquewhite;
  align-items: center;
  font-size: 15px;
}
.playing {
  position: relative;
  transform: scale(0.4);
  top: 10px;
  margin-left: -41px;
}
.now.playing .bar {
  display: inline-block;
  position: relative;
  margin-right: 1px;
  width: 10px;
  height: 1px;
  overflow: hidden;
  background: silver;
  color: transparent;
  animation-name: pulse;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}
.paused.playing .bar {
  animation-iteration-count: 1;
}
.n1 {
  animation-delay: 0.5s;
}
.n2 {
  animation-delay: 0.2s;
}
.n3 {
  animation-delay: 1.2s;
}
.n4 {
  animation-delay: 0.9s;
}
.n5 {
  animation-delay: 2.3s;
}
.n6 {
  animation-delay: 1.3s;
}
.n7 {
  animation-delay: 3.1s;
}
.n8 {
  animation-delay: 1.9s;
}
@keyframes pulse {
  0% {
    height: 1px;
    margin-top: 0;
  }
  10% {
    height: 40px;
    margin-top: -40px;
  }
  50% {
    height: 20px;
    margin-top: -20px;
  }
  60% {
    height: 30px;
    margin-top: -30px;
  }
  80% {
    height: 60px;
    margin-top: -60px;
  }
  100% {
    height: 1px;
    margin-top: 0;
  }
}
</style>
