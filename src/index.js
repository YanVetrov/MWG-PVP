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
  Text,
} from "pixi.js";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin.js";
import { MotionPathPlugin } from "gsap/MotionPathPlugin.js";
import sheet from "./assets/sheet.json";
import { getBorder, getCircle } from "./graphics";
import store from "./store";
import getDirection from "./getDirection";
let border = getBorder();
let circle = getCircle();
gsap.registerPlugin(PixiPlugin, MotionPathPlugin);
window.__PIXI_INSPECTOR_GLOBAL_HOOK__ &&
  window.__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
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
app.stage.sortableChildren = true;
app.renderer.backgroundColor = "0x202020";
app.renderer.autoResize = true;
store.unit = store.units[1];
app.loader.add("./assets/sheet.json").load(setup);
let sprites = [];
function setup() {
  store.id = app.loader.resources["./assets/sheet.json"].textures;
  app.stage.addChild(store.gameScene);
  store.gameScene.addChild(border);
  store.gameScene.addChild(circle);
  store.gameScene.x = 500;
  store.gameScene.y = 300;
  store.units.forEach((el) => {
    el.zIndex = 1;
    store.gameScene.addChild(el);
  });
  let arr = Object.keys(sheet.frames).filter((el) => !el.match("r.png"));
  for (let i = 0; i < 40000; i++) {
    let random = Math.ceil(Math.random() * arr.length - 1);
    let name = arr[random];
    let sprite = new Sprite(store.id[name]);
    sprite.posX = i % 200;
    sprite.posY = Math.floor(i / 200);
    if (i % 200 === 0) sprites.push([]);
    sprites[Math.floor(i / 200)].push(sprite);
  }
  // console.log(sprites);
  renderField();
  // circle.x = store.unit.ground.x + 20;
  // circle.y = store.unit.ground.y + 35;
}
let joystick = Sprite.from("./assets/joistik.png");
joystick.x = window.innerWidth / 2;
joystick.zIndex = 3;
app.stage.addChild(joystick);
joystick.angle = 90;
joystick.y = 50;
joystick.interactive = true;
joystick.buttonMode = true;
joystick.on("pointerdown", (e) => {
  if (store.y === 0) return 0;
  store.y--;
  renderField();
});
let joystick_down = Sprite.from("./assets/joistik.png");
joystick_down.x = window.innerWidth / 2;
joystick_down.y = window.innerHeight - 50;
joystick_down.zIndex = 3;

app.stage.addChild(joystick_down);
joystick_down.interactive = true;
joystick_down.buttonMode = true;
joystick_down.angle = -90;
joystick_down.on("pointerdown", (e) => {
  store.y++;
  renderField();
});

let joystick_left = Sprite.from("./assets/joistik.png");
joystick_left.x = 0;
joystick_left.y = window.innerHeight / 2;
joystick_left.zIndex = 3;

app.stage.addChild(joystick_left);
joystick_left.interactive = true;
joystick_left.buttonMode = true;
// joystick_left.angle = -90;
joystick_left.on("pointerdown", (e) => {
  if (store.x === 0) return 0;
  store.x--;
  renderField();
});
let joystick_right = Sprite.from("./assets/joistik.png");
joystick_right.x = window.innerWidth - 50;
joystick_right.y = window.innerHeight / 2;
joystick_right.zIndex = 3;

app.stage.addChild(joystick_right);
joystick_right.interactive = true;
joystick_right.buttonMode = true;
joystick_right.angle = 180;
joystick_right.on("pointerdown", (e) => {
  store.x++;
  renderField();
});
window.addEventListener("mousewheel", (e) => {
  let { x, y } = store.gameScene.scale;
  if (e.deltaY > 0 && x > 0.1) {
    store.gameScene.scale.x -= 0.01;
    store.gameScene.scale.y -= 0.01;
    store.gameScene.x += 5;
    store.gameScene.y += 5;
  }
  if (e.deltaY < 0 && x < 1.5) {
    store.gameScene.scale.x += 0.01;
    store.gameScene.scale.y += 0.01;
    store.gameScene.x += (window.innerWidth / 2 - e.clientX) / 50;
    store.gameScene.y += (window.innerHeight / 2 - e.clientY) / 50;
  }
});
window.addEventListener("mousedown", (e) => {
  store.gameScene.dragging = true;
  store.gameScene.dragX = e.clientX;
  store.gameScene.dragY = e.clientY;
  console.log(e);
});
let tpCache = {};
window.addEventListener("touchstart", (e) => {
  if (e.touches.length < 2) {
    e = e.touches[0];
    store.gameScene.dragging = true;
    store.gameScene.dragX = e.clientX;
    store.gameScene.dragY = e.clientY;
    return 0;
  }
  if (e.targetTouches.length >= 2) {
    if (e.targetTouches[0].clientX < e.targetTouches[1].clientX) {
      tpCache.leftFinger = e.targetTouches[0];
      tpCache.rightFinger = e.targetTouches[1];
    } else {
      tpCache.leftFinger = e.targetTouches[1];
      tpCache.rightFinger = e.targetTouches[0];
    }
  }
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
window.addEventListener("touchmove", (e) => {
  console.log(e);

  let { x, y } = store.gameScene.scale;
  if (e.targetTouches.length < 2) {
    if (store.blockedMultitouch) return 0;
    e = e.touches[0];
    if (!store.gameScene.dragX || !store.gameScene.dragY) {
      store.gameScene.dragY = e.clientY;
      store.gameScene.dragX = e.clientX;
    }
    let deltaX = store.gameScene.dragX - e.clientX;
    let deltaY = store.gameScene.dragY - e.clientY;
    if (Math.abs(deltaY) < 2 && Math.abs(deltaX) < 2) return 0;
    store.gameScene.x -= deltaX;
    store.gameScene.dragX = e.clientX;
    store.gameScene.y -= deltaY;
    store.gameScene.dragY = e.clientY;
    store.blockedUI = true;
    return 0;
  }
  if (e.touches.length >= 2) {
    let leftFinger =
      e.targetTouches[0].clientX < e.targetTouches[1].clientX
        ? e.targetTouches[0]
        : e.targetTouches[1];
    let rightFinger =
      e.targetTouches[0].clientX < e.targetTouches[1].clientX
        ? e.targetTouches[1]
        : e.targetTouches[0];
    var diff1 = leftFinger.clientX - tpCache.leftFinger.clientX;
    var diff2 = tpCache.rightFinger.clientX - rightFinger.clientX;
    let diff = -(diff1 + diff2);

    if ((diff > 0 && x < 1.5) || (diff < 0 && x > 0.05)) {
      store.gameScene.scale.x += diff / 300;
      store.gameScene.scale.y += diff / 300;
      store.gameScene.x -= diff;
      store.gameScene.y -= diff;
    }
    tpCache.rightFinger = rightFinger;
    tpCache.leftFinger = leftFinger;
    store.blockedMultitouch = true;
    store.blockedUI = true;
  }
});
window.addEventListener("touchend", (e) => {
  store.gameScene.dragging = false;
  store.gameScene.dragX = null;
  store.gameScene.dragY = null;
  tpCache = {};
  setTimeout(() => {
    store.blockedUI = false;
    store.blockedMultitouch = false;
  }, 100);
});
window.addEventListener("mouseup", (e) => {
  store.gameScene.dragging = false;
  store.gameScene.dragX = null;
  store.gameScene.dragY = null;
  setTimeout(() => (store.blockedUI = false), 100);
});
function addSprite(target, i) {
  let index = i;
  // if (index === 0) return 0;
  let multipler = (target.height - 2) * Math.ceil(i / store.cellsInLine) - 1;
  if (index === 0) i = 1;
  i = i % store.cellsInLine;
  target.width = 256;
  target.height = 128;
  let multiplerX = 0;
  // if (i === 0 && index !== 0) multiplerX = -128;
  let multiplerY = 0;
  // if (i === 0 && index !== 0) multiplerY = 128;
  target.x = (i * (target.width - 2)) / 2 - 250 + multiplerX;
  target.y = (i * (target.height - 2)) / 2 - 250 + multipler + multiplerY;
  target.interactive = true;
  target.buttonMode = true;
  if (store.units[index] && !store.units[index].ground) {
    store.units[index].x = target.x + 60;
    store.units[index].y = target.y - 10;
    store.units[index].posX = target.posX;
    store.units[index].posY = target.posY;
    store.units[index].ground = target;
    target.unit = store.units[index];
  }
  store.gameScene.addChild(target);
  target.on("pointerover", (e) => {
    target.alpha = 0.8;
    console.log(store.gameScene);
  });
  target.on("pointerout", (e) => {
    target.alpha = 1;
  });
  target.on("pointerup", (e) => {
    if (store.blockedUI) return 0;
    circle.alpha = 1;
    if (e.target.unit) {
      store.unit = e.target.unit;
      gsap.to(circle, {
        x: store.unit.ground.x + 20,
        y: store.unit.ground.y + 35,
        duration: 0.2,
        ease: "back.out(1)",
      });
    }

    if (store.unit.ground && !e.target.unit) {
      store.unit.texture =
        store.unit[getDirection(store.unit.ground, e.target)];
      store.unit.ground.unit = null;
      store.unit.ground = target;
      target.unit = store.unit;
      store.unit.posX = target.posX;
      store.unit.posY = target.posY;
      store.unit.alpha = 1;
      gsap.to(circle, {
        x: e.target.x + 20,
        y: e.target.y + 35,
        duration: 0.5,
        ease: "back.out(1)",
      });
      gsap.to(store.unit, {
        x: e.target.x + 60,
        y: e.target.y - 10,
        duration: 0.5,
        ease: "back.out(1)",
      });
    }
    app.stage.removeChild(store.text);
    store.text = new Text(
      `X:${store.unit.ground.posX} Y:${store.unit.ground.posY}`,
      { fontSize: 30, fill: 0xffffff }
    );
    app.stage.addChild(store.text);
  });
  target.hitArea = new Polygon([0, 64, 127, 0, 254, 64, 129, 127]);
}
function renderField() {
  store.visibleZone.forEach((el) => store.gameScene.removeChild(el));
  store.visibleZone = [];
  sprites.slice(store.y, store.y + store.countLines).forEach((el, i) => {
    el.slice(store.x, store.x + store.cellsInLine).forEach((cell) =>
      store.visibleZone.push(cell)
    );
  });
  store.visibleZone.forEach((el, i) => addSprite(el, i));
  store.units.forEach((el) => {
    let ground = store.visibleZone.find(
      (gr) => gr.posX === el.posX && gr.posY === el.posY
    );
    if (ground) {
      el.x = ground.x + 60;
      el.y = ground.y - 10;
      el.alpha = 1;
      if (el === store.unit) {
        circle.x = ground.x + 20;
        circle.y = ground.y + 35;
      }
    } else {
      el.alpha = 0;
      if (el === store.unit) circle.alpha = 0;
    }
  });
}
