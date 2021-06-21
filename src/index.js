import { Application, Sprite, Container, Polygon, Graphics } from "pixi.js";
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
import montains from "./assets/montains.json";
import { getBorder, getCircle } from "./graphics";
import store from "./store";
import { gsap } from "gsap";
import { initGsap } from "./utils";
import { ColorMatrixFilter } from "@pixi/filter-color-matrix";
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
app.loader.add("./assets/sheet.json").add("./assets/montains.json").load(setup);
function setup() {
  store.id = app.loader.resources["./assets/sheet.json"].textures;
  store.mountains = app.loader.resources["./assets/montains.json"].textures;
  // store.gameScene.addChild(border);
  store.gameScene.addChild(circle);
  store.map = initMap(
    Object.keys(sheet.frames).filter(el => !el.match("r.png")),
    store.id,
    store.allMapCount
  );
  renderMap();
  store.units.forEach(el => {
    store.gameScene.addChild(el);
    let random = Math.floor(Math.random() * (store.visibleZone.length - 5));
    setUnit(el, store.visibleZone[random + 5]);
  });

  store.objectsOnMap.forEach((el, i) => {
    i *= 3;
    setUnit(el, store.visibleZone[i], true);
    store.gameScene.addChild(el);
  });
  renderMap();
  let joystics = getJoystics(store, renderMap);
  joystics.forEach(joy => app.stage.addChild(joy));
  enableInteractiveMap(store.gameScene);
}

function addSprite(target, i) {
  let index = i;
  let multipler = (target.height - 2) * Math.ceil(i / store.cellsInLine) - 1;
  let multiplerX = -(target.width * Math.floor(i / store.cellsInLine));
  // let multiplerX = 0;
  if (multipler === 0) multipler = 200;
  // if (index === 0) i = 1;
  i = i % store.cellsInLine;
  target.x = (i * (target.width - 2)) / 2 - 250 + multiplerX / 2 + i;
  if (i === 0) i = 1;
  target.y = (i * (target.height - 2)) / 2 - 250 + multipler / 2;
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
      moveUnit(store.unit, e.target);
      moveCircle(circle, e.target);
    }
    updateText(
      app.stage,
      store,
      `X:${store.unit.ground.posX} Y:${store.unit.ground.posY}`
    );
    renderMiniMap();
  });
  target.hitArea = new Polygon([0, 64, 127, 0, 254, 64, 129, 127]);
}
function renderMap() {
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
    for (let i = 0; i < count; i++) {
      let newLine = [];
      for (let k = 0; k < store.cellsInLine; k++) {
        newLine.push(getMontain(montains.frames, store.mountains));
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
        line.unshift(getMontain(montains.frames, store.mountains));
      else line.push(getMontain(montains.frames, store.mountains));
    }
    line.forEach(cell => store.visibleZone.push(cell));
  });
  store.visibleZone.forEach((el, i) => addSprite(el, i));
  store.units.forEach(el =>
    sortUnit(el, store.unit, store.visibleZone, circle)
  );
  store.objectsOnMap.forEach(el =>
    sortUnit(el, store.unit, store.visibleZone, circle)
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
function renderMiniMap() {
  if (store.cashMinimap) store.miniMap.removeChild(store.cashMinimap);
  store.cashMinimap = new Graphics();
  let size = 0.5;
  let scale = 0.1;
  let realSquareSize = store.miniMap.width * size * scale;
  let oneLine = Math.floor(store.miniMap.width / realSquareSize);
  let countLines = Math.floor(store.miniMap.height / realSquareSize);
  for (let line = 0; line < countLines; line++) {
    for (let cell = 0; cell < oneLine; cell++) {
      let color = 0x00aa00;
      let alpha = 0;
      let unit = store.units.find(el => el.posY === line && el.posX === cell);
      let point = store.objectsOnMap.find(
        el => el.posY === line && el.posX === cell
      );
      if (unit || point) alpha = 1;
      if (point) color = 0xcc90fe;
      store.cashMinimap.beginFill(color, alpha);
      store.cashMinimap.lineStyle(0.015, 0xffffff, 0.3);
      store.cashMinimap.drawRect(size * cell, size * line, size, size);
      store.cashMinimap.scale.x = scale;
      store.cashMinimap.scale.y = scale;
      store.cashMinimap.endFill();
      store.cashMinimap.zIndex = 2;
    }
  }
  store.miniMap.addChild(store.cashMinimap);
}
