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
import { getBorder, getCircle } from "./graphics";
import store from "./store";
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
store.gameScene.x = 500;
store.gameScene.y = 300;
store.gameScene.scale.y = 1 / window.devicePixelRatio;
store.gameScene.scale.x = 1 / window.devicePixelRatio;
app.stage.addChild(store.gameScene);
app.stage.sortableChildren = true;
app.renderer.backgroundColor = "0x202020";
app.renderer.autoResize = true;
app.loader.add("./assets/sheet.json").load(setup);
function setup() {
  store.id = app.loader.resources["./assets/sheet.json"].textures;
  store.gameScene.addChild(border);
  store.gameScene.addChild(circle);
  store.units.forEach(el => store.gameScene.addChild(el));
  store.map = initMap(
    Object.keys(sheet.frames).filter(el => !el.match("r.png")),
    store.id
  );
  renderMap();
  enableInteractiveMap(store.gameScene);
}
let ju = createJoystic({ x: window.innerWidth / 2, y: 0, angle: 90 }, () => {
  if (store.y === 0) return 0;
  store.y--;
  renderMap();
});
let jd = createJoystic(
  { x: window.innerWidth / 2, y: window.innerHeight, angle: -90 },
  () => {
    store.y++;
    renderMap();
  }
);
let jl = createJoystic({ x: 0, y: window.innerHeight / 2, angle: 0 }, () => {
  if (store.x === 0) return 0;
  store.x--;
  renderMap();
});
let jr = createJoystic(
  { x: window.innerWidth, y: window.innerHeight / 2, angle: 180 },
  () => {
    store.x++;
    renderMap();
  }
);
[jr, ju, jd, jl].forEach(el => app.stage.addChild(el));

function addSprite(target, i) {
  let index = i;
  let multipler = (target.height - 2) * Math.ceil(i / store.cellsInLine) - 1;
  if (index === 0) i = 1;
  i = i % store.cellsInLine;
  target.x = (i * (target.width - 2)) / 2 - 250;
  target.y = (i * (target.height - 2)) / 2 - 250 + multipler;
  target.interactive = true;
  target.buttonMode = true;
  if (store.units[index] && !store.units[index].ground) {
    setUnit(store.units[index], target);
  }
  store.gameScene.addChild(target);
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
  store.map.slice(store.y, store.y + store.countLines).forEach((el, i) => {
    el.slice(store.x, store.x + store.cellsInLine).forEach(cell =>
      store.visibleZone.push(cell)
    );
  });
  store.visibleZone.forEach((el, i) => addSprite(el, i));
  store.units.forEach(el =>
    sortUnit(el, store.unit, store.visibleZone, circle)
  );
}
