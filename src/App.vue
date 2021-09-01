<template>
  <div class="main_view">
    <div id="login" v-show="!store.user || !ready">
      <img src="./assets/tumbler.png" />
      <div v-if="!showPrivate" style="display:flex;justify-content:center">
        <button @click="showPrivateField">
          Enter with private key
        </button>
      </div>
      <div v-else>
        <input placeholder="private key" v-model="store.privateKey" />
        <button @click="initLogin(store.privateKey)">enter</button>
      </div>
      <div v-show="!store.user" class="fake_login">
        sign in
      </div>
      <div class="loadings" tag="div" name="slide">
        <div v-for="(mes, i) in loadings" class="loading_message" :key="i">
          {{ mes }}
        </div>
      </div>
    </div>
    <transition name="slide">
      <notify :notify="errors" />
    </transition>
    <div class="alpha">open pre-alfa test: {{ store.user.accountName }}</div>
    <div class="bar_ui" v-show="store.user">
      <div class="bar_switcher" @click="activeBar = !activeBar">
        <img
          src="./assets/gear.svg"
          :style="{
            width: '10px',
            transform: activeBar ? 'rotate(360deg)' : '',
          }"
        />
      </div>
      <div
        class="bar_container"
        :class="{ bar_container_unactive: !activeBar }"
      >
        <div class="bar_units">
          <div
            class="bar_unit"
            @click="uiClick(k)"
            v-for="k in store.selfUnits"
            :key="k.asset_id"
          >
            <img :src="`./assets/cards/${k.name}/dr.png`" />
            <div>{{ k.name }}</div>
            <div style="color:mediumseagreen;font-size:10px">
              <span :style="{ color: k.hp < 20 ? 'red' : 'mediumseagreen' }">{{
                k.hp
              }}</span
              >/{{ k.strength }}
            </div>
            <div style="font-size:10px">X:{{ k.posX }} Y:{{ k.posY }}</div>
          </div>
        </div>
        <div class="bar_buttons">
          <div
            class="bar_button"
            @click="
              showGarage({ posX: 1, posY: 1 });
              activeBar = false;
            "
          >
            DEPLOY POINT
          </div>
          <div
            class="bar_button"
            @click="
              show = true;
              tab = tabs[1];
              activeBar = false;
            "
          >
            SHARDS
          </div>
          <div
            class="bar_button"
            @click="
              show = true;
              tab = tabs[4];
              activeBar = false;
            "
          >
            RENT CPU
          </div>
          <div
            class="bar_button"
            @click="
              show = true;
              tab = tabs[5];
              activeBar = false;
            "
          >
            SETTINGS
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="right_container">
      <div class="battlelog_switcher"><</div>
      <div class="battlelog_container">
        <div class="battlelog">
          <div class="battlelog_event">
            <div class="event_block">
              <img src="./assets/cards/ant/r.png" />
              <div class="event_owner">metalwartest</div>
            </div>
            <div class="event_crash">
              <img/>
            </div>
            <div class="event_block">
              <img/>
              <div class="event_owner"></div>
            </div>
            <div class="event_date">

            </div>
          </div>
        </div>
      </div>
    </div> -->
    <mainMenu
      :show="show"
      v-show="show"
      :tabs="tabs.map(el => el.name)"
      :tab="tab.name"
      :balance="store.balance"
      :MECH="store.unique.MECH"
      @tabChange="tab = tabs[$event]"
      @open="
        showShards = true;
        clickSound();
      "
      @missclick="show = false"
    >
      <transition name="fade" mode="out-in" duration="100">
        <component
          :is="tab.component"
          :tanks="unitsInTeleport"
          :unusedUnits="store.unusedUnits"
          :units="store.selfUnits"
          :garages="store.garages"
          :garageX="store.garageX"
          :garageY="store.garageY"
          :confirms="confirms"
          :soundEnabled="true"
          :musicEnabled="true"
          :fullscreen="true"
          :user="store.user"
          :shards="store.shards"
          :unique="store.collectibles"
          :waxBalance="123"
          :packs="store.packs"
          :balance="store.balance"
          :ping="123"
          :block="false"
          :CDT="store.unique.CDT"
          :PDT="store.unique.PDT"
          :MDT="store.unique.MDT"
          @repair="repair"
          @order="orderRent"
          @claimRent="claimRent"
          @stakeRent="stakeRent"
          @confirm="setConfirms"
          @report="report"
          @closeOrder="closeOrder"
          @deploy="deploy"
          @enterGarage="showGarage($event, true)"
          @dropStuff="dropStuffTransaction"
          @teleport="teleport"
          @clear="signout"
          @logout="signout"
          @shardsToNft="shardsToNft"
          @craftMech="craftMech"
          @exchange="exchange"
          @stakeUnit="stakeUnit"
          @unpack="unpack"
          @claim="claimTokens"
        />
      </transition>
    </mainMenu>
    <transition name="fade">
      <canvas v-show="store.user && ready" id="canvas1"></canvas>
    </transition>
  </div>
</template>

<script>
// import info from "./components/info.vue";
// import buttons from "./components/buttons.vue";
// import tanks from "./components/tanks.vue";
import mainMenu from "./components/menu.vue";
import shards from "./components/shards.vue";
import unusedUnits from "./components/unusedUnits.vue";
import units from "./components/units.vue";
import unique from "./components/unique.vue";
import packs from "./components/packs.vue";
import settings from "./components/settings.vue";
import orders from "./components/orders.vue";
import notify from "./components/notify.vue";
import base from "./units_templates.js";
// import game from "./components/game.vue";
let tabs = [
  { name: "Garage", component: units },
  { name: "Shards", component: shards },
  { name: "Unique units", component: unique },
  { name: "Packs", component: packs },
  { name: "Rent CPU", component: orders },
  { name: "Settings", component: settings },
  { name: "Stake units", component: unusedUnits },
  // { name: "Game", component: game },
];
let packs_templates = [
  {
    id: 87581,
    name: "Metall pack 50",
    image: "pack50.png",
    type: "pack",
    count: 2,
    value: 50,
  },
  {
    id: 126551,
    name: "Metall pack 500",
    image: "pack500.png",
    type: "pack",
    count: 2,
    value: 500,
  },
];
let unique_templates = [
  {
    id: 67719,
    name: "Early commander",
    locked: false,
    unlockedTime: 0,
    image: "CDT.png",
    shardCode: "CDT",
    type: "discount",
    count: 0,
  },
  {
    id: 67718,
    name: "Early miner",
    locked: false,
    unlockedTime: 0,
    image: "MDT.png",
    shardCode: "MDT",
    type: "discount",
    count: 0,
    inGame: false,
  },
  {
    id: 67717,
    name: "Pioneer",
    locked: false,
    unlockedTime: 0,
    image: "PDT.png",
    shardCode: "PDT",
    type: "discount",
    count: 0,
    inGame: false,
  },
];
import {
  Application,
  Sprite,
  Container,
  Polygon,
  Graphics,
  Text,
  AnimatedSprite,
  Texture,
} from "pixi.js";
import {
  initMap,
  sortUnit,
  enableInteractiveMap,
  moveUnit,
  moveCircle,
  updateText,
  setUnit,
  getMontain,
  background,
  getDirection,
  isAvailableMove,
  isAvailableAttack,
  shuffleUnit,
} from "./functionality";
import { ColorOverlayFilter } from "@pixi/filter-color-overlay";
import { BevelFilter } from "@pixi/filter-bevel";
import { sound, Sound } from "@pixi/sound";
import sheet from "./assets/sheet.json";
import top_bottom from "./assets/top_bottom.json";
import right_left from "./assets/right_left.json";
import { getBorder, getCircle } from "./graphics";
import { initUal } from "./auth";
import {
  store,
  getIngameTanks,
  createObjectOnMap,
  moveTransaction,
  fireTransaction,
  repair,
  mineTransaction,
  dropStuffTransaction,
  collectStuffTransaction,
  teleportTransaction,
  rent,
  claimRent,
  report,
  stakeRent,
  closeOrder,
  shardsToNft,
  craftMech,
  exchange,
  stakeUnit,
  unpack,
  claimTokens,
} from "./store";
import { gsap } from "gsap";
import { initGsap } from "./utils";
import { ColorMatrixFilter } from "@pixi/filter-color-matrix";
function setColorAround(ground, enable) {
  let x = ground.posX;
  let y = ground.posY;
  let available = 4;
  let around = store.visibleZone
    .filter(ground => !ground.unit)
    .filter(ground => {
      let gx = ground.posX;
      let gy = ground.posY;
      let diffX = Math.abs(x - gx);
      let diffY = Math.abs(y - gy);
      if (diffX < available && diffY < available) return true;
      else return false;
    });
  let filters = [];
  if (enable) filters = [new ColorOverlayFilter(0x33ef99, 0.2)];
  around.forEach(ground => (ground.filters = filters));
}

export default {
  components: {
    // info,
    // buttons,
    // tanks,

    mainMenu,
    // login,
    shards,
    unique,
    settings,
    // loader,
    packs,
    notify,
    // game,
    units,
  },
  data() {
    return {
      tabs,
      showPrivate: false,
      tab: tabs[0],
      activeBar: false,
      confirms: {
        unitmove: true,
        unitmine: true,
        unitattack: true,
        teleport: true,
        collectstuff: true,
        dropstuff: true,
        transfer: false,
        report: true,
        claim: true,
        undelegatebw: false,
        delegatebw: false,
        stake: true,
        unstake: true,
        closeorder: true,
      },
      store: {
        garageX: 0,
        garageY: 0,
        user: false,
        privateKey: "",
        balance: 0,
        shards: {},
        selfUnits: [],
        units: [],
        unique: {},
        unusedUnits: [],
        packs: [],
      },
      show: false,
      errors: [],
      ready: false,
      loadings: [],
    };
  },
  computed: {
    unitsInTeleport() {
      return this.store.selfUnits.filter(
        el => el.posX === this.store.garageX && el.posY === this.store.garageY
      );
    },
  },
  methods: {
    dropStuffTransaction(ev) {
      return dropStuffTransaction(ev);
    },
    orderRent(data) {
      rent(data);
    },
    closeOrder(data) {
      closeOrder(data);
    },
    unpack(data) {
      unpack(data);
    },
    claimTokens(data) {
      claimTokens(data);
    },
    claimRent(data) {
      claimRent(data);
    },
    stakeUnit(data) {
      stakeUnit(data);
    },
    stakeRent(data) {
      stakeRent(data);
    },
    report(data) {
      report(data);
    },
    shardsToNft(data) {
      shardsToNft(data);
    },
    craftMech(data) {
      craftMech(data);
    },
    exchange(data) {
      exchange(data);
    },
    setConfirms({ key, val }) {
      console.log(key, val);
      let confirms = JSON.parse(localStorage.getItem("confirms"));
      if (confirms) {
        Object.keys(confirms).forEach(
          key => (this.confirms[key] = confirms[key])
        );
      }
      if (key) this.confirms[key] = val;
      localStorage.setItem("confirms", JSON.stringify(this.confirms));
    },
    showPrivateField() {
      alert(
        "Metal war game does not store or transfer private keys and destroys them on the client after authentication for security purposes. Once logged in, you do not need to confirm and sign transactions. However, this login option is not recommended for the following users: \n1. to all users."
      );
      this.showPrivate = true;
    },
    uiClick(tank) {
      let inGarage = store.garages.some(
        el => el.posX === tank.posX && el.posY === tank.posY
      );
      if (inGarage) {
        this.showGarage({ posX: tank.posX, posY: tank.posY }, true);
      } else {
        this.show = false;
        let unit = store.unitsFromKeys[tank.asset_id];
        let x = tank.posX - 6;
        let y = tank.posY - 6;
        store.x = x;
        store.y = y;
        store.unit = unit;
        this.renderMap();
      }
    },
    async renderStuff(objStuff) {
      store.gameScene.children
        .filter(el => el.type === "stuff")
        .forEach(el => store.gameScene.removeChild(el));
      store.objectsOnMap = store.objectsOnMap.filter(el => el.type !== "stuff");
      let stuffs = Object.values(objStuff)
        .map(el => {
          let posX = parseInt(el.location / 100000);
          let posY = parseInt(el.location % 100000);
          el.stuff.forEach(el => {
            el.posX = posX;
            el.posY = posY;
          });
          return el.stuff;
        })
        .reduce((acc, el) => acc.concat(el), []);
      console.log(stuffs);
      stuffs.forEach(el => {
        let stuff = createObjectOnMap({
          name: "stuff",
          image: `metal/7`,
          posX: el.posX,
          posY: el.posY,
          scaled: 0.35,
          diffX: 35,
          diffY: -10,
          type: "stuff",
          type_id: el.type,
          amount: el.amount,
          weight: el.weight,
          zIndex: 1,
          unground: true,
        });
        store.objectsOnMap.push(stuff);
        this.setObjectOnMap(stuff);
        sortUnit(stuff, store.unit, store.visibleZone, store.gameScene);
      });
    },
    async teleport({ units, garage }) {
      let ids = units.map(el => el.asset_id).join(":");
      let location = garage.posX * 100000 + garage.posY;
      let count = garage.amount * units.length;
      let memo = `tp:${location}:${ids}`;
      await teleportTransaction({ memo, count });
    },
    async onTeleport({ ids, location, self }) {
      let posX = parseInt(location / 100000);
      let posY = parseInt(location % 100000);
      ids.forEach(id => {
        let unit = store.unitsFromKeys[id];
        unit.posX = posX;
        unit.posY = posY;
        if (self) this.onUnitMove({ id, x: posX, y: posY });
      });
      if (self) {
        this.showGarage({ posX, posY });
        this.store.selfUnits.forEach(el => (el.selected = false));
      }
    },
    signout() {
      localStorage.clear();
      location.reload();
    },
    checkUnitChange(unit) {
      let localTank = store.unitsFromKeys[unit.asset_id];
      if (!localTank) {
        console.log(`UNKNOWN UNIT NOT EXIST`);
        return console.log(unit);
      }
      if (unit.owner === store.user.accountName) {
        let vueTank = this.store.selfUnits.find(
          el => el.asset_id === unit.asset_id
        );
        if (vueTank) {
          vueTank.hp = unit.hp;
          vueTank.unlockedTime = unit.next_availability * 1000;
          console.log((vueTank.unlockedTime - Date.now()) / 1000);
          vueTank.posX = unit.x;
          vueTank.posY = unit.y;
        }
      }
      let template = `${localTank.name}(${localTank.owner.text}) X:${localTank.posX} Y:${localTank.posY} UPDATE: `;
      if (unit.hp != localTank.health) {
        console.log(template + `${localTank.health} hp -> ${unit.hp} hp`);
        localTank.health = unit.hp;
      }
      if (unit.x != localTank.posX || unit.y != localTank.posY) {
        console.log(template + `X:${unit.x} -> Y:${unit.y}`);
        this.onUnitMove({ id: unit.asset_id, x: unit.x, y: unit.y });
      }
      if (localTank.lockedTime !== unit.next_availability * 1000) {
        console.log(
          template +
            `cd ${localTank.lockedTime} -> cd:${unit.next_availability * 1000}`
        );
        localTank.lockedTime = unit.next_availability * 1000;
      }
    },
    async onUnitRepair({ id }) {
      let tank = store.unitsFromKeys[id];
      if (tank) {
        tank.health = tank.unit.strength;
      }
      if (tank.self) {
        let unit = this.store.selfUnits.find(el => el.asset_id === id);
        if (unit) unit.hp = unit.strength;
      }
    },
    setObjectOnMap(el) {
      let randomY = Math.floor(Math.random() * (199 - 170)) + 170;
      let randomX = Math.floor(Math.random() * (199 - 170)) + 170;
      if (el.scaled) {
        el.scale.x = el.scaled;
        el.scale.y = el.scaled;
      }
      if (el.type === "stuff") {
        el.interactive = true;
        el.buttonMode = true;
        el.on("pointerover", e => {
          el.filters = [
            new BevelFilter({
              lightColor: 0xff69,
              thickness: 5,
              rotation: 0,
              shadowColor: 0xff69,
              lightAlpha: 0.5,
              shadowAlpha: 0.5,
            }),
          ];
        });
        el.on("pointerout", e => {
          el.filters = [];
        });
        el.on("pointerup", async e => {
          await collectStuffTransaction({
            id: store.unit.unit.asset_id,
            x: el.posX,
            y: el.posY,
          });
        });
      }
      let x = !isNaN(el.posY) ? el.posX - 1 : randomX;
      let y = !isNaN(el.posY) ? el.posY - 1 : randomY;
      if (!store.map.length) return 0;
      setUnit(el, store.map[y][x], true, el.type);
      store.gameScene.addChild(el);
    },
    async renderMap() {
      store.visibleZone.forEach(el => store.gameScene.removeChild(el));
      store.gameScene.children.forEach(el => store.gameScene.removeChild(el));
      store.visibleZone = [];
      let y = store.y;
      let x = store.x;
      let endLines = store.y + store.countLines;
      if (y < 0) y = 0;
      if (x < 0) x = 0;
      let lines = store.map.slice(y, endLines);
      if (store.y < y || endLines > store.map.length - 1) {
        let count = Math.abs(y - store.y);
        if (count === 0) count = Math.abs(endLines - store.map.length - 1);
        if (count < -5) count = -5;
        for (let i = 0; i < count; i++) {
          let newLine = [];
          for (let k = 0; k < store.cellsInLine; k++) {
            newLine.push(
              getMontain(top_bottom.frames, store.mountains_tb, store.id)
            );
          }
          if (store.y < 0) lines.unshift(newLine);
          else lines.push(newLine);
        }
      }
      lines.forEach((el, i) => {
        let count = 0;
        let line = [...el];
        let endLine = store.x + store.cellsInLine;
        if (store.x < x) count = Math.abs(x - store.x);
        line = line.slice(x, endLine);
        if (line.length < store.cellsInLine)
          count = Math.abs(store.cellsInLine - line.length);

        for (let i = 0; i < count; i++) {
          if (store.x < x)
            line.unshift(
              getMontain(right_left.frames, store.mountains_rl, store.id)
            );
          else
            line.push(
              getMontain(right_left.frames, store.mountains_rl, store.id)
            );
        }
        line.forEach(cell => store.visibleZone.push(cell));
      });
      let date = Date.now();
      console.log("map ready " + (Date.now() - date));
      console.log("map rendered " + (Date.now() - date));
      store.gameScene.children.forEach(el => store.gameScene.removeChild(el));
      store.visibleZone.forEach((el, i) => this.addSprite(el, i));
      store.unitsInVisibleZone.forEach(el =>
        sortUnit(el, store.unit, store.visibleZone, store.gameScene)
      ),
        console.log("units sorted " + (Date.now() - date));
      store.objectsOnMap.forEach(el =>
        sortUnit(el, store.unit, store.visibleZone, store.gameScene)
      );
      console.log("obj sorted " + (Date.now() - date));
      // initMiniMap();
      // renderMiniMap();
    },
    async onUnitDrop({ id }) {
      let tank = store.unitsFromKeys[id];
      if (!tank) return 0;
      let inGarage = store.garages.some(
        el => el.posX === tank.posX && el.posY === tank.posY
      );

      tank.unit.stuff = [];
      tank.stuffCount = 0;
      tank.lockedTime = Date.now() + store.defaultStuffAction * 1000;
      if (tank.self) {
        let unit = this.store.selfUnits.find(el => el.asset_id === id);
        if (unit) unit.stuff = [];
      }
    },
    checkDestroy(unit) {
      if (unit.health <= 0) {
        // this.onUnitDrop({ id: unit.unit.asset_id });
        setTimeout(
          () => this.onUnitMove({ id: unit.unit.asset_id, x: 1, y: 1 }),
          3000
        );
      }
    },
    async showGarage({ posX, posY }, teleport) {
      this.store.garageX = posX;
      this.store.garageY = posY;

      this.store.units = this.store.selfUnits.filter(
        el => el.posX === posX && el.posY === posY
      );
      this.show = true;
      if (teleport) {
        let x = posX - 6;
        let y = posY - 6;
        store.x = x;
        store.y = y;
        this.renderMap();
      }
    },
    changeEndpoint(link) {
      store.user.rpc.endpoint = link;
      if (store.user.client && store.user.client.provider)
        store.user.client.provider.url = link;
      localStorage.setItem("endpoint", link);
    },
    async repair({ count, id, token }) {
      await repair({ count, id, token });
    },
    deploy(unit) {
      let tank = store.unitsFromKeys[unit.asset_id];
      store.unit = tank;
      setColorAround(tank.ground, true);
      this.show = false;
    },
    async onUnitMove({ id, x, y }) {
      let tank = store.unitsFromKeys[id];
      console.log(
        `action(onUnitMove) - ${tank.name}(${tank.owner.text}) posX:${tank.posX} posY:${tank.posY} -> posX:${x} posY:${y}`
      );
      tank.posX = x;
      tank.posY = y;
      if (tank.poised) {
        tank.health -= 10;
        tank.poised--;
        this.checkDestroy(tank);
      }
      if (tank.self) {
        let vueUnit = this.store.selfUnits.find(el => el.asset_id === id);
        vueUnit.posX = x;
        vueUnit.posY = y;
      }
      let ground = store.visibleZone.find(el => el.posX === x && el.posY === y);
      let timeout = tank.getMoveCooldown();
      tank.lockedTime = timeout;
      if (!ground) {
        if (tank.ground) {
          tank.ground.unit = null;
          tank.ground = null;
        }
        return store.gameScene.removeChild(tank);
      }
      if (!tank.ground) {
        setUnit(tank, ground, false, "unit");
        await sortUnit(tank, store.unit, store.visibleZone, store.gameScene);
        return 0;
      }
      moveUnit(tank, ground);
      if (ground.type === "garage") {
        let tp = new AnimatedSprite(
          ["1.png", "2.png", "3.png"].map(el =>
            Texture.from(`./assets/tp/${el}`)
          )
        );
        tp.animationSpeed = 1;
        tp.scale.x = 1.5;
        tp.scale.y = 1.5;
        tp.x -= 50;
        tp.y -= 50;
        tp.play();
        tank.addChild(tp);
        window.sound("teleport");
        setTimeout(async () => {
          await gsap.to(tank, { alpha: 0, y: tank.y - 200, duration: 1 });
          tank.removeChild(tp);
        }, 1000);
      }
    },
    async onUnitAttack({ id, target_id, timeout }) {
      let tank = store.unitsFromKeys[id];
      let targetTank = store.unitsFromKeys[target_id];
      if (!tank || !targetTank) {
        return 0;
      } else {
        console.log(
          `action(onUnitAction) - ${tank.name}(${tank.owner.text}) -> ${targetTank.name}(${targetTank.owner.text})`
        );
        tank.lockedTime = timeout;
        if (targetTank.self) tank.agressive = true;

        if (tank.poised) {
          tank.health -= 10;
          tank.poised--;
          this.checkDestroy(tank);
        }

        if (tank.visible && targetTank.visible) {
          let ground = targetTank.ground;
          await this.unitAction(tank, ground);
          this.checkDestroy(tank);
        }
        if (targetTank.self) {
          let vueTank = this.store.selfUnits.find(
            el => el.asset_id === unit.asset_id
          );
          if (vueTank) vueTank.hp = targetTank.health;
        }
      }
    },
    async onUnitMine({ id, timeout, amount }) {
      let tank = store.unitsInVisibleZone.find(el => el.unit.asset_id === id);
      if (!tank) return 0;
      else {
        let freeSpace = tank.unit.capacity - tank.stuffCount;
        if (amount > freeSpace) amount = freeSpace;
        tank.unit.stuff.push({ amount, weight: 1 });
        tank.miningAnimation();
        await shuffleUnit(tank);
        await shuffleUnit(tank);
        tank.stuffCount = tank.stuffCount;
        await tank.alphaCounter(`+${amount}`, 0xffee00);
        tank.lockedTime = timeout;
      }
    },
    addSprite(target, i) {
      let index = i;
      let multipler = (128 - 2) * Math.ceil(i / store.cellsInLine) - 1;
      let multiplerX = -(256 * Math.floor(i / store.cellsInLine));
      // let multiplerX = 0;
      if (multipler === 0) multipler = 200;
      // if (index === 0) i = 1;
      i = i % store.cellsInLine;
      target.x = (i * (256 - 2)) / 2 - 250 + multiplerX / 2 + i;
      if (i === 0) i = 1;
      target.y = (i * (128 - 2)) / 2 - 250 + multipler / 2;
      target.interactive = true;
      target.buttonMode = true;

      store.gameScene.addChild(target);
      if (target.unclickable) return 0;
      target.on("pointerover", e => {
        let unit = target.unit;
        let color = 0xff69;
        if (unit && unit.unit) {
          if (!unit.self) color = 0xee4444;
          unit = unit.unit;
        }
        if (unit)
          unit.filters = [
            new BevelFilter({
              lightColor: color,
              thickness: 5,
              rotation: 0,
              shadowColor: color,
              lightAlpha: 0.5,
              shadowAlpha: 0.5,
            }),
          ];
        color = 0xeeeeee;
        if (
          target.unit &&
          target.unit.unit &&
          !target.unit.self &&
          isAvailableAttack(store.unit, target)
        )
          color = 0xee4444;
        else if (target.unit && target.unit.self) color = 0xff69;
        else if (!target.unit && isAvailableMove(store.unit, target))
          color = 0xff69;
        target.filters = [
          new BevelFilter({
            lightColor: color,
            thickness: 15,
            rotation: 0,
            shadowColor: color,
            lightAlpha: 0.5,
            shadowAlpha: 0.5,
          }),
        ];
      });
      target.on("pointerout", e => {
        target.alpha = 1;
        if (store.unit !== target.unit) target.filters = [];
        if (target.unit) {
          target.unit.filters = [];
          if (target.unit.unit) target.unit.unit.filters = [];
        }
      });
      target.on("pointerup", e => this.clickSprite(target, event));
      target.hitArea = new Polygon([0, 64, 127, 0, 254, 64, 129, 127]);
    },
    async clickSprite(target, event) {
      console.log(sound);
      try {
        if (target.blocked) return 0;
        target.blocked = true;
        if (target.unclickable) return (target.blocked = false);
        if (store.gameScene.blockedUI) return (target.blocked = false);
        if (store.unit) {
          setColorAround(store.unit, false);
        }
        if (target.unit && target.type !== "garage") {
          if (target.unit.self) {
            if (target.unit.unit.type === "validator" && target.unit.locked) {
              moveUnit(store.unit, target);
              await gsap.to(store.unit, { alpha: 0, duration: 2 });
            }
            store.unit = target.unit;
          } else {
            if (store.unit !== target.unit) {
              if (store.unit.locked) return (target.blocked = false);
              if (
                !isAvailableAttack(store.unit, target) ||
                store.unit.unit.type !== "battle"
              )
                return (target.blocked = false);

              store.unit.unit.direction = getDirection(
                store.unit.ground,
                target
              );
              let clone = store.unit;
              if (clone.proccess) return (target.blocked = false);
              clone.proccess = true;
              let res = await fireTransaction({
                id: store.unit.unit.id,
                target_id: target.unit.unit.id,
              });
              clone.proccess = false;
              return (target.blocked = false);
            }
          }
        }
        if (target.type === "garage") {
          if (event.type === "touchend") {
            console.log(target.touch);
            isNaN(target.touch) ? (target.touch = 1) : target.touch++;
            clearTimeout(target.timeout);
            target.timeout = setTimeout(() => {
              target.touch = 0;
              this.clickUnitMove(store.unit, target);
            }, 1000);
            if (target.touch === 2) {
              target.touch = 0;
              clearTimeout(target.timeout);

              this.showGarage(
                store.getGaragesUnits({ x: target.posX, y: target.posY })
              );
            }
            return (target.blocked = false);
          }
          if (event.button === 2) {
            this.showGarage({ posX: target.posX, posY: target.posY });
            return (target.blocked = false);
          }
        }
        if (
          store.unit &&
          store.unit.ground &&
          (!target.unit || target.type === "garage")
        ) {
          if (store.unit.locked) return (target.blocked = false);
          let clone = store.unit;
          await this.clickUnitMove(clone, target);
        }
        store.coordinates.text = `X:${target.posX} Y:${target.posY}`;
        target.blocked = false;
      } catch (e) {
        target.blocked = false;
      }
    },
    async clickUnitMove(unit, ground) {
      if (!isAvailableMove(unit, ground)) return (ground.blocked = false);
      if (ground.type === "geyser") {
        if (unit.unit.type === "miner") {
          let transact = await mineTransaction({
            id: unit.unit.asset_id,
            x: ground.posX,
            y: ground.posY,
          });
          if (!transact) return (ground.blocked = false);
        } else return (ground.blocked = false);
      } else {
        let transact = await moveTransaction({
          id: unit.unit.asset_id,
          x: ground.posX,
          y: ground.posY,
        });
        if (!transact) return (ground.blocked = false);
      }
      // moveUnit(unit, ground);
      if (ground.type === "garage") {
        let tp = new AnimatedSprite(
          ["1.png", "2.png", "3.png"].map(el =>
            Texture.from(`./assets/tp/${el}`)
          )
        );
        tp.animationSpeed = 1;
        tp.scale.x = 1.5;
        tp.scale.y = 1.5;
        tp.x -= 50;
        tp.y -= 50;
        tp.play();
        unit.addChild(tp);
        setTimeout(async () => {
          await gsap.to(unit, { alpha: 0, y: unit.y - 200, duration: 1 });
          unit.removeChild(tp);
        }, 1000);
        store.unit = {};
      }
      if (ground.type === "geyser") {
      }
    },
    onLoadedSocket() {
      this.setObjectsOnMap(store.objectsOnMap);
      this.store.garages = store.objectsOnMap
        .filter(el => el.type === "garage")
        .map(el => {
          let { posX, posY, amount } = el;
          let count = store.getGaragesUnits({ x: posX, y: posY }).length;
          return { posX, posY, count, amount };
        });
      this.store.garages.sort((a, b) => {
        if (a.posX + a.posY > b.posX + b.posY) return 1;
        if (a.posX + a.posY < b.posX + b.posY) return -1;
        else return 0;
      });
      this.loadings.push("objects setted");
      this.setUnits(store.unitsInVisibleZone);
      this.store.selfUnits = store.selfUnits.map(el => {
        let { posX, posY } = el;
        let main = el.unit;
        let unlockedTime = el.lockedTime;
        let {
          name,
          image,
          hp,
          strength,
          capacity,
          asset_id,
          repair,
          load,
          repairing,
          stuff,
          type,
        } = main;
        return {
          posX,
          name,
          image,
          posY,
          hp,
          strength,
          capacity,
          asset_id,
          repair,
          load,
          repairing,
          stuff,
          unlockedTime,
          type,
          discountEnabled: false,
          discountTypeEnabled: false,
          selected: false,
        };
      });
      this.loadings.push("units setted");
      this.renderMap();
      this.loadings.push("map rendered");
      this.loadings.push("ready.");
      setTimeout(() => (this.ready = true), 2000);
    },

    async onUnitCollect({ id, x, y }) {
      let tank = store.unitsFromKeys[id];
      if (!tank) return 0;
      let stuff = store.objectsOnMap.find(el => el.posX === x && el.posY === y);
      let index = store.objectsOnMap.findIndex(
        el => el.posX === x && el.posY === y
      );
      tank.lockedTime = Date.now() + store.defaultStuffAction * 1000;
      if (!stuff) return 0;
      let { amount, weight } = stuff;
      let freeSpace = tank.unit.capacity - tank.stuffCount;
      if (amount > freeSpace) {
        amount = freeSpace;
        tank.unit.stuff.push({ amount, weight });
        tank.stuffCount = tank.stuffCount;
        stuff.amount -= amount;
        return tank.alphaCounter(`+${amount}`);
      }
      gsap.to(stuff.scale, { x: 0.1, y: 0.1, duration: 1.5 });
      await gsap.to(stuff, {
        x: tank.x + 50,
        y: tank.y + 50,
        alpha: 0,
        duration: 1.5,
      });
      tank.unit.stuff.push({ amount, weight });
      tank.stuffCount = tank.stuffCount;
      store.gameScene.removeChild(stuff);
      store.objectsOnMap.splice(index, 1);
    },
    checkUnits() {
      setInterval(() => {
        store.unitsInVisibleZone.forEach(el => {
          if (el.lockedTime === 0) return 0;
          if (Date.now() > el.lockedTime) {
            el.lockedTime = 0;
            el.unit.alpha = 1;
            el.stopTimer();
          } else {
            el.unit.alpha = 0.7;
            // el.timer = Math.ceil((el.lockedTime - Date.now()) / 1000);
            el.setTimer(Math.ceil(el.lockedTime));
          }
        });
      }, 1000);
    },

    setObjectsOnMap(objects) {
      objects.forEach((el, i) => {
        this.setObjectOnMap(el);
      });
    },

    setUnits(units) {
      units.forEach((el, i) => {
        if (isNaN(el.posX) || isNaN(el.posY)) return 0;
        store.gameScene.addChild(el);
        setUnit(el, store.map[el.posY - 1][el.posX - 1], false, "unit");
      });
    },
    initLogin(privateKey) {
      initUal(async e => {
        if (e[0].wax) e[0].rpc = e[0].wax.rpc;
        store.user = e[0];
        let link = localStorage.getItem("endpoint");
        if (link) this.changeEndpoint(link);
        this.store.user = store.user;
        await getIngameTanks(
          this.onLoadedSocket,
          this.onUnitMove,
          this.onUnitAttack,
          this.onUnitMine,
          this.onUnitCollect,
          this.onUnitDrop,
          this.onUnitRepair,
          this.checkUnitChange,
          e =>
            e.data.button === 2
              ? dropStuffTransaction({ id: e.target.unit.asset_id })
              : (store.unit = {}),
          this.onTeleport,
          this.renderStuff
        );
      }, privateKey);
    },
    async unitAction(unit, target) {
      unit.unit.direction = getDirection(unit.ground, target);
      let action = unit.unit.action;
      let crash = new AnimatedSprite(
        action.crash.map(el => Texture.from(`./assets/${el}`))
      );
      let fires = (() => {
        let arr = [];
        let fire;
        for (let i = 0; i < action.repeat; i++) {
          fire = new AnimatedSprite(
            action.textures.map(el => Texture.from(`./assets/${el}`))
          );
          fire.animationSpeed = action.speed;
          fire.scale.x = action.scale;
          fire.scale.y = action.scale;
          fire.x = action[getDirection(unit.ground, target)].x;
          fire.y = action[getDirection(unit.ground, target)].y;
          fire.angle = action[getDirection(unit.ground, target)].angle;
          fire.zIndex = 1;
          fire.play();
          arr.push(fire);
        }
        return arr;
      })();
      unit.zIndex = 10;
      fires.forEach(fire => unit.addChild(fire));
      let { x, y } = target;
      x -= unit.x + action.diffX;
      y -= unit.y + action.diffY;
      // unit.lockedTime = Date.now() + 5000;
      // unit.unit.alpha = 0.5;
      Sound.from({
        url: `./assets/cards/${unit.unit.name}/fire.mp3`,
        volume: 0.2,
      }).play();
      if (unit.unit.poisoning) target.unit.poised = unit.unit.poisoning;
      if (action.throw) {
        let actions = [];
        for (let i = 0; i < fires.length; i++) {
          actions.push(async () => {
            await shuffleUnit(unit);
            await gsap.to(fires[i], {
              x,
              y,
              duration: 0.5,
              delay: i / 3,
              ease: "Expo.easeIn",
            });
          });
        }
        await Promise.all(actions.map(el => el()));
      } else {
        await gsap.to(fires[0], {
          alpha: 1,
          duration: 0.5,
          ease: "Expo.easeIn",
        });
      }
      try {
        Sound.from({
          url: `./assets/cards/${unit.unit.name}/destroy.mp3`,
          volume: 0.2,
        }).play();
      } catch (e) {}
      window.sound("crash");
      unit.zIndex = 1;
      fires.forEach(fire => unit.removeChild(fire));
      target.unit.addChild(crash);
      crash.animationSpeed = 0.2;
      crash.x = 35;
      crash.y = 30;
      let damage = unit.unit.attack * 3;
      if (unit.unit.armor_piercing !== 1) damage -= target.unit.unit.armor;
      if (damage < 0) damage = 0;
      target.unit.health -= damage;
      target.unit.alphaCounter(`-${damage}`, 0xff1111);
      if (target.unit.health <= 0) {
        target.unit.health = 0;
        crash.scale.x = 1.5;
        crash.scale.y = 1.5;
        target.unit.unit.alpha = 0.5;
        crash.x = -20;
        crash.y = -90;
        crash.play();
        this.checkDestroy(target.unit);
        setTimeout(async () => {
          target.unit.unit.texture =
            target.unit.unit.broken[target.unit.unit.direction];
          gsap.to(target.unit.unit, { alpha: 1, duration: 2 });
          gsap.to(crash.scale, { x: 1.2, y: 1.2, duration: 2 });
          gsap.to(crash, { x: crash.x + 15, y: crash.y + 35, duration: 2 });
          await gsap.to(crash, { alpha: 0, duration: 2 });
          target.unit.removeChild(crash);
        }, 2000);
        return 0;
      }
      crash.zIndex = 3;
      crash.scale.x = 0.5;
      crash.scale.y = 0.5;
      crash.play();
      setTimeout(async () => {
        gsap.to(target.unit, { alpha: 1, duration: 1 });
        gsap.to(crash.scale, { x: 0.1, y: 0.1, duration: 2 });
        gsap.to(crash, { x: crash.x + 15, y: crash.y + 20, duration: 2 });
        await gsap.to(crash, { alpha: 0, duration: 2 });
        target.unit.removeChild(crash);
      }, 2000);
    },
    initPixi() {
      const vm = this;
      sound.add("crash", "./assets/sound/crash.mp3");
      sound.add("fire", "./assets/sound/fire.mp3");
      sound.add("go", "./assets/sound/go.mp3");
      sound.add("teleport", "./assets/teleport.mp3");
      sound.volumeAll = 0.2;
      window.sound = name => sound.play(name || "go");
      initGsap();
      const app = new Application({
        width: window.innerWidth,
        height: window.innerHeight,
        // antialias: true,
        resolution: devicePixelRatio,
        autoDensity: true,
        view: document.getElementById("canvas1"),
      });

      store.gameScene = new Container();
      store.gameScene.sortableChildren = true;
      store.gameScene.zIndex = 2;
      store.gameScene.x = store.defaultPosX;
      store.gameScene.y = store.defaultPosY;
      store.gameScene.scale.y = 0.8;
      store.gameScene.scale.x = 0.8;
      app.stage.addChild(store.gameScene);
      app.stage.sortableChildren = true;
      app.renderer.backgroundColor = "0x202020";
      app.renderer.autoResize = true;
      app.loader
        .add("./assets/sheet.json")
        .add("./assets/top_bottom.json")
        .add("./assets/right_left.json")
        .add("metalfont", "./assets/font1.ttf")
        .load(setup);
      function setup() {
        store.id = app.loader.resources["./assets/sheet.json"].textures;
        store.mountains_tb =
          app.loader.resources["./assets/top_bottom.json"].textures;
        store.mountains_rl =
          app.loader.resources["./assets/right_left.json"].textures;
        store.map = initMap(
          Object.keys(sheet.frames).filter(el => !el.match("r.png")),
          store.id,
          store.allMapCount
        );
        vm.checkUnits();
        vm.renderMap();
        vm.initLogin();
        enableInteractiveMap(
          document.querySelector("canvas"),
          store.gameScene,
          vm.renderMap,
          vm
        );
        document.addEventListener(
          "contextmenu",
          e => {
            e.preventDefault();
            e.stopPropagation();
          },
          true
        );
        store.coordinates = new Text(``, {
          fontSize: 30,
          fontFamily: "metalwar",
          fill: 0xffffff,
        });
        store.coordinates.zIndex = 3;
        app.stage.addChild(store.coordinates);
        // document.getElementById("log").addEventListener("click", e => {
        //   console.log(store.logs);
        // });
        // document
        //   .getElementById("garage_button")
        //   .addEventListener("click", () => showGarage(false));
      }

      function initMiniMap() {
        let bg = Sprite.from("./assets/minimap.png");
        if (store.miniMap) return 0;
        store.miniMap = new Container();
        store.miniMap.addChild(bg);
        let filter = new ColorMatrixFilter();
        filter.brightness(0.7);
        bg.filters = [filter];
        bg.zIndex = 1;
        store.miniMap.width = 200;
        store.miniMap.height = 200;
        store.miniMap.x = window.innerWidth - store.miniMap.width - 50;
        store.miniMap.y = window.innerHeight - store.miniMap.height - 50;
        bg.width = 1;
        bg.height = 1;
        store.miniMap.zIndex = 5;
        store.miniMap.sortableChildren = true;
        app.stage.addChild(store.miniMap);
        renderMiniMap();
      }
      async function renderMiniMap() {
        if (store.cashMinimap) store.miniMap.removeChild(store.cashMinimap);
        store.cashMinimap = new Graphics();
        let size = 1;
        let scale = 0.1;
        let realSquareSize = store.miniMap.width * size * scale;
        let oneLine = Math.floor(store.miniMap.width / realSquareSize);
        let countLines = Math.floor(store.miniMap.height / realSquareSize);
        let mapWidth = store.allMapCount * 0.005;
        let oneCellInset = Math.ceil(mapWidth / oneLine);
        for (let line = 1; line <= countLines; line++) {
          for (let cell = 1; cell <= oneLine; cell++) {
            let color = 0x00aa00;
            let alpha = 0;
            let lineColor = 0xffffff;
            // color = 0xcc90fe;
            for (
              let x = (cell - 1) * oneCellInset;
              x < cell * oneCellInset;
              x++
            ) {
              for (
                let y = (line - 1) * oneCellInset;
                y < line * oneCellInset;
                y++
              ) {
                if (
                  store.unitsInVisibleZone.some(
                    el => el.posX === x + 1 && el.posY === y + 1
                  )
                )
                  alpha = 1;
                // if (
                //   store.objectsOnMap.some(
                //     el => el.posX === x + 1 && el.posY === y + 1
                //   )
                // ) {
                //   color = 0xcc90fe;
                //   alpha = 1;
                // }
              }
            }

            store.cashMinimap.beginFill(color, alpha);
            store.cashMinimap.lineStyle(0.1, lineColor, 0.2);
            store.cashMinimap.drawRect(
              size * (cell - 1),
              size * (line - 1),
              size,
              size
            );
            store.cashMinimap.scale.x = scale;
            store.cashMinimap.scale.y = scale;
            store.cashMinimap.endFill();
            store.cashMinimap.zIndex = 2;
          }
        }
        store.miniMap.addChild(store.cashMinimap);
      }

      window.addEventListener("resize", e => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
      });
      document.querySelector("canvas").addEventListener("contextmenu", e => {
        e.preventDefault();
      });
    },
  },
  mounted() {
    store.vue = this;
    this.initPixi();
    this.setConfirms({});
    setInterval(async () => {
      if (!store.user.rpc) return 0;
      let res = await store.user.rpc.get_table_rows({
        json: true,
        code: "metalwarmint",
        scope: store.user.accountName,
        table: "accounts",
        limit: 10000,
        reverse: true,
      });
      let res1 = await store.user.rpc.get_table_rows({
        json: true,
        code: "atomicassets",
        scope: store.user.accountName,
        table: "assets",
        limit: 10000,
        reverse: true,
      });
      let res2 = await store.user.rpc.get_table_rows({
        json: true,
        code: "metalwargame",
        scope: "metalwargame",
        table: "collectibles",
        limit: 10000,
        key_type: "i64",
        lower_bound: store.user.accountName,
        upper_bound: store.user.accountName,
        index_position: 2,
        reverse: true,
      });
      let collectibles = res2.rows.reduce((acc, el) => {
        let tank = unique_templates.find(key => el.template_id === key.id);
        if (!tank) return acc;
        acc.push({
          ...el,
          ...tank,
          inGame: true,
          id: el.asset_id,
        });
        return acc;
      }, []);

      let unique = res.rows.reduce((acc, el) => {
        acc[el.balance.split(" ")[1]] = el.balance.split(" ")[0];
        return acc;
      }, {});
      let packs = res1.rows.reduce((acc, el) => {
        let tank = packs_templates.find(key => el.template_id === key.id);
        if (!tank) return acc;
        acc.push({
          ...tank,
          id: el.asset_id,
          template_id: el.template_id,
        });
        return acc;
      }, []);

      let unusedUnits = res1.rows.reduce((acc, el) => {
        let tank = base.find(key => el.template_id === key.id);
        if (!tank) return acc;
        acc.push({
          ...tank,
          id: el.asset_id,
          template_id: el.template_id,
          inGame: false,
        });
        return acc;
      }, []);
      this.store.unusedUnits = unusedUnits;
      this.store.balance = unique.MWM;
      this.store.unique = unique;
      this.store.packs = packs;
      this.store.collectibles = collectibles;
      this.store.shards = base
        .map(el => {
          return {
            id: el.id,
            name: el.name,
            image: el.image,
            shardCode: el.shardCode,
            shards: unique[el.shardCode],
            mechShard: el.mechShard,
            lvl: el.lvl,
          };
        })
        .filter(el => el.shards !== undefined);
      this.store.shards.sort((a, b) => b.lvl - a.lvl);
    }, 5000);
  },
};
</script>
