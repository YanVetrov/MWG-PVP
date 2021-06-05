import {
  Application,
  Sprite,
  utils,
  Container,
  Graphics,
  filters,
  Polygon,
  tilemap,
  Texture,
} from "pixi.js";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import base from "./units.js";
import { PixiPlugin } from "gsap/PixiPlugin.js";
import { MotionPathPlugin } from "gsap/MotionPathPlugin.js";
gsap.registerPlugin(PixiPlugin, MotionPathPlugin);
const graphics = new Graphics();
const circle = new Graphics();
window.__PIXI_INSPECTOR_GLOBAL_HOOK__ &&
  window.__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
const app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
  antialias: true,
  resolution: window.devicePixelRatio,
});
document.body.appendChild(app.view);
const store = {
  state: null,
  id: null,
  bg: null,
  gameScene: null,
  target: null,
  clicked: true,
  blockedUI: false,
};
app.renderer.backgroundColor = "0x202020";
app.renderer.autoResize = true;
let unit = null;
const units = base.map((el, i) => {
  let sprite = Sprite.from(`./assets/cards/${el.image}/ul.png`);
  sprite.card = Sprite.from(`./assets/cards/${el.image}/${el.image}.png`);
  sprite.card.x = 900 - 70 * i;
  sprite.card.y = 20;
  sprite.card.width = 50;
  sprite.card.height = 80;
  sprite.card.interactive = true;
  sprite.card.buttonMode = true;
  sprite.card.on("pointerdown", (e) => {
    unit = sprite;
    gsap.to(circle, {
      x: unit.ground.x + 20,
      y: unit.ground.y + 35,
      duration: 0.2,
      ease: "back.out(1)",
    });
  });
  ["u", "d", "r", "l", "ur", "ul", "dl", "dr"].forEach(
    (key) =>
      (sprite[key] = Texture.from(`./assets/cards/${el.image}/${key}.png`))
  );
  sprite.x = 250 * i + 65;
  sprite.y = 250 * i - 25;
  sprite.width = 120;
  sprite.height = 120;
  return sprite;
});
unit = units[1];
app.loader.add("./assets/sheet.json").load(setup);
function setup() {
  store.id = app.loader.resources["./assets/sheet.json"].textures;
  store.gameScene = new Container();
  store.gameScene.sortableChildren = true;
  app.stage.addChild(store.gameScene);
  graphics.beginFill(0x3500fa, 0);
  graphics.lineStyle(1, 0xffffff, 0.5);
  graphics.drawPolygon([0, 64, 127, 0, 254, 64, 129, 127]);
  graphics.endFill();
  graphics.zIndex = 1;

  circle.beginFill(0xffffff, 0);
  circle.lineStyle(3, 0x99ffaa, 1);
  circle.drawCircle(50, 50, 50);
  circle.endFill();
  circle.skew.y = -0.2;
  circle.skew.x = 0.7;
  circle.scale.x = 1.5;
  circle.zIndex = 1;
  store.gameScene.addChild(graphics);
  store.gameScene.addChild(circle);
  units.forEach((el) => {
    el.zIndex = 1;
    el.card.zIndex = 1;
    store.gameScene.addChild(el);
    app.stage.addChild(el.card);
  });
  let arr = [
    "Wall048.png",
    "Wall048.png",
    "Wall033.png",
    "Wall035.png",
    "Wall048.png",
    "Wall022.png",
    "Wall014.png",
    "Wall032.png",
    "Wall028.png",
    "Wall048.png",
    "Wall048.png",
    "Wall048.png",
    "Wall048.png",
    "Wall048.png",
    "Wall048.png",
    "Wall048.png",
    "Wall022.png",
    "Wall014.png",
    "Wall032.png",
    "Wall028.png",
    "Wall048.png",
    "Wall048.png",
    "Wall048.png",
    "Wall022.png",
    "Wall014.png",
    "Wall032.png",
    "Wall028.png",
    "Wall048.png",
    "Wall048.png",
    "Wall048.png",
    "Wall022.png",
    "Wall014.png",
    "Wall032.png",
    "Wall028.png",
    "Wall048.png",
    "Wall048.png",
    "Wall048.png",
    "Wall022.png",
    "Wall014.png",
    "Wall032.png",
    "Wall028.png",
    "Wall048.png",
    "Wall048.png",
  ];
  [...arr, ...arr].forEach((el, i) => {
    let sprite = new Sprite(store.id[el]);
    addSprite(sprite, i);
  });
  circle.x = unit.ground.x + 20;
  circle.y = unit.ground.y + 35;
}
window.addEventListener("mousewheel", (e) => {
  if (e.deltaY > 0) {
    store.gameScene.scale.x -= 0.01;
    store.gameScene.scale.y -= 0.01;
    store.gameScene.x += 2;
  }
  if (e.deltaY < 0) {
    store.gameScene.scale.x += 0.01;
    store.gameScene.scale.y += 0.01;
    store.gameScene.x -= 2;
  }
  console.log(app.stage.scale);
});
window.addEventListener("mousedown", (e) => {
  store.gameScene.dragging = true;
  store.gameScene.dragX = e.clientX;
  store.gameScene.dragY = e.clientY;
  store.gameScene.cacheX = e.clientX;
  store.gameScene.cacheY = e.clientY;
});
window.addEventListener("mousemove", (e) => {
  if (store.gameScene.dragging) {
    let deltaX = store.gameScene.dragX - e.clientX;
    let deltaY = store.gameScene.dragY - e.clientY;
    if (Math.abs(deltaY) < 2 && Math.abs(deltaX) < 2) return 0;
    store.gameScene.x += deltaX;
    store.gameScene.dragX = e.clientX;
    store.gameScene.y += deltaY;
    store.gameScene.dragY = e.clientY;
    store.blockedUI = true;
  }
});
window.addEventListener("mouseup", (e) => {
  store.gameScene.dragging = false;
  store.gameScene.dragX = null;
  store.gameScene.dragY = null;
  setTimeout(() => (store.blockedUI = false), 100);
});
function addSprite(target, i) {
  let multipler = (target.height - 2) * Math.ceil(i / 10) - 1;
  i = i % 10;
  target.x = (i * (target.width - 2)) / 2 - 250;
  target.y = (i * (target.height - 2)) / 2 - 250 + multipler;
  target.interactive = true;
  target.buttonMode = true;
  if (units[i]) {
    units[i].x = target.x + 60;
    units[i].y = target.y - 10;
    units[i].ground = target;
  }

  store.gameScene.addChild(target);
  target.on("pointerover", (e) => {
    target.alpha = 0.8;
    graphics.x = e.target.x;
    graphics.y = e.target.y;
  });
  target.on("pointerout", (e) => {
    target.alpha = 1;
    graphics.x = -200;
    graphics.y = -200;
  });
  target.on("pointerup", (e) => {
    if (store.blockedUI) return 0;
    if (unit.ground) {
      if (unit.ground.x > e.target.x && unit.ground.y == e.target.y)
        unit.texture = unit.l;
      if (unit.ground.x < e.target.x && unit.ground.y == e.target.y)
        unit.texture = unit.r;
      if (unit.ground.y > e.target.y && unit.ground.x == e.target.x)
        unit.texture = unit.u;
      if (unit.ground.y < e.target.y && unit.ground.x == e.target.x)
        unit.texture = unit.d;

      if (unit.ground.x > e.target.x && unit.ground.y > e.target.y)
        unit.texture = unit.ul;
      if (unit.ground.x < e.target.x && unit.ground.y < e.target.y)
        unit.texture = unit.dr;
      if (unit.ground.x < e.target.x && unit.ground.y > e.target.y)
        unit.texture = unit.ur;
      if (unit.ground.x > e.target.x && unit.ground.y < e.target.y)
        unit.texture = unit.dl;
    }
    unit.ground = target;
    gsap.to(circle, {
      x: e.target.x + 20,
      y: e.target.y + 35,
      duration: 0.2,
      ease: "back.out(1)",
    });
    gsap.to(unit, {
      x: e.target.x + 60,
      y: e.target.y - 10,
      duration: 0.5,
      ease: "back.out(1)",
    });
  });
  target.hitArea = new Polygon([0, 64, 127, 0, 254, 64, 129, 127]);
}
