<template>
  <div style="padding-top:30px;height:93%;overflow-y:scroll;color:white;">
    <button :class="{ active: tab === 1 }" @click="tab = 1">players</button>
    <button :class="{ active: tab === 2 }" @click="tab = 2">
      units on map
    </button>
    <transition name="fade" mode="out-in">
      <div v-if="tab === 1" :key="1">
        <span>SEARCH:</span> <input v-model="searchPlayers" />
        <span>(COUNT:{{ Object.keys(playersList).length }})</span>
        <button
          @click="onlyFriends = !onlyFriends"
          :class="{ active: onlyFriends }"
        >
          ONLY FRIENDS
        </button>
        <div class="player_line yellow">
          <div class="player_owner">OWNER</div>
          <div class="player_count" v-for="k in base" :key="k.name">
            {{ k.name }}
          </div>
          <div class="player_add">ACTION</div>
        </div>
        <div class="player_line" v-for="(el, key) in playersList" :key="key">
          <div class="player_owner">{{ key }}</div>
          <div class="player_count" v-for="k in base" :key="k.name">
            {{ el[k.name] || "0" }}
          </div>
          <div class="player_add">
            <button
              :style="
                friends[key] ? { borderColor: '#aa3333', color: '#aa3333' } : {}
              "
              @click="switchFriend(key, !friends[key])"
            >
              {{ friends[key] ? "-" : "+" }} FRIEND
            </button>
          </div>
        </div>
      </div>
      <div v-if="tab === 2" class="list_orders" :key="2">
        <div style="width:100%">
          <span>SEARCH:</span> <input v-model="searchUnits" />
          <span>(COUNT:{{ Object.keys(unitsOnMap).length }})</span>
        </div>
        <div
          class="player_line w20"
          v-for="el in unitsOnMap"
          :key="el.asset_id"
        >
          <div class="player_owner">
            <img :src="`./assets/cards/${el.name.toLowerCase()}/l.png`" />
            <div>{{ el.hp }}/{{ el.strength }}</div>
          </div>
          <div class="player_owner yellow">{{ el.owner }}</div>
          <div class="player_owner">X:{{ el.x }} Y:{{ el.y }}</div>
          <button @click="$emit('look', { x: el.x, y: el.y })">
            look at map
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import base from "../units_templates.js";
import { store } from "../store.js";
export default {
  props: ["players"],
  data() {
    return {
      base,
      tab: 1,
      searchPlayers: "",
      friends: store.friends,
      onlyFriends: false,
      searchUnits: "",
    };
  },
  computed: {
    playersList() {
      let obj = Object.values(this.players).reduce((acc, el) => {
        if (acc[el.owner]) {
          if (acc[el.owner][el.name.toLowerCase()])
            acc[el.owner][el.name.toLowerCase()]++;
          else acc[el.owner][el.name.toLowerCase()] = 1;
        } else acc[el.owner] = { [el.name.toLowerCase()]: 1 };
        return acc;
      }, {});
      if (this.searchPlayers) {
        obj = Object.keys(obj)
          .filter(key => key.match(this.searchPlayers))
          .reduce((el, key) => {
            el[key] = obj[key];
            return el;
          }, {});
      }
      if (this.onlyFriends) {
        obj = Object.keys(obj)
          .filter(key => this.friends[key])
          .reduce((el, key) => {
            el[key] = obj[key];
            return el;
          }, {});
      }
      return obj;
    },
    unitsOnMap() {
      let arr = Object.values(this.players).filter(el => {
        let inGarage = store.garages.some(
          g => g.posX === el.x && g.posY === el.y
        );
        return !inGarage;
      });
      if (this.searchUnits) {
        arr = arr.filter(el => el.owner.match(this.searchUnits));
      }
      return arr;
    },
  },
  methods: {
    switchFriend(owner, val) {
      let obj = JSON.parse(localStorage.getItem("friends"));
      if (!obj) obj = {};
      obj[owner] = val;
      localStorage.setItem("friends", JSON.stringify(obj));
      this.$set(this.friends, owner, val);
      this.$emit("friends", obj);
      store.units
        .filter(el => el.owner.text === owner)
        .forEach(el => {
          let color = 0xff3377;
          if (val) color = 0x3377ff;
          el.owner.style.fill = color;
        });
    },
  },
};
</script>
<style scoped>
.player_line {
  color: white;
  display: flex;
  padding: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  text-align: center;
  font-size: 18px;
  align-items: center;
}
.w20 {
  width: 20%;
  flex-direction: column;
  margin: 5px;
}
.yellow {
  color: burlywood;
}
.player_owner {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.list_orders {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
.player_owner img {
  width: 80px;
}
.player_count {
  width: 10%;
}
.player_add {
  width: 10%;
}
</style>
