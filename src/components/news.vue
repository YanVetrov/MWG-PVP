<template>
  <div style="padding-top:30px;height:93%;overflow-y:scroll">
    <button :class="{ active: tab === 1 }" @click="tab = 1">News</button>
    <button :class="{ active: tab === 2 }" @click="tab = 2">
      Tech updates
    </button>
    <transition name="fade" mode="out-in">
      <div v-if="tab === 1" :key="1">
        <div class="news_block">
          <time :datetime="Date.now()">04.11.21 23:24</time>
          <h1>PVE mining</h1>
          <div class="content">
            <p>
              🔥when mining in PVE:<br />
              - no breakage<br />
              - cooling takes 8 hours<br />
              - mining is carried out according to the formula mwrewardspool
              divided by 1,000,000 rounded to whole numbers
            </p>
          </div>
        </div>
        <div class="news_block">
          <time :datetime="Date.now()">04.11.21 16:32</time>
          <h1>PVE</h1>
          <div class="content">
            <p>
              today we will be working on updating the mining in PVE mode We are
              sorry for the inconvenience.
            </p>
          </div>
        </div>
        <div class="news_block">
          <time :datetime="Date.now()">04.11.21 02:24</time>
          <h1>PVP</h1>
          <div class="content">
            <p>
              PVP Kill drop NUMBERS:<br /><br />

              WOLF= 40 MECH <br />
              ANT = 60 MECH<br />
              SKUNK = 70 MECH<br />
              RACCOON = 100 MECH<br />
              ELEPHANTOR = 140 MECH<br />
              PUMPKIN ELEPHANTOR = 140 MECH<br />
              HAMSTER = 150 MECH<br />
              GARAGE = 150 MECH<br />
              TRILOBITE = 150 MECH<br />
            </p>
          </div>
        </div>
        <div class="news_block">
          <time :datetime="Date.now()">03.11.21 16:00</time>
          <h1>ROADMAP</h1>
          <div class="content">
            <img src="../assets/roadmap.png" width="500" />
          </div>
        </div>
      </div>
      <div v-if="tab === 2" class="list_orders" :key="2">
        <div class="news_block">
          <time :datetime="Date.now()">04.11.21 16:00</time>
          <div class="content">
            <ul>
              <li>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Pellentesque euismod, urna eu tincidunt consectetur, nisi nunc
                </p>
              </li>
              <li>
                <p>
                  --fixed 2.0
                </p>
              </li>
              <li>
                <p>
                  fix chat
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tab: 1,
    };
  },
};
</script>
<style scoped>
.list_orders {
  color: white;
  margin-top: 20px;
}
.news_block {
  color: white;
  padding: 10px 0px;
  border-width: 1px 0px 1px 0px;
  border-color: rgba(255, 255, 255, 0.1);
  border-style: solid;
  margin-top: 10px;
  position: relative;
}
time {
  position: absolute;
  right: 0px;
  color: gray;
  font-size: 11px;
}
h1 {
  text-align: center;
}
.content {
  text-align: center;
}
.content p {
  text-align: left;
}
</style>
