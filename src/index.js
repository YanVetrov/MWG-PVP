import {
  Application,
  Sprite,
  Container,
  Polygon,
  Graphics,
  Text,
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
} from "./functionality";

import sheet from "./assets/sheet.json";
import top_bottom from "./assets/top_bottom.json";
import right_left from "./assets/right_left.json";
import { getBorder, getCircle } from "./graphics";
import { initUal } from "./auth";
import { store, getIngameTanks } from "./store";
import { gsap } from "gsap";
import { initGsap } from "./utils";
import { ColorMatrixFilter } from "@pixi/filter-color-matrix";
import { UALJs } from "ual-plainjs-renderer/dist/UALJs";
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
      setUnit(el, store.visibleZone.filter(el => !isNaN(el.posX))[i + 5]);
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
    // store.units.forEach(el => store.gameScene.removeChild(el));
    // initUal(async e => {
    //   if (e[0].wax) e[0].rpc = e[0].wax.rpc;
    //   store.user = e[0];
    //   await getIngameTanks();
    //   store.units.forEach((el, i) => {
    //     store.gameScene.addChild(el);
    //     setUnit(el, store.visibleZone.filter(el => !isNaN(el.posX))[i + 5]);
    //   });
    //   renderMap();
    // });
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
  target.on("pointerup", e => {
    if (e.target.unclickable) return 0;
    if (store.gameScene.blockedUI) return 0;
    circle.alpha = 1;
    if (e.target.unit) {
      store.unit = e.target.unit;
      moveCircle(circle, store.unit.ground, 0.2);
    }

    if (store.unit.ground && !e.target.unit) {
      if (store.unit.locked) return false;
      if (!moveUnit(store.unit, e.target)) return 0;
      // moveCircle(circle, e.target);
    }
    updateText(app.stage, store, `X:${e.target.posX} Y:${e.target.posY}`);
    // renderMiniMap();
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
        el.alpha = 1;
      } else {
        el.alpha = 0.5;
        el.timer = Math.ceil((el.lockedTime - Date.now()) / 1000);
      }
    });
  }, 1000);
}
