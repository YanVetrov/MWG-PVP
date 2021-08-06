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
  getJoystics,
  background,
  getDirection,
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
} from "./store";
import { gsap } from "gsap";
import { initGsap } from "./utils";
import { ColorMatrixFilter } from "@pixi/filter-color-matrix";
sound.add("crash", "./assets/sound/crash.mp3");
sound.add("fire", "./assets/sound/fire.mp3");
sound.add("go", "./assets/sound/go.mp3");
sound.add("teleport", "./assets/teleport.mp3");
window.sound = name => sound.play(name || "go");
initGsap();
const app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
  antialias: true,
  resolution: 1,
  view: document.getElementById("canvas1"),
});

store.gameScene = new Container();
store.gameScene.sortableChildren = true;
store.gameScene.zIndex = 2;
store.gameScene.x = store.defaultPosX;
store.gameScene.y = store.defaultPosY;
store.gameScene.scale.y = 2 / window.devicePixelRatio;
store.gameScene.scale.x = 2 / window.devicePixelRatio;
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
  checkUnits();
  let joystics = getJoystics(store, renderMap);
  joystics.forEach(joy => app.stage.addChild(joy));
  renderMap();
  initUal(async e => {
    if (e[0].wax) e[0].rpc = e[0].wax.rpc;
    store.user = e[0];
    await getIngameTanks(
      onLoadedSocket,
      onUnitMove,
      onUnitAttack,
      onUnitMine,
      onUnitCollect,
      onUnitDrop
    );
  });
  document.getElementById("dev").addEventListener("click", e => {
    enableInteractiveMap(store.gameScene);
    e.target.style.visibility = "hidden";
  });
  document.getElementById("signout").addEventListener("click", e => {
    localStorage.clear();
    location.reload();
  });
  document.getElementById("drop_stuff").addEventListener("click", e => {
    dropStuffTransaction({ id: store.unit.unit.asset_id });
  });
  // document.getElementById("log").addEventListener("click", e => {
  //   console.log(store.logs);
  // });
  document
    .getElementById("garage_button")
    .addEventListener("click", () => showGarage(false));
}
function onLoadedSocket() {
  setObjectsOnMap(store.objectsOnMap);
  console.log("objects setted");
  setUnits(store.unitsInVisibleZone);
  console.log(store.unitsInVisibleZone);
  console.log("units setted");
  renderMap();
  console.log("map rendered");
}
async function onUnitMove({ id, x, y }) {
  let tank = store.unitsFromKeys[id];
  tank.posX = x;
  tank.posY = y;
  let ground = store.visibleZone.find(el => el.posX === x && el.posY === y);
  if (!ground) return 0;
  if (!tank.ground) {
    setUnit(tank, ground, false, "unit");
    await sortUnit(tank, store.unit, store.visibleZone, store.gameScene);
    return 0;
  }
  moveUnit(tank, ground);
  if (tank.poised) {
    tank.health -= 10;
    tank.poised--;
    checkDestroy(tank);
  }
  let timeout = tank.getMoveCooldown();
  tank.lockedTime = timeout;
  if (ground.type === "garage") {
    let tp = new AnimatedSprite(
      ["1.png", "2.png", "3.png"].map(el => Texture.from(`./assets/tp/${el}`))
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
}
async function onUnitCollect({ id, x, y }) {
  console.log("ok");
  let tank = store.unitsFromKeys[id];
  if (!tank) return 0;
  console.log("tank");
  let stuff = store.objectsOnMap.find(el => el.posX === x && el.posY === y);
  let index = store.objectsOnMap.findIndex(
    el => el.posX === x && el.posY === y
  );
  if (!stuff) return 0;
  console.log("stuff");
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
}
function checkDestroy(unit) {
  if (unit.health <= 0) {
    onUnitMove({ id: unit.unit.asset_id, x: 1, y: 1 });
    onUnitDrop({ id: unit.unit.asset_id });
  }
}
async function onUnitDrop({ id }) {
  let tank = store.unitsFromKeys[id];
  if (!tank) return 0;
  tank.unit.stuff.forEach((el, i) => {
    if (el.amount <= 0) return 0;
    let random = Math.ceil(Math.random() * 7);
    let stuff = createObjectOnMap({
      name: "stuff",
      image: `metal/${random}`,
      posX: tank.posX,
      posY: tank.posY,
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
    setObjectOnMap(stuff);
    sortUnit(stuff, store.unit, store.visibleZone, store.gameScene);
    tank.unit.stuff = [];
    tank.stuffCount = 0;
  });
}
async function onUnitAttack({ id, target_id, timeout }) {
  let tank = store.unitsInVisibleZone.find(el => el.unit.asset_id === id);
  let targetTank = store.unitsInVisibleZone.find(
    el => el.unit.asset_id === target_id
  );
  if (!tank || !targetTank) {
    return 0;
  } else {
    let ground = targetTank.ground;
    tank.lockedTime = timeout;
    if (targetTank.self) tank.agressive = true;
    await unitAction(tank, ground);
    checkDestroy(tank);
    if (tank.poised) {
      tank.health -= 10;
      tank.poised--;
      checkDestroy(tank);
    }
  }
}
async function onUnitMine({ id, timeout, amount }) {
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
}
function addSprite(target, i) {
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
  target.on("pointerup", e => clickSprite(target, event));
  target.hitArea = new Polygon([0, 64, 127, 0, 254, 64, 129, 127]);
}
async function clickSprite(target, event) {
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
        store.unit.unit.direction = getDirection(store.unit.ground, target);
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
        clickUnitMove(store.unit, target);
      }, 1000);
      if (target.touch === 2) {
        target.touch = 0;
        clearTimeout(target.timeout);
        showGarage(store.getGaragesUnits({ x: target.posX, y: target.posY }));
      }
      return (target.blocked = false);
    }
    if (event.button === 2) {
      showGarage(store.getGaragesUnits({ x: target.posX, y: target.posY }));
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
    await clickUnitMove(clone, target);
  }
  updateText(app.stage, store, `X:${target.posX} Y:${target.posY}`);
  target.blocked = false;
}
async function clickUnitMove(unit, ground) {
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
      ["1.png", "2.png", "3.png"].map(el => Texture.from(`./assets/tp/${el}`))
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
}
async function renderMap() {
  store.visibleZone.forEach(el => store.gameScene.removeChild(el));
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
        line.push(getMontain(right_left.frames, store.mountains_rl, store.id));
    }
    line.forEach(cell => store.visibleZone.push(cell));
  });
  store.visibleZone.forEach((el, i) => addSprite(el, i));
  store.unitsInVisibleZone.forEach(el =>
    sortUnit(el, store.unit, store.visibleZone, store.gameScene)
  );
  store.objectsOnMap.forEach(el =>
    sortUnit(el, store.unit, store.visibleZone, store.gameScene)
  );
  // initMiniMap();
  // renderMiniMap();
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
      for (let x = (cell - 1) * oneCellInset; x < cell * oneCellInset; x++) {
        for (let y = (line - 1) * oneCellInset; y < line * oneCellInset; y++) {
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
function checkUnits() {
  setInterval(() => {
    store.unitsInVisibleZone.forEach(el => {
      if (el.lockedTime === 0) return 0;
      if (Date.now() > el.lockedTime) {
        el.lockedTime = 0;
        el.unit.alpha = 1;
      } else {
        el.unit.alpha = 0.5;
        el.timer = Math.ceil((el.lockedTime - Date.now()) / 1000);
      }
    });
  }, 1000);
}
async function showGarage(units) {
  let container = document.querySelector(".garage_main");
  let main = document.querySelector(".tank_wrapper");
  if (units) container.style.visibility = "visible";
  else return (container.style.visibility = "hidden");
  main.innerHTML = "";
  units.forEach(el => {
    let tank = document.createElement("div");
    let coord = document.createElement("div");
    let img = document.createElement("img");
    let tank_name = document.createElement("div");
    let hp_bar = document.createElement("div");
    let repair_button = document.createElement("div");
    let countText = document.querySelector("#count_in_garage");
    tank.className = "tank";
    tank.setAttribute("data-id", el.unit.id);
    img.src = el.unit.dr.textureCacheIds[0];
    tank_name.innerText = el.name;
    tank_name.className = "tank_name";
    hp_bar.innerText = el.hpText.text;
    hp_bar.className = "hp_bar";
    repair_button.textContent = `REPAIR(${Math.ceil(
      (el.unit.strength - el.unit.hp) / 2
    )})`;
    repair_button.className = "repair_button";
    countText.textContent = units.length;
    tank.append(img);
    tank.append(tank_name);
    tank.append(hp_bar);
    tank.append(repair_button);
    img.addEventListener("click", e => {
      setColorAround(store.unit, false);
      store.unit = el;
      container.style.visibility = "hidden";
      setColorAround(store.unit, true);
    });
    repair_button.addEventListener("click", async e => {
      let count = Math.ceil((el.unit.strength - el.unit.hp) / 2);
      let res = repair({ id: el.unit.asset_id, count });
      if (res) {
        container.style.visibility = "hidden";
      }
    });
    main.append(tank);
  });
}
async function unitAction(unit, target) {
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
  Sound.from(`./assets/cards/${unit.unit.name}/fire.mp3`).play();
  if (unit.unit.poisoning) target.unit.poised = unit.unit.poisoning;
  if (action.throw) {
    for (let i = 0; i < fires.length; i++) {
      await shuffleUnit(unit);
      await gsap.to(fires[i], {
        x,
        y,
        duration: 0.5,
        ease: "Expo.easeIn",
      });
    }
  } else {
    await gsap.to(fires[0], {
      alpha: 1,
      duration: 0.5,
      ease: "Expo.easeIn",
    });
  }
  try {
    Sound.from(`./assets/cards/${unit.unit.name}/destroy.mp3`).play();
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
    checkDestroy(target.unit);
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
}
function setObjectsOnMap(objects) {
  objects.forEach((el, i) => {
    setObjectOnMap(el);
  });
}
function setObjectOnMap(el) {
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
    el.on("pointerout", e => (el.filters = []));
    el.on("pointerup", async e => {
      await collectStuffTransaction({
        id: store.unit.unit.asset_id,
        x: el.posX,
        y: el.posY,
      });
    });
  }
  if (el.posX === 1 && el.posY === 1)
    el.on("pointerup", async e => {
      await moveUnit(store.unit, el);
      await gsap.to(store.unit, {
        alpha: 0,
        y: store.unit.y - 200,
        duration: 1,
      });
      showGarage();
      store.unit = {};
    });
  let x = !isNaN(el.posY) ? el.posX - 1 : randomX;
  let y = !isNaN(el.posY) ? el.posY - 1 : randomY;
  setUnit(el, store.map[y][x], true, el.type);
  store.gameScene.addChild(el);
}
function setUnits(units) {
  units.forEach((el, i) => {
    if (isNaN(el.posX) || isNaN(el.posY)) return 0;
    store.gameScene.addChild(el);
    setUnit(el, store.map[el.posY - 1][el.posX - 1], false, "unit");
  });
}
window.addEventListener("resize", e => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
});
document.querySelector("canvas").addEventListener("contextmenu", e => {
  e.preventDefault();
});
async function shuffleUnit(unit) {
  let dir = {
    ur: { x: -10, y: 10 },
    r: { x: -10, y: 0 },
    dr: { x: -10, y: -10 },
    u: { x: 0, y: 10 },

    ul: { x: 10, y: 10 },
    l: { x: 10, y: 0 },
    dl: { x: 10, y: -10 },
    d: { x: 0, y: -10 },
  };
  await gsap.to(unit, {
    x: unit.x + dir[unit.unit.direction].x,
    y: unit.y + dir[unit.unit.direction].y,
    duration: 0.1,
    ease: "Power0.easeNone",
  });
  await gsap.to(unit, {
    x: unit.x - dir[unit.unit.direction].x,
    y: unit.y - dir[unit.unit.direction].y,
    duration: 0.1,
    ease: "Power0.easeNone",
  });
}
function isAvailableAttack(unit, target) {
  if (!unit || !target) return false;
  let radius = unit.unit.fire_radius;
  let available = isNaN(radius) ? 1 : radius;
  available++;
  let diffX = Math.abs(unit.posX - target.posX);
  let diffY = Math.abs(unit.posY - target.posY);
  if (diffX > available || diffY > available) return false;
  else return true;
}
function isAvailableMove(unit, target) {
  if (!unit || !target) return false;
  let multiX = Math.abs(unit.posX - target.posX);
  let multiY = Math.abs(unit.posY - target.posY);
  let available = 1;
  if (unit.ground && unit.ground.type === "garage") available += 3;
  if (multiX > available || multiY > available) return false;
  else return true;
}
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
