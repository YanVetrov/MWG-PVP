import { Sprite, Texture, Container, Text, AnimatedSprite } from "pixi.js";
import { gsap } from "gsap";
import base from "./units_templates.js";
const objectsOnMap = [
  // { name: "garage mini", image: "garage1", posX: 0, posY: 0 },
  // { name: "garage big", image: "garage2", posX: 6, posY: 6 },
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
].map(el => createObjectOnMap(el));
function createObjectOnMap(el) {
  let sprite = Sprite.from(`./assets/${el.image}.png`);
  sprite.zIndex = 1;
  sprite.interactive = false;
  sprite.buttonMode = false;
  Object.keys(el).forEach(key => (sprite[key] = el[key]));
  return sprite;
}
function createUnits(arr) {
  return arr.map((el, i) => {
    let sprite = Sprite.from(`./assets/cards/${el.image}/ul.png`);
    ["u", "d", "r", "l", "ur", "ul", "dl", "dr"].forEach(key => {
      sprite[key] = Texture.from(`./assets/cards/${el.image}/${key}.png`);
      if (el.type !== "validator") {
        if (!sprite.broken) sprite.broken = {};
        sprite.broken[key] = Texture.from(
          `./assets/cards/${el.image}/broken/${key}.png`
        );
      }
      if (el.type === "validator") {
        sprite["stake_" + key] = Texture.from(
          `./assets/cards/${el.image}/stake_${key}.png`
        );
      }
    });
    let container = new Container();
    container.zIndex = 6;
    sprite.width = 120;
    sprite.height = 120;
    sprite.dir = "ul";
    container.posX = parseInt(el.location / 100000);
    container.posY = parseInt(el.location % 100000);
    container.diffX = el.diffX;
    container.diffY = el.diffY;
    Object.keys(el).forEach(key => (sprite[key] = el[key]));
    Object.defineProperty(sprite, "direction", {
      get() {
        return this.dir;
      },
      set(val) {
        console.log(val, this[val]);
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
      fill: el.self ? 0x00ffaa : 0xff3377,
      fontFamily: "metalwar",
      fontSize: 15,
    });
    container.owner = new Text(`${el.owner || "Enemy"}`, {
      fill: el.self ? 0x00ffaa : 0xff3377,
      fontFamily: "metalwar",
      fontSize: 15,
    });
    container.hpText.x = 50;
    container.hpText.y = 10;
    container.owner.x = 50;
    container.self = el.self;
    container.unit = sprite;
    container.addChild(container.timerText);
    container.addChild(container.owner);
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
        if (this.unit.hp === 0 && val > 0) {
          this.unit.texture = this.unit[this.unit.direction];
        }
        this.unit.hp = val;
        this.hpText.style.fill = color;
        this.hpText.text = `${val}/${this.unit.strength}`;
        if (val === 0) {
          this.unit.texture = this.unit.broken[this.unit.direction];
        }
      },
    });
    container.stakeValidator = function () {
      if (this.locked) return 0;
      if (!this.unit.type === "validator")
        return console.log("not validator =" + this.unit.type);
      this.unit.direction = "stake_" + this.unit.direction;
      window.sound("teleport");
      this.locked = true;
    };
    if (el.type === "validator") {
      container.scale.x = 1.7;
      container.scale.y = 1.7;
      container.on("pointerup", e => {
        if (!container.active) return true;
        container.stakeValidator();
      });
    }
    container.health = el.hp;
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
  allMapCount: 90000,
  miniMap: null,
  u: {},
  cash: [],
  text: {},
  visibleZone: [],
  defaultPosX: 1200,
  defaultPosY: -400,
  x: 0,
  y: 0,
  user: null,
  units: [],
  unusedUnits: [],
  objectsOnMap,
  getGaragesUnits({ x, y }) {
    return this.selfUnits.filter(el => el.posX === x && el.posY === y);
  },
};
Object.defineProperty(store, "unit", {
  get() {
    return this.u;
  },
  set(unit) {
    if (this.u) {
      this.u.active = false;
      // this.u.interactive = false;
      // this.u.buttonMode = false;
    }
    if (unit) {
      unit.active = true;
      // unit.interactive = true;
      // unit.interactive = true;
    }
    this.u = unit;
  },
});
Object.defineProperty(store, "unusedUnits", {
  get() {
    return this.units.filter(el => el.posX === 1 && el.posY === 1);
  },
});
Object.defineProperty(store, "selfUnits", {
  get() {
    return this.units.filter(el => el.self);
  },
});
Object.defineProperty(store, "garages", {
  get() {
    return this.objectsOnMap.filter(el => el.type === "garage");
  },
});
Object.defineProperty(store, "unitsInVisibleZone", {
  get() {
    return this.units.filter(
      el =>
        this.visibleZone.some(
          ground => ground.posX === el.posX && ground.posY === el.posY
        ) &&
        (!this.garages.some(
          ground => ground.posX === el.posX && ground.posY === el.posY
        ) ||
          el.self)
    );
  },
});
const setExampleUnits = () => (store.units = createUnits(base));
async function getIngameTanks(handler, handlerMove, handlerAttack) {
  let account = await store.user.getAccountName();
  let started = Date.now();
  let garages = await store.user.rpc.get_table_rows({
    json: true,
    code: "metalwargame",
    scope: "metalwargame",
    table: "teleports",
    limit: 100,
    reverse: true,
  });
  let end = Date.now();
  let ping = end - started;
  store.ping = ping;
  let validator = base.find(el => el.type === "validator");
  let wolf2 = base.find(el => el.name === "wolf2");
  garages.rows.forEach(el => {
    let posX = parseInt(el.location / 100000);
    let posY = parseInt(el.location % 100000);
    objectsOnMap.push(
      createObjectOnMap({
        name: "garage mini",
        image: "teleport",
        posX,
        posY,
        scaled: 0.5,
        diffX: -5,
        diffY: -10,
        type: "garage",
      })
    );
  });

  [wolf2, validator].forEach(el => {
    (el.self = true), (el.owner = store.user.accountName);
  });
  // store.units = createUnits([...arr, validator, wolf2]);
  // store.unit = store.units[0];
  const ws = new WebSocket("wss://game.metal-war.com/ws/");
  ws.onopen = () => console.log("websocket connected");
  ws.onmessage = message => {
    let data = JSON.parse(message.data);
    if (Object.keys(data.data).length > 1000) {
      console.log(true);
      let allTanks = Object.values(data.data);
      let arr = [];
      allTanks.forEach(el => {
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
            self: el.owner === store.user.accountName,
          };
          arr.push(tank);
        }
      });
      store.units = createUnits([...arr, validator, wolf2]);
      store.unit = store.units[0];
      handler();
    } else {
      if (
        data.type === "actions" &&
        data.data[0] &&
        data.data[0].name === "unitmove"
      ) {
        let ev = data.data[0].data;
        if (ev.asset_owner === store.user.accountName) return 0;
        handlerMove({ id: ev.asset_id, x: ev.x, y: ev.y });
      }
      if (
        data.type === "actions" &&
        data.data[0] &&
        data.data[0].name === "unitattack"
      ) {
        let ev = data.data[0].data;
        if (ev.asset_owner === store.user.accountName) return 0;
        handlerAttack({ id: ev.asset_id, target_id: ev.target_id });
      }
    }
  };
}

async function moveTransaction({ id, x, y }) {
  if (!id) return true;
  let account = await store.user.getAccountName();
  let options = {
    actions: [
      {
        account: "metalwargame",
        name: "unitmove",
        authorization: [
          {
            actor: account,
            permission: store.user.requestPermission,
          },
        ],
        data: {
          asset_owner: account,
          asset_id: id,
          x,
          y,
        },
      },
    ],
  };
  console.log(options);
  let response = {};
  if (localStorage.getItem("ual-session-authenticator") === "Anchor") {
    try {
      response = await store.user.signTransaction(options, {
        blocksBehind: 3,
        expireSeconds: 30,
      });
      return true;
    } catch (e) {
      console.log({ ...e });
      return false;
    }
  }
  if (localStorage.getItem("ual-session-authenticator") === "Wax") {
    options.actions[0].authorization[0].permission = "active";
    try {
      response = await store.user.wax.api.transact(options, {
        blocksBehind: 3,
        expireSeconds: 30,
        broadcast: true,
        sign: true,
      });
      return true;
    } catch (e) {
      console.log("WCW Error: ");
      console.log({ ...e }, e);
      let errorText = "";
      if (
        e &&
        e.json &&
        e.json.error &&
        e.json.error.details &&
        e.json.error.details[0]
      )
        errorText = e.json.error.details[0].message;
      else
        errorText =
          "Something wrong. Сheck your browser for pop-up pages permission.(Required for work WAX cloud)";
      return false;
    }
  }
}
async function fireTransaction({ id, target_id }) {
  if (!id) return true;
  let account = await store.user.getAccountName();
  let options = {
    actions: [
      {
        account: "metalwargame",
        name: "unitattack",
        authorization: [
          {
            actor: account,
            permission: store.user.requestPermission,
          },
        ],
        data: {
          asset_owner: account,
          asset_id: id,
          target_id,
        },
      },
    ],
  };
  console.log(options);
  let response = {};
  if (localStorage.getItem("ual-session-authenticator") === "Anchor") {
    try {
      response = await store.user.signTransaction(options, {
        blocksBehind: 3,
        expireSeconds: 30,
      });
      return true;
    } catch (e) {
      console.log({ ...e });
      return false;
    }
  }
  if (localStorage.getItem("ual-session-authenticator") === "Wax") {
    options.actions[0].authorization[0].permission = "active";
    try {
      response = await store.user.wax.api.transact(options, {
        blocksBehind: 3,
        expireSeconds: 30,
        broadcast: true,
        sign: true,
      });
      return true;
    } catch (e) {
      console.log("WCW Error: ");
      console.log({ ...e }, e);
      let errorText = "";
      if (
        e &&
        e.json &&
        e.json.error &&
        e.json.error.details &&
        e.json.error.details[0]
      )
        errorText = e.json.error.details[0].message;
      else
        errorText =
          "Something wrong. Сheck your browser for pop-up pages permission.(Required for work WAX cloud)";
      return false;
    }
  }
}
export {
  store,
  getIngameTanks,
  setExampleUnits,
  moveTransaction,
  fireTransaction,
};
