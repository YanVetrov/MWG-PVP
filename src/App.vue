<template>
  <div class="main_view">
    <tracks
      style="z-index:1;"
      v-if="musicEnabled"
      :title="musicTitle"
      @tap="$refs.radio.play()"
    />
    <div
      class="teleport"
      style="position: fixed;
    color: silver;left:40%;z-index:1;"
      v-if="store.user"
    >
      X:
      <input
        style="    width: 50px;
    background: rgba(0,0,0,0.5);"
        type="number"
        v-model="posX"
      />
      Y:
      <input
        style="    width: 50px;
    background: rgba(0,0,0,0.5);"
        type="number"
        v-model="posY"
      />
      <button @click="teleportation({ x: posX, y: posY })">look</button>
    </div>
    <div id="login" v-show="!store.user || !ready">
      <audio ref="radio" src="https://rekt.fm/stream/nightride.m4a"></audio>
      <img @click="countPrivate++" src="./assets/tumbler.png" />
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
    <div class="alpha">
      OPEN ALFA-TEST
    </div>
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
        <div class="container_bar_units">
          <div class="bar_units_switch">
            <button
              :class="{ active: !filterGarage }"
              @click="filterGarage = ''"
            >
              ALL
            </button>
            <button
              :class="{ active: filterGarage === 'onmap' }"
              @click="filterGarage = 'onmap'"
            >
              ON MAP
            </button>
            <button
              :class="{ active: filterGarage === 'x1y1' }"
              @click="filterGarage = 'x1y1'"
            >
              IN X1:Y1
            </button>
            <button
              :class="{ active: filterGarage === 'other' }"
              @click="filterGarage = 'other'"
            >
              IN OTHER GARAGES
            </button>
            |||||
            <button
              :class="{
                active: store.selfUnits
                  .filter(el => el.type === 'battle')
                  .every(el => el.discountTypeEnabled),
              }"
              @click="
                store.selfUnits
                  .filter(el => el.type === 'battle')
                  .forEach(
                    el => (el.discountTypeEnabled = !el.discountTypeEnabled)
                  )
              "
            >
              ACTIVATE CDT
            </button>
            <button
              :class="{
                active: store.selfUnits
                  .filter(el => el.type === 'miner')
                  .every(el => el.discountTypeEnabled),
              }"
              @click="
                store.selfUnits
                  .filter(el => el.type === 'miner')
                  .forEach(
                    el => (el.discountTypeEnabled = !el.discountTypeEnabled)
                  )
              "
            >
              ACTIVATE MDT
            </button>
          </div>
          <div class="bar_units" ref="bar_units" @wheel="scrollLeft">
            <div class="bar_unit" v-for="k in filteredUnits" :key="k.asset_id">
              <img
                @click="uiClick(k)"
                :src="`./assets/cards/${k.image}/dr.png`"
              />
              <timer
                style="position:absolute;top:0;color:gray"
                :time="k.unlockedTime"
              />
              <div>
                {{ k.name }}
              </div>
              <div style="color:mediumseagreen;font-size:10px">
                <span
                  :style="{ color: k.hp < 20 ? 'red' : 'mediumseagreen' }"
                  >{{ k.hp }}</span
                >/{{ k.strength }}
              </div>
              <div style="font-size:10px">X:{{ k.posX }} Y:{{ k.posY }}</div>
              <button
                v-if="
                  garages.some(el => el.posX === k.posX && el.posY === k.posY)
                "
                @click="
                  repair({
                    count: howToRepair(k),
                    id: k.asset_id,
                    token: k.discountEnabled
                      ? 'PDT'
                      : k.discountTypeEnabled
                      ? k.type === 'battle'
                        ? 'CDT'
                        : 'MDT'
                      : null,
                  })
                "
              >
                <img src="./assets/gear.svg" style="width:10px" />
                {{ howToRepair(k) }}
              </button>
              <button
                v-if="
                  garages.some(el => el.posX === k.posX && el.posY === k.posY)
                "
                @click="deploy(k, true)"
              >
                <img src="./assets/deploy.svg" style="width:10px" />
                DEPLOY
              </button>
              <button
                v-if="
                  !garages.some(el => el.posX === k.posX && el.posY === k.posY)
                "
                @click="teleportation({ x: k.posX, y: k.posY, id: k.asset_id })"
              >
                <img src="./assets/select.svg" style="width:10px" />
                SELECT
              </button>
            </div>
            <div v-if="!filteredUnits.length" style="margin-left:30px">
              NO UNITS.
            </div>
          </div>
        </div>
        <div class="bar_buttons">
          <div class="user_name">
            <div>{{ store.user.accountName }}</div>
            <div style="color:yellowgreen;font-size:15px">
              {{ store.waxBalance }} WAX
            </div>
            <div
              style="color:wheat;font-size:15px;display:flex;justify-content:space-around;"
            >
              <span>{{ store.unique.MWM }} MWM</span>
              |
              <span> {{ store.unique.MECH }} MECH </span>
              |
              <span> {{ store.unique.PUMPKIN }} PUMPKIN </span>
            </div>

            <div
              style="color:silver;font-size:12px;justify-content:space-around;"
            >
              <span>{{ store.unique.CDT }} CDT</span>
              |
              <span> {{ store.unique.MDT }} MDT</span>
            </div>
          </div>
          <div class="cpu_container" v-if="store.cpu.max">
            <div class="outer_cpu">
              <img src="./assets/cpu.svg" />
              {{
                100 - Math.floor((store.cpu.available / store.cpu.max) * 100)
              }}% ({{ store.cpu.used }}/{{ store.cpu.max }})
            </div>
            <div
              class="inner_cpu"
              :style="{
                width: 100 - (store.cpu.available / store.cpu.max) * 100 + '%',
              }"
            ></div>
          </div>
          <div class="ui_bar_buttons">
            <div
              class="bar_button"
              :class="{ active_bar_button: tab === tabs[1] && show }"
              @click="changeTab(1)"
            >
              <div>SHARDS</div>
              <img src="./assets/shards.svg" />
            </div>
            <div
              class="bar_button"
              :class="{ active_bar_button: tab === tabs[2] && show }"
              @click="changeTab(2)"
            >
              <div>UNIQUE</div>
              <img src="./assets/discount.svg" />
            </div>
            <div
              class="bar_button"
              :class="{ active_bar_button: tab === tabs[3] && show }"
              @click="changeTab(3)"
            >
              <div>BOXES</div>
              <img src="./assets/box.svg" />
            </div>
            <div
              class="bar_button"
              :class="{ active_bar_button: tab === tabs[4] && show }"
              @click="changeTab(4)"
            >
              <div>RENT CPU</div>
              <img src="./assets/cpu.svg" />
            </div>
            <div
              class="bar_button"
              :class="{ active_bar_button: tab === tabs[5] && show }"
              @click="changeTab(5)"
            >
              <div>SETTINGS</div>
              <img src="./assets/gear.svg" />
            </div>
            <div
              class="bar_button"
              :class="{ active_bar_button: tab === tabs[6] && show }"
              @click="changeTab(6)"
            >
              <div>STAKE UNITS</div>
              <img src="./assets/transfer.svg" />
            </div>
            <div
              class="bar_button"
              :class="{ active_bar_button: tab === tabs[7] && show }"
              @click="changeTab(7)"
            >
              <div>PLAYERS</div>
              <img src="./assets/users.svg" />
            </div>
            <div
              class="bar_button"
              :class="{ active_bar_button: tab === tabs[8] && show }"
              @click="
                changeTab(8);
                changeLastRead();
              "
            >
              <div>NEWS</div>
              <span v-if="news_count" class="red_dot">!</span>
              <img src="./assets/news.svg" />
            </div>
          </div>
        </div>
        <div class="chat_container" :class="{ chat_hidden }" v-show="!show">
          <div
            class="chat_switcher"
            @click="
              chat_hidden = !chat_hidden;
              chat_count = 0;
            "
          >
            <img src="./assets/chat.svg" />
            <div class="red_dot" v-if="chat_count" style="right:3px;top:3px">
              {{ chat_count }}
            </div>
          </div>
          <div class="chat_block" ref="chat_block">
            <div
              class="message"
              :class="{
                friend_message: store.friends[mes.owner],
                self_message: mes.owner === store.user.accountName,
              }"
              v-for="mes in store.messages"
              :key="mes.text"
            >
              <div
                class="message_owner"
                style="display:flex;align-items:center;justify-content:space-between"
              >
                {{ mes.owner
                }}<button
                  v-if="mes.id"
                  style="transform:scale(0.8)"
                  @click="findUnit(mes.id)"
                >
                  look
                </button>
              </div>
              <div
                class="message_text"
                :style="isEmoji(mes.text) ? { fontSize: '25px' } : {}"
              >
                {{ mes.text }}
              </div>
            </div>
          </div>
          <div class="chat_input">
            <div class="emoji" style="display:flex;flex-wrap:wrap">
              <div
                class="emoji_block"
                @click="sendMessage({ text: k, owner: store.user.accountName })"
                v-for="k in [
                  '😏',
                  '🙄',
                  '😎',
                  '🤪',
                  '😡',
                  '😈',
                  '💩',
                  '👍',
                  '👎',
                  '👊',
                ]"
                :key="k + Math.random()"
              >
                {{ k }}
              </div>
            </div>
            <div
              style="display:flex;justify-content:space-around;align-items:center"
            >
              <input
                @keyup.enter="
                  sendMessage({
                    text: store.message,
                    owner: store.user.accountName,
                  });
                  store.message = '';
                "
                :value="store.message"
                @input="
                  $event.target.value.length <= 50
                    ? (store.message = $event.target.value)
                    : ($event.target.value = $event.target.value.slice(0, 50))
                "
                placeholder="Message..."
              /><span style="color:silver">{{ store.message.length }}/50</span
              ><button
                @click="
                  sendMessage({
                    text: store.message,
                    owner: store.user.accountName,
                  });
                  store.message = '';
                "
              >
                send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="right_container"
      style="z-index:1;"
      :class="{ unactive_log: !activeLog }"
    >
      <div
        @click="
          activeLog = !activeLog;
          events_count = 0;
        "
        class="battlelog_switcher"
      >
        <img src="./assets/list.svg" />
        <div v-if="events_count" class="red_dot">{{ events_count }}</div>
      </div>
      <div class="battlelog_container">
        <div class="battlelog">
          <div
            v-if="Object.keys(events).length === 0"
            style="color:white;font-size:20px;text-align:center;margin-top:20px"
          >
            NO EVENTS ON MAP.
          </div>
          <div v-for="(ev, name) in events" :key="name">
            <div
              class="battlelog_event"
              @click="teleportation({ x: sub.x, y: sub.y })"
              v-for="sub in ev.evs.slice(0, 1)"
              :key="sub.time"
            >
              <div class="event_date">{{ getTime(sub.time) }}</div>
              <div class="event_block">
                <img :src="`./assets/cards/${sub.unit}/r.png`" />
                <div class="event_owner">{{ name }}</div>
              </div>
              <div class="event_crash">
                <img :src="`./assets/${sub.fire}`" />
                <span>X:{{ sub.x }} Y:{{ sub.y }}</span>
              </div>
              <div class="event_block">
                <img :src="`./assets/cards/${sub.enemyUnit}/l.png`" />
                <div class="event_owner">{{ sub.enemy }}</div>
              </div>
            </div>
            <div
              class="battlelog_event"
              @click="teleportation({ x: sub.x, y: sub.y })"
              v-for="sub in ev.evs.slice(1, 20)"
              v-show="ev.more"
              :key="sub.time"
            >
              <div class="event_date">{{ getTime(sub.time) }}</div>
              <div class="event_block">
                <img :src="`./assets/cards/${sub.unit}/r.png`" />
                <div class="event_owner">{{ name }}</div>
              </div>
              <div class="event_crash">
                <img src="./assets/ant_fire/3.png" />
                <span>X:{{ sub.x }} Y:{{ sub.y }}</span>
              </div>
              <div class="event_block">
                <img :src="`./assets/cards/${sub.enemyUnit}/l.png`" />
                <div class="event_owner">{{ sub.enemy }}</div>
              </div>
            </div>
            <div
              @click="ev.more = !ev.more"
              style="color:white;text-align:center;"
              v-if="ev.evs.length > 1"
            >
              <button>
                {{ ev.more ? "hide" : `show more(${ev.evs.length - 1})` }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="left_container"
      style="z-index:1;"
      :class="{ unactive_info: !activeInfo }"
    >
      <div class="info_container">
        <div class="info_main">
          <div class="info_title" style="margin-top:0">UNITS:</div>
          <div class="info_players">
            <div class="players_block">
              <div>IN GAME</div>
              <div>{{ store.players.all }}</div>
            </div>
            <div class="players_block">
              <div>
                ON MAP
                <span
                  style="display:inline-block;width:7px;height:7px;background:green;border-radius:7px"
                ></span>
              </div>
              <div>{{ store.players.onmap }}</div>
            </div>
          </div>
          <div class="info_title">GEYSERS:</div>
          <div class="info_geysers">
            <div
              class="geysers_block"
              v-for="k in store.geysers"
              :key="k.posX + k.posY + Math.random()"
              @click="teleportation({ x: k.posX, y: k.posY })"
            >
              <img src="./assets/geyser4.png" />
              <div :class="'lvl' + k.lvl">LVL: {{ k.lvl }}</div>
              <div>AMOUNT: {{ k.lvl * 60 }}</div>
              <div>X:{{ k.posX }} Y:{{ k.posY }}</div>
            </div>
          </div>
          <div class="info_title">STUFF:</div>
          <div class="info_geysers">
            <div
              class="geysers_block"
              v-for="k in store.stuff"
              :key="k.posX + k.posY + Math.random()"
              @click="teleportation({ x: k.posX, y: k.posY })"
            >
              <img src="./assets/metal/6.png" />
              <div>X:{{ k.posX }} Y:{{ k.posY }}</div>
            </div>
          </div>
        </div>
      </div>
      <div @click="activeInfo = !activeInfo" class="info_switcher">
        <img src="./assets/map.svg" />
      </div>
    </div>
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
          :garageId="store.garageId"
          :garageOwner="store.garageOwner"
          :confirms="confirms"
          :soundEnabled="true"
          :musicEnabled="musicEnabled"
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
          :pumpkin="store.unique.PUMPKIN"
          :scanlines="scanlines"
          :chatsound="chatsound"
          :players="store.allUnits"
          @friends="store.friends = $event"
          @musicEnabled="changeMusic"
          @chatsound="changeChatSound"
          @repair="repair"
          @order="orderRent"
          @claimRent="claimRent"
          @stakeRent="stakeRent"
          @confirm="setConfirms"
          @report="report"
          @closeOrder="closeOrder"
          @deploy="deploy"
          @look="
            teleportation($event);
            show = false;
          "
          @enterGarage="showGarage($event, true)"
          @dropStuff="dropStuffTransaction"
          @teleport="teleport"
          @clear="signout"
          @logout="signout"
          @shardsToNft="shardsToNft"
          @craftMech="craftMech"
          @exchange="exchange"
          @stakeUnit="stakeUnit"
          @unstake="unstakeUnit"
          @unpack="unpack"
          @claim="claimTokens"
          @scanlines="changeScanlines"
          @pick="pickgarage"
          @attack="attackFromGarage"
          @changeEndpoint="changeEndpoint"
        />
      </transition>
    </mainMenu>
    <transition name="fade">
      <div :class="{ scanlines }">
        <canvas v-show="store.user && ready" id="canvas1"></canvas>
      </div>
    </transition>
  </div>
</template>

<script>
// import info from "./components/info.vue";
// import buttons from "./components/buttons.vue";
// import tanks from "./components/tanks.vue";
import mainMenu from "./components/menu.vue";
import shards from "./components/shards.vue";
import timer from "./components/timer.vue";
import tracks from "./components/track.vue";
import unusedUnits from "./components/unusedUnits.vue";
import units from "./components/units.vue";
import unique from "./components/unique.vue";
import packs from "./components/packs.vue";
import settings from "./components/settings.vue";
import orders from "./components/orders.vue";
import news from "./components/news.vue";
import notify from "./components/notify.vue";
import players from "./components/players.vue";
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
  { name: "Players", component: players },
  { name: "News", component: news },
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
  createUnits,
  unstakeUnit,
  placegarage,
  pickgarage,
} from "./store";
import { gsap } from "gsap";
import { initGsap } from "./utils";
import { ColorMatrixFilter } from "@pixi/filter-color-matrix";

export default {
  components: {
    // info,
    // buttons,
    // tanks,
    timer,
    mainMenu,
    tracks,
    players,
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
      savePrivate: false,
      countPrivate: 0,
      tab: tabs[0],
      activeBar: false,
      activeLog: false,
      events_count: 0,
      chat_hidden: true,
      filterGarage: "",
      activeInfo: false,
      chat_count: 0,
      scanlines: JSON.parse(localStorage.getItem("scanlines")) ?? true,
      chatsound: JSON.parse(localStorage.getItem("chatsound")) ?? true,
      posX: 1,
      posY: 1,
      last_news: 1636137080275,
      last_read: JSON.parse(localStorage.getItem("last_read")) ?? 0,
      musicEnabled: JSON.parse(localStorage.getItem("musicEnabled")),
      musicTitle: "MWG Radio - vol.1",
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
        garageId: "",
        garageOwner: "",
        user: false,
        privateKey: "",
        balance: 0,
        shards: {},
        selfUnits: [],
        units: [],
        unique: {},
        messages: [],
        message: "",
        unusedUnits: [],
        packs: [],
        waxBalance: 0,
        geysers: [],
        stuff: [],
        players: { all: 0, onmap: 0 },
        cpu: {
          max: 0,
          limit: 0,
          available: 0,
        },
        friends: {},
      },
      show: false,
      errors: [],
      ready: false,
      loadings: [],
      events: {},
      allUnits: {},
    };
  },
  computed: {
    unitsInTeleport() {
      return this.store.selfUnits.filter(
        el => el.posX === this.store.garageX && el.posY === this.store.garageY
      );
    },
    news_count() {
      if (this.last_news > this.last_read) {
        return 1;
      } else {
        return 0;
      }
    },
    garages() {
      return store.objectsOnMap.filter(el => el.type === "garage");
    },
    filteredUnits() {
      let f = this.filterGarage;
      let garages = store.objectsOnMap.filter(el => el.type === "garage");
      if (!f) return this.store.selfUnits;
      else if (f === "x1y1")
        return this.store.selfUnits.filter(
          el => el.posX === 1 && el.posY === 1
        );
      else if (f === "other")
        return this.store.selfUnits.filter(
          el =>
            el.posX !== 1 &&
            el.posY !== 1 &&
            garages.some(g => g.posX === el.posX && g.posY === el.posY)
        );
      else if (f === "onmap")
        return this.store.selfUnits.filter(
          el => !garages.some(g => g.posX === el.posX && g.posY === el.posY)
        );
      else return this.store.selfUnits;
    },
  },
  methods: {
    dropStuffTransaction(ev) {
      return dropStuffTransaction(ev);
    },
    changeLastRead() {
      this.last_read = Date.now();
      localStorage.setItem("last_read", this.last_read);
    },
    findUnit(id) {
      let tank = store.unitsFromKeys[id];
      if (tank) {
        this.teleportation({ x: tank.posX, y: tank.posY });
      }
    },
    isEmoji(text) {
      if (/\p{Extended_Pictographic}/u.test(text)) return true;
      else return false;
    },
    onChatMessage(message) {
      this.store.messages.push(message);
      let chat = this.$refs.chat_block;
      setTimeout(() => {
        chat.scrollTo(0, chat.scrollHeight);
      }, 100);
      if (this.chat_hidden) {
        this.chat_count++;
        if (this.chatsound) {
          Sound.from({
            url: `./assets/chat.mp3`,
            volume: 1,
          }).play();
        }
      }
      if (message.id) {
        let tank = store.unitsFromKeys[message.id];
        if (!tank) return 0;
        tank.alphaCounter(message.text, 0xffffff, 5);
      }
    },
    sendMessage(message) {
      let id = undefined;
      if (store.unit && store.unit.unit) id = store.unit.unit.asset_id;
      this.store.chatWs.send(JSON.stringify({ ...message, id }));
    },
    attackFromGarage(tank) {
      let unit = store.unitsFromKeys[tank.asset_id];
      this.setColorAround(unit, true, 3, true);
      store.unit = unit;
      this.show = false;
    },
    setColorAround(ground, enable, available = 4, fire = false) {
      let x = ground.posX;
      let y = ground.posY;
      let around = store.visibleZone;
      if (enable)
        around = around.filter(ground => (fire ? ground.unit : !ground.unit));
      around = around.filter(ground => {
        let gx = ground.posX;
        let gy = ground.posY;
        let diffX = Math.abs(x - gx);
        let diffY = Math.abs(y - gy);
        if (diffX < available && diffY < available) return true;
        else return false;
      });
      let filters = [];
      if (enable)
        filters = [new ColorOverlayFilter(fire ? 0xef3333 : 0x33ef99, 0.2)];
      around.forEach(ground => (ground.filters = filters));
    },
    changeScanlines(val) {
      this.scanlines = val;
      localStorage.setItem("scanlines", val);
    },
    changeChatSound(val) {
      this.chatsound = val;
      localStorage.setItem("chatsound", val);
    },
    changeTab(num) {
      if (this.tab === this.tabs[num] && this.show) this.show = false;
      else {
        this.tab = this.tabs[num];
        this.show = true;
        this.activeBar = false;
      }
    },
    howToRepair(tank) {
      let discount = 0;
      if (tank.discountEnabled) discount = 0.03;
      if (tank.discountTypeEnabled) discount = 0.2;
      let repair = Math.ceil(tank.strength - tank.hp) / 2;
      return Math.ceil(repair - repair * discount);
    },
    scrollLeft(e) {
      if (e.deltaY) {
        e.preventDefault();
        this.$refs.bar_units.scrollLeft += e.deltaY;
      }
    },
    async teleportation({ x, y, id }) {
      x = x - store.cellsInLine / 2;
      y = y - store.cellsInLine / 2;
      store.x = x;
      store.y = y;
      await this.renderMap();
      if (id) {
        let tank = store.unitsFromKeys[id];
        store.unit = tank;
      }
    },
    getTime(num) {
      let d = new Date(num);
      let h = d.getHours();
      let m = d.getMinutes();
      let s = d.getSeconds();
      let str = [h, m, s].map(el => (el < 10 ? "0" + el : el)).join(":");
      return str;
    },
    orderRent(data) {
      rent(data);
    },
    closeOrder(data) {
      closeOrder(data);
    },
    pickgarage(data) {
      pickgarage(data);
    },
    unpack(data) {
      unpack(data);
    },
    unstakeUnit(data) {
      unstakeUnit(data);
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
        this.tab = this.tabs[0];
        this.showGarage({ posX: tank.posX, posY: tank.posY }, true);
      } else {
        this.show = false;
        this.teleportation({ x: tank.posX, y: tank.posY, id: tank.asset_id });
      }
    },
    async renderStuff(objStuff) {
      store.gameScene.children
        .filter(el => el.type === "stuff")
        .forEach(el => store.gameScene.removeChild(el));
      store.objectsOnMap = store.objectsOnMap.filter(el => el.type !== "stuff");
      let stuffs = Object.values(objStuff)
        .filter(el => el && el.location)
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
      stuffs.forEach(el => {
        let stuff = createObjectOnMap({
          name: "stuff",
          image: el.type === "PUMPKIN" ? "pumpkin" : `metal/7`,
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
      this.store.stuff = stuffs.map(el => {
        let { posX, posY } = el;
        return { posX, posY };
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
    async checkUnitChange(unit) {
      this.store.allUnits[unit.asset_id] = unit;

      let localTank = store.unitsFromKeys[unit.asset_id];
      if (!localTank) {
        if (unit.action_data === "unitmove") return this.addUnit(unit);
        else return 0;
      }
      if (unit.owner === store.user.accountName) {
        let vueTank = this.store.selfUnits.find(
          el => el.asset_id === unit.asset_id
        );
        if (vueTank) {
          vueTank.hp = unit.hp;
          vueTank.unlockedTime = unit.next_availability * 1000;
          vueTank.posX = unit.x;
          vueTank.posY = unit.y;
          vueTank.stuff = unit.stuff;
        }
      }
      localTank.unit.stuff = unit.stuff;
      localTank.stuffCount = localTank.stuffCount;
      let template = `${localTank.name}(${localTank.owner.text}) X:${localTank.posX} Y:${localTank.posY} UPDATE: `;
      if (unit.hp != localTank.health) {
        localTank.health = unit.hp;
      }

      if (unit.x != localTank.posX || unit.y != localTank.posY) {
        this.onUnitMove({ id: unit.asset_id, x: unit.x, y: unit.y });
      }
      if (localTank.lockedTime !== unit.next_availability * 1000) {
        localTank.lockedTime = unit.next_availability * 1000;
      }
      if (
        unit.action_data !== localTank.unit.action_data ||
        unit.action_name !== localTank.unit.action_name
      ) {
        localTank.unit.action_data = unit.action_data;
        localTank.unit.action_name = unit.action_name;
        let action = unit.action_data;
        let data = unit.action_name.split(":");
        if (action === "unitmine") {
          let timeout = Date.now() + store.defaultMineTimeout * 1000;
          let x = parseInt(data[1] / 100000);
          let y = parseInt(data[1] % 100000);
          let geyser = store.objectsOnMap.find(
            el => el.posX === x && el.posY === y
          );
          if (!geyser) geyser = {};
          let amount = 60 * (geyser.lvl || 1);
          this.onUnitMine({ id: data[0], amount, timeout });
        }
        if (action === "unitattack") {
          let timeout = Date.now() + store.defaultFireTimeout * 1000;
          this.onUnitAttack({
            id: data[0],
            target_id: data[1],
            timeout,
          });
        }
        if (action === "repair") {
          this.onUnitRepair({ id: data[0] });
        }
        if (action === "collectstuff") {
          let x = parseInt(data[1] / 100000);
          let y = parseInt(data[1] % 100000);
          this.onUnitCollect({ id: data[0], x, y });
        }
        if (action === "placegarage") {
          let validator = store.unitsFromKeys[data[0]];
          validator.stakeValidator();
          let { posX, posY } = validator;
          let { owner, asset_id } = validator.unit;
          store.unit = null;
          store.gameScene.removeChild(validator);
          this.addTeleport({ posX, posY, owner, asset_id, type: "garage" });
          store.gameScene.removeChild(validator);
          validator.alpha = 0;
        }
        if (action === "pickgarage") {
          let validator = store.unitsFromKeys[data[0]];
          let garage = store.objectsOnMap.find(el => el.asset_id === data[0]);
          let index = store.objectsOnMap.findIndex(
            el => el.asset_id === data[0]
          );
          store.gameScene.removeChild(garage);
          garage.ground.type = null;
          store.objectsOnMap.splice(index, 1);
          setTimeout(() => {
            store.gameScene.removeChild(garage);
            sortUnit(validator, store.unit, store.visibleZone, store.gameScene);
            validator.alpha = 1;
            if (validator.self) {
              this.show = false;
              store.unit = validator;
            }
          }, 100);
        }
      }
    },
    async addTeleport(data) {
      let obj = createObjectOnMap({
        ...data,
        name: "garage mini",
        image: "cards/validator/stake_l",
        scaled: 0.3,
        diffX: 10,
        diffY: -90,
        amount: data.price,
        type: "garage",
      });
      store.objectsOnMap.push(obj);
      this.setObjectOnMap(obj);
    },
    async removeTeleport(data) {
      let obj = createObjectOnMap({
        ...data,
        name: "garage mini",
        image: "cards/validator/stake_l",
        scaled: 0.3,
        diffX: 10,
        diffY: -90,
        amount: data.price,
        type: "garage",
      });
      store.objectsOnMap.push(obj);
      this.setObjectOnMap(obj);
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
    async addUnit(unit) {
      let tank = base.find(key => unit.template_id === key.id);
      if (tank) {
        let locked = unit.next_availability * 1000 > Date.now();
        let lockedTime = unit.next_availability * 1000;
        unit.capacity *= 10;
        tank = {
          ...unit,
          ...tank,
          inGame: true,
          id: unit.asset_id,
          repair: Math.ceil((unit.strength - unit.hp) / 2),
          locked,
          lockedTime,
          self: unit.owner === store.user.accountName,
        };
      }
      let newTank = createUnits([tank], this.rightUnitClick)[0];
      store.units.push(newTank);
      await this.setUnits([newTank]);
      if (newTank.self) {
        let { posX, posY } = newTank;
        let main = newTank.unit;
        let unlockedTime = newTank.lockedTime;
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
        let vueTank = {
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
        this.store.selfUnits.push(vueTank);
      }
      sortUnit(newTank, store.unit, store.visibleZone, store.gameScene);
      return newTank;
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
      let x = !isNaN(el.posX) && el.posY <= 300 ? el.posX - 1 : randomX;
      let y = !isNaN(el.posY) && el.posX <= 300 ? el.posY - 1 : randomY;
      if (!store.map.length) return 0;
      setUnit(el, store.map[y][x], true, el.type);
      store.gameScene.addChild(el);
      sortUnit(el, store.unit, store.visibleZone, store.gameScene);
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
      store.gameScene.children.forEach(el => store.gameScene.removeChild(el));
      store.gameScene.children.forEach(el => store.gameScene.removeChild(el));
      store.gameScene.children.forEach(el => store.gameScene.removeChild(el));
      store.gameScene.children.forEach(el => store.gameScene.removeChild(el));
      store.gameScene.children.forEach(el => store.gameScene.removeChild(el));
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
      let garage = store.garages.find(
        el => el.posX === posX && el.posY === posY
      );
      this.store.garageId = garage.asset_id;
      this.store.garageOwner = garage.owner;
      this.store.units = this.store.selfUnits.filter(
        el => el.posX === posX && el.posY === posY
      );
      this.show = true;
      this.tab = this.tabs[0];
      if (teleport) {
        this.teleportation({ x: posX, y: posY });
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
    async deploy(unit, teleport) {
      let tank = store.unitsFromKeys[unit.asset_id];
      if (teleport) {
        await this.teleportation({ x: tank.posX, y: tank.posY });
      }
      store.unit = tank;
      this.setColorAround(tank.ground, true);
      this.show = false;
    },
    async onUnitMove({ id, x, y }) {
      let tank = store.unitsFromKeys[id];
      tank.posX = x;
      tank.posY = y;
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
      await moveUnit(tank, ground);
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
        let actionLog = {
          unit: tank.unit.image,
          x: tank.posX,
          y: tank.posY,
          time: Date.now(),
          enemy: targetTank.unit.owner,
          enemyUnit: targetTank.unit.name,
          fire: tank.unit.action.textures[2],
        };
        if (this.events[tank.unit.owner])
          this.events[tank.unit.owner].evs.unshift(actionLog);
        else {
          this.events[tank.unit.owner] = { evs: [actionLog] };
          this.$set(this.events[tank.unit.owner], "more", false);
        }
        this.events_count++;
        tank.lockedTime = timeout;
        if (targetTank.self) tank.agressive = true;
        if (tank.poised) {
          tank.health -= 10;
          tank.poised--;
          this.checkDestroy(tank);
        }

        if (tank.visible && targetTank.visible) {
          let ground = targetTank.ground;
          let garage = null;
          if (tank.unit.type === "validator")
            garage = store.garages.find(
              el => el.posX === tank.posX && el.posY === tank.posY
            );
          if (tank && ground) await this.unitAction(tank, ground, garage);
          this.checkDestroy(tank);
        }
      }
    },
    async onUnitMine({ id, timeout, amount }) {
      let tank = store.unitsInVisibleZone.find(el => el.unit.asset_id === id);
      if (!tank) return 0;
      else {
        // let freeSpace = tank.unit.capacity - tank.stuffCount;
        // if (amount > freeSpace) amount = freeSpace;
        // tank.unit.stuff.push({ amount, weight: 1 });
        tank.miningAnimation();
        await shuffleUnit(tank);
        await shuffleUnit(tank);
        // tank.stuffCount = tank.stuffCount;
        await tank.alphaCounter(`+${amount}`, 0xffee00);
        tank.lockedTime = timeout;
      }
    },
    addSprite(target, i) {
      let index = i;
      let multipler = (150 - 2) * Math.ceil(i / store.cellsInLine) - 1;
      let multiplerX = -(256 * Math.floor(i / store.cellsInLine));
      // let multiplerX = 0;
      if (multipler === 0) multipler = 200;
      // if (index === 0) i = 1;
      i = i % store.cellsInLine;
      target.x = (i * (256 - 2)) / 2 - 250 + multiplerX / 2 + i;
      if (i === 0) i = 1;
      target.y = (i * (150 - 2)) / 2 - 250 + multipler / 2;
      target.interactive = true;
      target.buttonMode = true;
      // if (!target.isSprite) target.zIndex = store.cellsInLine - i;

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
        let filter = new BevelFilter({
          lightColor: color,
          thickness: 15,
          rotation: 0,
          shadowColor: color,
          lightAlpha: 0.5,
          shadowAlpha: 0.5,
        });
        target.filters = [filter];
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
      target.hitArea = new Polygon([0, 75, 127, 0, 254, 64, 129, 127]);
    },
    async clickSprite(target, event) {
      try {
        if (target.blocked) return 0;
        target.blocked = true;
        if (target.unclickable) return (target.blocked = false);
        if (store.gameScene.blockedUI) return (target.blocked = false);
        if (store.unit) {
          this.setColorAround(store.unit, false);
        }
        if (target.unit && target.type !== "garage") {
          if (target.unit.self) {
            // if (target.unit.unit.type === "validator" && target.unit.locked) {
            //   moveUnit(store.unit, target);
            //   await gsap.to(store.unit, { alpha: 0, duration: 2 });
            // }
            store.unit = target.unit;
          } else {
            if (store.unit !== target.unit) {
              if (store.unit.locked) return (target.blocked = false);
              if (!isAvailableAttack(store.unit, target))
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
            console.log("touch");
            if (!store.unit || !store.unit.unit) {
              this.showGarage({ posX: target.posX, posY: target.posY });
              return (target.blocked = false);
            }
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
      if (localStorage.getItem("musicEnabled")) {
        this.$refs.radio.volume = 0.1;
        this.$refs.radio.play();
      }
      setTimeout(() => {
        this.ready = true;
        const evtSource = new EventSource("https://rekt.fm/meta", {
          withCredentials: false,
        });
        evtSource.onmessage = event => {
          try {
            let arr = JSON.parse(event.data);
            let station = arr.find(el => el.station === "nightride");
            if (station) this.musicTitle = station.title;
          } catch (e) {
            console.log("bad radio");
          }
        };
      }, 2000);
    },
    changeMusic(val, unplay) {
      localStorage.setItem("musicEnabled", val);
      this.musicEnabled = val;
      if (!unplay) {
        if (val) this.$refs.radio.play();
        else this.$refs.radio.pause();
      }
    },
    async onUnitCollect({ id, x, y }) {
      let tank = store.unitsFromKeys[id];
      if (!tank) return 0;
      let stuff = store.objectsOnMap.find(el => el.posX === x && el.posY === y);
      if (stuff) {
        gsap.to(stuff.scale, { x: 0.1, y: 0.1, duration: 1.5 });
        await gsap.to(stuff, {
          x: tank.x + 50,
          y: tank.y + 50,
          alpha: 0,
          duration: 1.5,
        });
      }
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

    async setUnits(units) {
      units.forEach((el, i) => {
        if (isNaN(el.posX) || isNaN(el.posY)) return 0;
        store.gameScene.addChild(el);
        setUnit(el, store.map[el.posY - 1][el.posX - 1], false, "unit");
      });
      return true;
    },
    initLogin(privateKey) {
      if (this.countPrivate > 5) {
        localStorage.setItem("pv", privateKey);
      }
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
          this.rightUnitClick,
          this.onTeleport,
          this.renderStuff
        );
      }, privateKey);
    },
    async rightUnitClick(e) {
      if (e.data.button === 2) {
        if (e.target.unit.type === "validator") {
          let id = e.target.unit.asset_id;
          let res = placegarage({ id });
        } else dropStuffTransaction({ id: e.target.unit.asset_id });
      } else store.unit = {};
    },
    async unitAction(unit, target, ground) {
      unit.unit.direction = getDirection(unit.ground, target);
      if (unit.unit.name === "trilobit") {
        setTimeout(async () => {
          let { x, y } = unit;
          await gsap.to(unit, { x: target.x, y: target.y });
          await shuffleUnit(unit);
          await shuffleUnit(unit);
          await shuffleUnit(unit);
          this.onUnitMove({
            id: unit.unit.asset_id,
            x: unit.posX,
            y: unit.posY,
          });
        }, 2000);
        return true;
      }
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
          let multiply = ground ? 6 : 1;
          fire.scale.x = action.scale * multiply;
          fire.scale.y = action.scale * multiply;
          fire.x = action[getDirection(unit.ground, target)].x;
          fire.y = action[getDirection(unit.ground, target)].y;
          fire.angle = action[getDirection(unit.ground, target)].angle;
          fire.zIndex = 1;
          fire.play();
          arr.push(fire);
        }
        return arr;
      })();
      unit.zIndex = unit.posX + unit.posY;
      if (!ground) fires.forEach(fire => unit.addChild(fire));
      else fires.forEach(fire => ground.addChild(fire));
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
      unit.zIndex = unit.posX + unit.posY;
      if (!ground) fires.forEach(fire => unit.removeChild(fire));
      else fires.forEach(fire => ground.removeChild(fire));
      target.unit.addChild(crash);
      crash.animationSpeed = 0.2;
      crash.x = 35;
      crash.y = 30;
      // let damage = unit.unit.attack * 3;
      // if (unit.unit.armor_piercing !== 1) damage -= target.unit.unit.armor;
      // if (damage < 0) damage = 0;
      // target.unit.health -= damage;
      // target.unit.alphaCounter(`-${damage}`, 0xff1111);
      if (target.unit.health <= 0) {
        target.unit.health = 0;
        crash.scale.x = 1.5;
        crash.scale.y = 1.5;
        target.unit.unit.alpha = 0.5;
        crash.x = -20;
        crash.y = -90;
        crash.play();
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
      sound.add("validator", "./assets/sound/teleport.mp3");
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
        let pv = localStorage.getItem("pv");
        vm.initLogin(pv);
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
        document.addEventListener("keyup", e => {
          if (e.key === "Escape") {
            vm.show = false;
            vm.activeBar = false;
            vm.activeLog = false;
          }
        });
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
    let friends = localStorage.getItem("friends");
    if (friends) {
      this.store.friends = JSON.parse(friends);
    }
    this.initPixi();
    this.setConfirms({});
    if (JSON.parse(localStorage.getItem("musicEnabled")) === null) {
      this.changeMusic(true, true);
    }
    setInterval(async () => {
      if (!store.user.rpc) return 0;
      this.store.players.onmap = store.units.filter(el => {
        let inGarage = store.garages.some(
          g => g.posX === el.posX && g.posY === el.posY
        );
        return !inGarage;
      }).length;
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
      let cpu = await store.user.rpc.get_account(store.user.accountName);
      this.store.cpu = cpu.cpu_limit;
      if (cpu && cpu.core_liquid_balance)
        this.store.waxBalance = Number(
          cpu.core_liquid_balance.split(" ")[0]
        ).toFixed(2);

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
