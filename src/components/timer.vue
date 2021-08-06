<template>
  <span>{{ getTime }}</span>
</template>
<script>
export default {
  props: ["time"],
  data() {
    return {
      tmp: "",
      intevral: ""
    };
  },
  computed: {
    getTime() {
      if (this.time > Date.now()) {
        this.tmp;
        let minutes = Math.floor((this.time - Date.now()) / 60000);
        let seconds = (((this.time - Date.now()) % 60000) / 1000).toFixed(0);
        let hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        if (minutes < 10) minutes = "0" + minutes;
        if (hours < 10) hours = "0" + hours;
        this.tmp = seconds;
        return (
          hours + ":" + minutes + ":" + (seconds < 10 ? "0" : "") + seconds
        );
      } else return null;
    }
  },
  created() {
    this.intevral = setInterval(() => (this.tmp = Date.now()), 1000);
  },
  beforeDestroy() {
    clearInterval(this.intevral);
  }
};
</script>
