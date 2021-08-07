import { Sprite, Texture, Container, Text, AnimatedSprite } from "pixi.js";
import { gsap } from "gsap";
import base from "./units_templates.js";
import { ColorOverlayFilter } from "@pixi/filter-color-overlay";
import unpack_units from "./parser";
import { BevelFilter } from "@pixi/filter-bevel";
import { store } from "./store.js";
const objectsOnMap = [];
let state = {
  state: null,
  stuffGetted: false,
  unitsGetted: false,
  id: null,
  mountains: null,
  logs: [],
  bg: null,
  gameScene: null,
  target: null,
  defaultFireTimeout: 30,
  defaultMoveTimeout: 30,
  defaultMineTimeout: 120,
  defualtCellCost: 900,
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
  user: {},
  units: [],
  unusedUnits: [],
  objectsOnMap,
  getGaragesUnits({ x, y }) {
    return this.selfUnits.filter(el => el.posX === x && el.posY === y);
  },
};
Object.defineProperty(state, "unit", {
  get() {
    return this.u;
  },
  set(unit) {
    if (this.u) {
      this.u.active = false;
      if (this.u.ground) this.u.ground.filters = [];
    }
    if (unit) {
      unit.active = true;
      if (unit.ground)
        unit.ground.filters = [
          new BevelFilter({
            lightColor: 0xff69,
            thickness: 15,
            rotation: 0,
            shadowColor: 0xff69,
            lightAlpha: 1,
            shadowAlpha: 1,
          }),
        ];
    }
    this.u = unit;
  },
});
Object.defineProperty(state, "unusedUnits", {
  get() {
    return this.units.filter(el => el.posX === 1 && el.posY === 1);
  },
});
Object.defineProperty(state, "selfUnits", {
  get() {
    return this.units.filter(el => el.self);
  },
});
Object.defineProperty(state, "garages", {
  get() {
    return this.objectsOnMap.filter(el => el.type === "garage");
  },
});
Object.defineProperty(state, "unitsInVisibleZone", {
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
Object.defineProperty(state, "unitsFromKeys", {
  get() {
    return this.units.reduce((acc, el) => {
      acc[el.unit.asset_id] = el;
      return acc;
    });
  },
});
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
    let directions = ["u", "d", "r", "l", "ur", "ul", "dl", "dr"];
    let random = Math.ceil(Math.random() * (directions.length - 1));
    let sprite = Sprite.from(
      `./assets/cards/${el.image}/${directions[random]}.png`
    );
    directions.forEach(key => {
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
      if (el.type === "miner") {
        sprite["mine_" + key] = Texture.from(
          `./assets/cards/${el.image}/mining/${key}.png`
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

    container.timerText.x = 70;
    container.timerText.y = -20;
    let amount = el.stuff
      ? el.stuff.reduce((acc, el) => acc + el.amount * el.weight, 0)
      : 0;
    container.stuffCountText = new Text(`${amount}/${el.capacity}`, {
      fill: 0xefefef,
      fontFamily: "metalwar",
      fontSize: 15,
    });
    container.stuffCountText.x = 70;
    container.stuffCountText.y = 10;
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
    container.alphaCounter = async function(text = "+1", color = 0xeeeeee) {
      let node = new Text(text, {
        fill: color,
        fontFamily: "metalwar",
        fontSize: 25,
      });
      this.addChild(node);
      node.x = 40;
      node.y = 40;
      await gsap.to(node, { y: 0, alpha: 0, duration: 2 });
      this.removeChild(node);
    };
    container.miningAnimation = function() {
      setTimeout(
        () => (this.unit.texture = this.unit["mine_" + this.unit.direction]),
        100
      );
      setTimeout(
        () => (this.unit.texture = this.unit[this.unit.direction]),
        300
      );
      setTimeout(
        () => (this.unit.texture = this.unit["mine_" + this.unit.direction]),
        500
      );
      setTimeout(
        () => (this.unit.texture = this.unit[this.unit.direction]),
        700
      );
      setTimeout(
        () => (this.unit.texture = this.unit["mine_" + this.unit.direction]),
        900
      );
      setTimeout(
        () => (this.unit.texture = this.unit[this.unit.direction]),
        1100
      );
    };
    container.getMoveCooldown = function() {
      return (
        Date.now() + Math.floor(state.defualtCellCost / this.unit.speed) * 1000
      );
    };
    container.hpText.x = 50;
    container.hpText.y = -10;
    container.owner.x = 40;
    container.self = el.self;
    container.unit = sprite;
    container.agr = { value: false, timeout: "" };
    container.addChild(container.timerText);
    container.addChild(container.hpText);
    container.addChild(container.owner);
    container.addChild(container.stuffCountText);
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
    Object.defineProperty(container, "stuffCount", {
      get() {
        return this.unit.stuff
          ? this.unit.stuff.reduce((acc, el) => acc + el.amount * el.weight, 0)
          : 0;
      },
      set(val) {
        this.stuffCountText.text = `${val}/${this.unit.capacity}`;
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
    container.lockedTime = el.lockedTime;
    let skunk = Sprite.from("./assets/skunk_fire/skunk_crash.png");
    skunk.scale.x = 0.6;
    skunk.scale.y = 0.6;
    skunk.x += 20;
    skunk.y += 10;
    Object.defineProperty(container, "poised", {
      get() {
        if (this.unit.poised_cnt > 0) return this.unit.poised_cnt;
        else return 0;
      },
      set(val) {
        if (val < 0 || isNaN(val)) val = 0;
        this.unit.poised_cnt = val;
        if (val === 0) {
          this.removeChild(skunk);
        } else {
          this.addChild(skunk);
        }
      },
    });
    if (container.poised) container.addChild(skunk);
    Object.defineProperty(container, "health", {
      get() {
        return this.unit.hp;
      },
      async set(val) {
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
        await gsap.to(this.hpText.scale, { x: 1.1, y: 1.1, duration: 0.1 });
        await gsap.to(this.hpText.scale, { x: 1, y: 1, duration: 0.1 });
      },
    });
    Object.defineProperty(container, "agressive", {
      get() {
        return this.agr.value;
      },
      set(val) {
        this.agr.value = !!val;
        clearTimeout(this.agr.timeout);
        if (!!val) {
          this.unit.filters = [new ColorOverlayFilter(0xee4444, 0.35)];
          this.agr.timeout = setTimeout(() => (this.agressive = false), 10000);
        } else {
          this.unit.filters = [];
        }
      },
    });
    container.stakeValidator = function() {
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
const actions = {
  async getIngameTanks(
    handler,
    handlerMove,
    handlerAttack,
    handlerMine,
    handlerCollect,
    handlerDropStuff
  ) {
    let account = await state.user.getAccountName();
    let started = Date.now();
    let garages = await state.user.rpc.get_table_rows({
      json: true,
      code: "metalwargame",
      scope: "metalwargame",
      table: "teleports",
      limit: 100,
      reverse: true,
    });
    let anuses = await state.user.rpc.get_table_rows({
      json: true,
      code: "metalwargame",
      scope: "metalwargame",
      table: "oredeposits",
      limit: 100,
      reverse: true,
    });
    let end = Date.now();
    let ping = end - started;
    state.ping = ping;
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
    anuses.rows.forEach(el => {
      let posX = parseInt(el.location / 100000);
      let posY = parseInt(el.location % 100000);
      objectsOnMap.push(
        createObjectOnMap({
          name: "geyser5",
          image: "geyser5",
          posX,
          posY,
          scaled: 0.5,
          diffX: 25,
          diffY: -60,
          type: "geyser",
          lvl: el.lvl,
          amount: el.amount,
          type_id: el.type_id,
        })
      );
    });

    [wolf2, validator].forEach(el => {
      (el.self = true), (el.owner = state.user.accountName);
    });
    // state.units = createUnits([...arr, validator, wolf2]);
    // state.unit = state.units[0];
    const ws = new WebSocket("wss://game.metal-war.com/ws/");
    ws.onopen = () => console.log("websocket connected");
    ws.onmessage = async message => {
      if (typeof message.data === "object") {
        const array = new Uint8Array(await message.data.arrayBuffer());
        let units = unpack_units(array);
        if (Object.keys(units).length > 1000) {
          console.log("units getted");
          let allTanks = Object.values(units);
          let arr = [];
          allTanks.forEach(el => {
            let tank = base.find(key => el.template_id === key.id);
            if (!tank) {
            } else {
              let locked = el.next_availability * 1000 > Date.now();
              let lockedTime = el.next_availability * 1000;
              tank = {
                ...el,
                ...tank,
                inGame: true,
                id: el.asset_id,
                repair: Math.ceil((el.strength - el.hp) / 2),
                locked,
                lockedTime,
                self: el.owner === state.user.accountName,
              };
              arr.push(tank);
            }
          });
          //   state.units = arr;
          store.units = createUnits([...arr]);
          //   state.unit = state.units[0];
          state.unitsGetted = true;
          //   if (state.stuffGetted) handler();
        }
      } else {
        let data = JSON.parse(message.data);
        console.log(data);
        if (
          data.type === "actions" &&
          data.data &&
          typeof data.data.forEach === "function"
        ) {
          data.data.forEach(el => {
            let info = el;
            let ev = info.data;
            let ago = Math.ceil((Date.now() - info.ts * 1000) / 1000);
            let timeout = Date.now() + (state.defaultFireTimeout - ago) * 1000;
            if (el.name === "unitmove") {
              timeout = Date.now() + (state.defaultMoveTimeout - ago) * 1000;
              handlerMove({ id: ev.asset_id, x: ev.x, y: ev.y, timeout });
            }
            if (el.name === "unitmine") {
              timeout = Date.now() + (state.defaultMineTimeout - ago) * 1000;
              handlerMine({
                id: ev.asset_id,
                timeout,
                amount: state.defaultMineTimeout / 10,
              });
            }
            if (el.name === "unitattack") {
              handlerAttack({
                id: ev.asset_id,
                target_id: ev.target_id,
                timeout,
              });
            }
            if (el.name === "collectstuff") {
              handlerCollect({
                id: ev.asset_id,
                x: ev.x,
                y: ev.y,
              });
            }
            if (el.name === "dropstuff") {
              handlerDropStuff({
                id: ev.asset_id,
              });
            }
            if (el.name === "transfer" && data.data.some(el => el.data.memo)) {
              data.data
                .filter(
                  el => el.data && el.data.memo && el.data.memo.match("repair")
                )
                .forEach(el => {
                  let id = el.data.memo.split(":")[1];
                  let tank = state.unitsFromKeys[id];
                  if (!tank) return;
                  tank.health = tank.unit.strength;
                });
            }
          });
        }
        if (data.type === "stuff") {
          console.log(data);
          if (state.stuffGetted) return 0;
          let stuffs = Object.values(data.data);

          stuffs.forEach(el => {
            if (!el) return 0;
            let posX = parseInt(el.location / 100000);
            let posY = parseInt(el.location % 100000);
            el.stuff.forEach((type, i) => {
              let random = Math.ceil(Math.random() * 7);
              objectsOnMap.push(
                createObjectOnMap({
                  name: "stuff",
                  image: `metal/${random}`,
                  posX,
                  posY,
                  scaled: 0.35,
                  diffX: 35 + i * 10,
                  diffY: -10 + i * 10,
                  type: "stuff",
                  type_id: type.type,
                  amount: type.amount,
                  weight: type.weight,
                  zIndex: 1,
                  unground: true,
                })
              );
            });
          });
          state.stuffGetted = true;
          if (state.unitsGetted) handler();
        }
      }
    };
  },
};
export { state, actions };
