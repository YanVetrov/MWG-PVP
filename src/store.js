import { Sprite, Texture, Container, Text } from "pixi.js";

import base from "./units_templates.js";
const objectsOnMap = [
  { name: "garage mini", image: "garage1" },
  { name: "garage big", image: "garage2" },
].map(el => {
  let sprite = Sprite.from(`./assets/${el.image}.png`);

  sprite.width = 120;
  sprite.height = 120;
  sprite.zIndex = 1;
  sprite.name = el.name;
  return sprite;
});
function createUnits(arr) {
  return arr.map((el, i) => {
    let sprite = Sprite.from(`./assets/cards/${el.image}/ul.png`);
    ["u", "d", "r", "l", "ur", "ul", "dl", "dr"].forEach(
      key =>
        (sprite[key] = Texture.from(`./assets/cards/${el.image}/${key}.png`))
    );
    let container = new Container();
    container.zIndex = 6;
    sprite.width = 120;
    sprite.height = 120;
    container.name = el.name;
    container.locked = false;
    container.lockedTime = 0;
    container.timerText = new Text("", { fill: 0xefefef, fontSize: 15 });
    container.timerText.x = 50;
    container.timerText.y = -20;
    container.hpText = new Text(`${el.hp}/${el.strength}`, {
      fill: 0x00ffaa,
      fontSize: 15,
    });
    container.hpText.x = 50;
    container.unit = sprite;
    container.addChild(container.timerText);
    container.addChild(container.hpText);
    container.addChild(sprite);
    let obj = new Proxy(container, {
      set(item, prop, val, prox) {
        if (prop === "lockedTime") {
          item.locked = !!val;
          if (!val) item.timerText.text = null;
        }
        if (prop === "timerText") {
          if (!val) val = "";
          item.timerText.text = val;
          return true;
        }
        if (prop === "alpha") {
          item.alpha = val;
          return true;
        }
        item[prop] = val;
        return true;
      },
    });

    return obj;
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
  defaultPosX: 1300,
  defaultPosY: -250,
  x: 0,
  y: 0,
  user: null,
  units: [],
  objectsOnMap,
};
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
export { store, getIngameTanks };
