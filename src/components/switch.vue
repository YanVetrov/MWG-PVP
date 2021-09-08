<template>
  <label class="switch" @click="disabled ? '' : $emit('change', !checked)">
    <input type="checkbox" :checked="checked" :disabled="true" />
    <div class="slider round" :class="{ logo, [color]: true }">
      {{ formatted }}
    </div>
  </label>
</template>
<script>
export default {
  props: ["checked", "text", "border", "logo", "color", "disabled"],
  computed: {
    formatted() {
      let num = Number(this.text);
      if (isNaN(num)) return "";
      if (num > 1000) num = Math.floor(num / 1000) + "k";
      return num;
    },
  },
};
</script>
<style scoped>
.switch {
  display: inline-block;
  height: 17px;
  position: relative;
  width: 46px;
  margin-top: 10px;
}

.switch input {
  display: none;
}

.slider {
  /* background-color: rgba(70, 18, 21, 1); */
  bottom: 0;
  cursor: pointer;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: 0.4s;
  box-shadow: inset 0px 0px 10px black;
  border: 1px solid rebeccapurple;
}

.slider:before {
  background-color: #fff;
  box-shadow: inset 0px 0px 15px black;
  bottom: 0px;
  content: "";
  height: 15px;
  left: 0px;
  position: absolute;
  transition: 0.4s;
  width: 15px;
  font-size: 3px;
  color: #a173cd;
  background-size: 100% 100%;
  background-position-x: -0.4px;
}
.logo:before {
  /* background-image: url("../assets/tumbler.png"); */
}
.green::before {
  border: 1px solid green;
}
.gold::before {
  border: 1px solid gold;
}
.purple::before {
  border: 1px solid #a173cd;
}
.red::before {
  border: 1px solid red;
}

input:checked + .slider {
  background-color: rgba(50, 27, 54, 1);
  text-align: left;
}

input:checked + .slider:before {
  transform: translateX(27px);
}

.slider.round {
  border-radius: 34px;
  text-align: right;
  font-size: 10px;
  color: wheat;
  padding: 3px 3px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
