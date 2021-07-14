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
import { sound } from "@pixi/sound";
import sheet from "./assets/sheet.json";
import top_bottom from "./assets/top_bottom.json";
import right_left from "./assets/right_left.json";
import { getBorder, getCircle } from "./graphics";
import { initUal } from "./auth";
import {
  store,
  getIngameTanks,
  moveTransaction,
  fireTransaction,
} from "./store";
import { gsap } from "gsap";
import { initGsap } from "./utils";
import { ColorMatrixFilter } from "@pixi/filter-color-matrix";
sound.add("crash", "./assets/sound/crash.mp3");
sound.add("fire", "./assets/sound/fire.mp3");
sound.add("go", "./assets/sound/go.mp3");
sound.add("teleport", "./assets/sound/teleport.mp3");
window.sound = name => sound.play(name || "go");
initGsap();
let border = getBorder();
let circle = getCircle();
const app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
  antialias: true,
  resolution: 1,
});
document.body.appendChild(app.view);

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
  // store.gameScene.addChild(border);
  store.gameScene.addChild(circle);
  store.map = initMap(
    Object.keys(sheet.frames).filter(el => !el.match("r.png")),
    store.id,
    store.allMapCount
  );
  renderMap();
  for (let i = 1; i < 100; i++) {
    let sprite = Sprite.from("./assets/mountain.png");
    sprite.zIndex = 1;
    sprite.scale.x = 0.4;
    sprite.scale.y = 0.4;
    sprite.diffX = -20;
    sprite.diffY = -55;
    sprite.alpha = 0.75;
    store.objectsOnMap.push(sprite);
  }
  store.objectsOnMap.forEach((el, i) => {
    let randomY = Math.floor(Math.random() * (199 - 170)) + 170;
    let randomX = Math.floor(Math.random() * (199 - 170)) + 170;
    if (el.scaled) {
      el.scale.x = el.scaled;
      el.scale.y = el.scaled;
    }
    setUnit(
      el,
      store.map.filter(el => !el.unit)[el.posY || randomY][el.posX || randomX],
      true
    );
    store.gameScene.addChild(el);
  });
  renderMap();
  checkUnits();
  let joystics = getJoystics(store, renderMap);
  joystics.forEach(joy => app.stage.addChild(joy));
  initUal(async e => {
    if (e[0].wax) e[0].rpc = e[0].wax.rpc;
    store.user = e[0];
    await getIngameTanks();
    store.units.forEach((el, i) => {
      store.gameScene.addChild(el);
      setUnit(el, store.map[el.posY - 1 || 0][el.posX - 1 || i]);
    });
    store.unusedUnits.forEach((el, i) => {
      el.interactive = true;
      el.buttonMode = true;
      el.on("pointerup", e => {
        store.unit = el;
      });
      el.x = i * 100 + 200;
      el.y = window.innerHeight - el.height;
      app.stage.addChild(el);
    });
    renderMap();
  });
  document.getElementById("dev").addEventListener("click", e => {
    enableInteractiveMap(store.gameScene);
    e.target.style.visibility = "hidden";
  });
  document.getElementById("signout").addEventListener("click", e => {
    localStorage.clear();
    location.reload();
  });
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
    target.alpha = 0.8;
  });
  target.on("pointerout", e => {
    target.alpha = 1;
  });
  target.on("pointerup", async e => {
    if (target.blocked) return 0;
    target.blocked = true;
    if (e.target.unclickable) return (target.blocked = false);
    if (store.gameScene.blockedUI) return (target.blocked = false);
    circle.alpha = 1;
    if (store.unit.unused) {
      app.stage.removeChild(store.unit);
      store.units.push(store.unit);
      store.unit.ground = store.map[0][0];
    }
    if (target.unit) {
      if (target.unit.self) {
        if (target.unit.unit.type === "validator" && target.unit.locked) {
          moveUnit(store.unit, target);
          await gsap.to(store.unit, { alpha: 0, duration: 2 });
        }
        store.unit = target.unit;
        moveCircle(circle, store.unit.ground, 0.2);
      } else {
        if (store.unit !== e.target.unit) {
          if (store.unit.locked) return (target.blocked = false);
          store.unit.unit.direction = getDirection(store.unit.ground, e.target);
          let res = await fireTransaction({
            id: store.unit.unit.id,
            target_id: target.unit.unit.id,
          });
          if (res) unitAction(store.unit, target);
          return (target.blocked = false);
        }
      }
    }
    if (store.unit.ground && !e.target.unit) {
      if (store.unit.locked) return (target.blocked = false);
      let multiX = Math.abs(store.unit.posX - e.target.posX);
      let multiY = Math.abs(store.unit.posY - e.target.posY);
      console.log(multiX, multiY);
      if (multiX > 1 || multiY > 1) return (target.blocked = false);
      let transact = await moveTransaction({
        id: store.unit.unit.asset_id,
        x: e.target.posX,
        y: e.target.posY,
      });
      if (!transact) return (target.blocked = false);
      moveUnit(store.unit, target);
      moveCircle(circle, target);
    }
    updateText(app.stage, store, `X:${e.target.posX} Y:${e.target.posY}`);
    target.blocked = false;
  });
  target.hitArea = new Polygon([0, 64, 127, 0, 254, 64, 129, 127]);
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
  store.units.forEach(el =>
    sortUnit(el, store.unit, store.visibleZone, store.gameScene, circle)
  );
  store.objectsOnMap.forEach(el =>
    sortUnit(el, store.unit, store.visibleZone, store.gameScene, circle)
  );
  initMiniMap();
  renderMiniMap();
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
          if (store.units.some(el => el.posX === x + 1 && el.posY === y + 1))
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
    store.units.forEach(el => {
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

async function unitAction(unit, target) {
  let crash = new AnimatedSprite(
    ["crash.png", "crash1.png", "crash2.png"].map(el =>
      Texture.from(`./assets/${el}`)
    )
  );
  let obj = {
    ur: { x: 80, y: 25 },
    r: { x: 90, y: 45 },
    dr: { x: 90, y: 70 },
    u: { x: 50, y: 15 },

    ul: { x: 10, y: 25 },
    l: { x: 0, y: 45 },
    dl: { x: 0, y: 80 },
    d: { x: 50, y: 90 },
  };
  let fires = (() => {
    let arr = [];
    for (let i = 0; i < 3; i++) {
      let fire = new AnimatedSprite(
        ["fire.png", "fire1.png", "fire2.png"].map(el =>
          Texture.from(`./assets/${el}`)
        )
      );
      fire.x = obj[getDirection(unit.ground, target)].x;
      fire.y = obj[getDirection(unit.ground, target)].y;
      fire.zIndex = 11;
      fire.animationSpeed = 0.5;
      fire.scale.x = 0.3;
      fire.scale.y = 0.3;
      fire.play();
      arr.push(fire);
    }
    return arr;
  })();
  unit.zIndex = 10;
  fires.forEach(fire => unit.addChild(fire));
  let { x, y } = target;
  x -= unit.x - 85;
  y -= unit.y - 35;
  // unit.lockedTime = Date.now() + 5000;
  // unit.unit.alpha = 0.5;
  window.sound("fire");
  gsap.to(fires[0], { x, y, duration: 0.5, ease: "sign.out" });
  gsap.to(fires[1], { x, y, delay: 0.1, duration: 0.5, ease: "sign.out" });
  await gsap.to(fires[2], {
    x,
    y,
    delay: 0.3,
    duration: 0.5,
    ease: "sign.out",
  });
  window.sound("crash");
  unit.zIndex = 1;
  fires.forEach(fire => unit.removeChild(fire));
  target.unit.addChild(crash);
  crash.animationSpeed = 0.2;
  crash.x = 35;
  crash.y = 30;
  // target.unit.alpha = 0;
  target.unit.health -= 20;
  if (target.unit.health < 0) {
    target.unit.health = 0;
    crash.scale.x = 1.5;
    crash.scale.y = 1.5;
    target.unit.unit.alpha = 0;
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
  crash.scale.x = 0.3;
  crash.scale.y = 0.3;
  crash.play();
  setTimeout(async () => {
    gsap.to(target.unit, { alpha: 1, duration: 1 });
    gsap.to(crash.scale, { x: 0.1, y: 0.1, duration: 2 });
    gsap.to(crash, { x: crash.x + 15, y: crash.y + 20, duration: 2 });
    await gsap.to(crash, { alpha: 0, duration: 2 });
    target.unit.removeChild(crash);
  }, 2000);
}
window.addEventListener("resize", e => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
});
