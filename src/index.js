import { Application, Sprite, Container, Polygon } from "pixi.js";
import {
  initMap,
  createJoystic,
  sortUnit,
  enableInteractiveMap,
  moveUnit,
  moveCircle,
  updateText,
  setUnit,
} from "./functionality";
import sheet from "./assets/sheet.json";
import montains from "./assets/montains.json";
import { getBorder, getCircle } from "./graphics";
import store from "./store";
import { gsap } from "gsap";
import { initGsap } from "./utils";

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
  store.units.forEach(el => store.gameScene.addChild(el));
  store.map = initMap(
    Object.keys(sheet.frames).filter(el => !el.match("r.png")),
    store.id
  );
  renderMap();
  // enableInteractiveMap(store.gameScene);
  store.units.forEach(el => {
    let random = Math.floor(Math.random() * (store.visibleZone.length - 5));
    setUnit(el, store.visibleZone[random + 5]);
  });
}
let ju = createJoystic({ x: window.innerWidth / 2, y: 0, angle: 90 }, () => {
  store.x--;
  store.y--;
  renderMap();
});
let jd = createJoystic(
  { x: window.innerWidth / 2 - 100, y: window.innerHeight, angle: -90 },
  () => {
    store.x++;
    store.y++;
    renderMap();
  }
);
let jl = createJoystic(
  { x: 0, y: window.innerHeight / 2 - 100, angle: 0 },
  () => {
    store.y++;
    store.x--;
    renderMap();
  }
);
let jr = createJoystic(
  { x: window.innerWidth, y: window.innerHeight / 2, angle: 180 },
  () => {
    store.y--;
    store.x++;
    renderMap();
  }
);
let jur = createJoystic({ x: window.innerWidth, y: 100, angle: 135 }, () => {
  store.y--;
  renderMap();
});
let jdl = createJoystic(
  { x: 0, y: window.innerHeight - 100, angle: -45 },
  () => {
    store.y++;
    renderMap();
  }
);
let jul = createJoystic({ x: 100, y: -10, angle: 45 }, () => {
  store.x--;
  renderMap();
});
let jdr = createJoystic(
  { x: window.innerWidth - 100, y: window.innerHeight, angle: 225 },
  () => {
    store.x++;
    renderMap();
  }
);
[ju, jd, jr, jl, jdl, jdr, jul, jur].forEach(el => app.stage.addChild(el));

function addSprite(target, i) {
  let index = i;
  let multipler = (target.height - 2) * Math.ceil(i / store.cellsInLine) - 1;
  let multiplerX = -(target.width * Math.floor(i / store.cellsInLine));
  if (multipler === 0) multipler = 200;
  // if (index === 0) i = 1;
  i = i % store.cellsInLine;
  target.x = (i * (target.width - 2)) / 2 - 250 + multiplerX / 2;
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
        newLine.push(getMontain());
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
      if (store.x < x) line.unshift(getMontain());
      else line.push(getMontain());
    }
    line.forEach(cell => store.visibleZone.push(cell));
  });
  store.visibleZone.forEach((el, i) => addSprite(el, i));
  store.units.forEach(el =>
    sortUnit(el, store.unit, store.visibleZone, circle)
  );
}

function getMontain(i = 1) {
  let names = Object.keys(montains.frames);
  let container = new Container();
  let sprite = Sprite.from("./assets/Wall048.png");
  let random = Math.ceil(Math.random() * names.length - 1);
  let name = names[random];
  let mountain = new Sprite(store.mountains[name]);
  container.addChild(sprite);
  container.addChild(mountain);
  container.unclickable = true;
  container.sortableChildren = true;
  container.zIndex = i;
  return container;
}
