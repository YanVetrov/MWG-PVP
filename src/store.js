import { Sprite, Texture, Container, Text, AnimatedSprite } from "pixi.js";
import { gsap } from "gsap";
import base from "./units_templates.js";
const objectsOnMap = [
  { name: "garage mini", image: "garage1", posX: 1, posY: 1 },
  { name: "garage big", image: "garage2", posX: 2, posY: 1 },
  {
    name: "geyser1",
    image: "geyser1",
    posX: 15,
    posY: 2,
    scaled: 0.5,
    diffX: 25,
    diffY: -70,
    alpha: 0.6,
  },
  {
    name: "geyser2",
    image: "geyser2",
    posX: 18,
    posY: 3,
    scaled: 0.5,
    diffX: 1,
    diffY: -80,
    alpha: 0.6,
  },
  {
    name: "geyser3",
    image: "geyser3",
    posX: 16,
    posY: 4,
    scaled: 0.5,
    diffX: 1,
    diffY: -80,
    alpha: 0.6,
  },
  {
    name: "geyser4",
    image: "geyser4",
    posX: 1,
    posY: 15,
    scaled: 0.5,
    diffX: 1,
    diffY: -80,
    alpha: 0.6,
  },
  {
    name: "geyser5",
    image: "geyser5",
    posX: 8,
    posY: 12,
    scaled: 0.5,
    diffX: 1,
    diffY: -80,
    alpha: 0.6,
  },
  {
    name: "geyser6",
    image: "geyser6",
    posX: 4,
    posY: 11,
    scaled: 0.5,
    diffX: 1,
    diffY: -80,
    alpha: 0.6,
  },
  {
    name: "geyser7",
    image: "geyser7",
    posX: 10,
    posY: 15,
    scaled: 0.5,
    diffX: 1,
    diffY: -80,
    alpha: 0.6,
  },
].map(el => {
  let sprite = Sprite.from(`./assets/${el.image}.png`);
  sprite.width = 120;
  sprite.height = 120;
  sprite.zIndex = 1;
  Object.keys(el).forEach(key => (sprite[key] = el[key]));
  sprite.interactive = true;
  sprite.buttonMode = true;

  return sprite;
});
function createUnits(arr) {
  return arr.map((el, i) => {
    let sprite = Sprite.from(`./assets/cards/${el.image}/ul.png`);
    ["u", "d", "r", "l", "ur", "ul", "dl", "dr"].forEach(key => {
      sprite[key] = Texture.from(`./assets/cards/${el.image}/${key}.png`);
      if (!sprite.broken) sprite.broken = {};
      sprite.broken[key] = Texture.from(
        `./assets/cards/${el.image}/broken/${key}.png`
      );
    });
    let container = new Container();
    container.zIndex = 6;
    sprite.width = 120;
    sprite.height = 120;
    sprite.dir = "ul";
    Object.keys(el).forEach(key => (sprite[key] = el[key]));
    Object.defineProperty(sprite, "direction", {
      get() {
        return this.dir;
      },
      set(val) {
        if (!val) return "invalid";
        this.dir = val;
        this.texture = this[val];
      },
    });
    container.name = el.name;
    container.locked = false;
    container.lt = 0;
    container.timerText = new Text("", {
      fill: 0xefefef,
      fontFamily: "metalwar",
      fontSize: 15,
    });
    container.timerText.x = 50;
    container.timerText.y = -20;
    container.hpText = new Text(`${el.hp}/${el.strength}`, {
      fill: 0x00ffaa,
      fontFamily: "metalwar",
      fontSize: 15,
    });
    container.hpText.x = 50;
    container.unit = sprite;
    container.addChild(container.timerText);
    container.addChild(container.hpText);
    container.addChild(sprite);
    Object.defineProperty(container, "timer", {
      get() {
        return this.timerText.text;
      },
      set(val) {
        if (!val) val = "";
        this.timerText.text = val;
      },
    });
    Object.defineProperty(container, "lockedTime", {
      get() {
        return this.lt;
      },
      set(val) {
        this.lt = val;
        if (!val) {
          val = null;
          this.timer = 0;
        }
        this.locked = !!val;
      },
    });
    Object.defineProperty(container, "health", {
      get() {
        return this.unit.hp;
      },
      set(val) {
        let color = 0x00ffaa;
        if (val < 10) color = 0xff9999;
        this.unit.hp = val;
        this.hpText.style.fill = color;
        this.hpText.text = `${val}/${this.unit.strength}`;
      },
    });

    return container;
  });
}
const units = createUnits(base);

let store = {
  state: null,
  id: null,
  mountains: null,
  bg: null,
  gameScene: null,
  target: null,
  clicked: true,
  blockedUI: false,
  cellsInLine: 20,
  countLines: 20,
  map: [],
  allMapCount: 40000,
  miniMap: null,
  unit: {},
  cash: [],
  text: {},
  visibleZone: [],
  defaultPosX: 1200,
  defaultPosY: -400,
  x: 0,
  y: 0,
  user: null,
  units: [],
  objectsOnMap,
};
const setExampleUnits = () => (store.units = createUnits(base));
async function getIngameTanks() {
  let account = await store.user.getAccountName();
  let started = Date.now();
  let response = await store.user.rpc.get_table_rows({
    json: true,
    code: "metalwargame",
    scope: "metalwargame",
    table: "units",
    limit: 10000,
    key_type: "i64",
    lower_bound: account,
    upper_bound: account,
    index_position: 2,
    reverse: true,
  });
  let end = Date.now();
  let ping = end - started;
  store.ping = ping;
  let arr = [];
  if (!response) {
    console.log();
  } else {
    let selfTanks = response.rows.filter(
      el => el.owner === store.user.accountName
    );
    console.log(selfTanks);
    selfTanks.forEach(el => {
      let tank = base.find(key => el.template_id === key.id);
      if (!tank) {
      } else {
        let locked = el.next_availability * 1000 > Date.now();
        let unlockedTime = el.next_availability * 1000;

        tank = {
          ...el,
          ...tank,
          inGame: true,
          id: el.asset_id,
          repair: Math.ceil((el.strength - el.hp) / 2),
          locked,
          unlockedTime,
        };
        arr.push(tank);
      }
    });
  }
  store.units = createUnits([...arr]);
  store.unit = store.units[0];
}
export { store, getIngameTanks, setExampleUnits };
