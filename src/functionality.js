import { Sprite, Text, Container, Point, Graphics } from "pixi.js";
import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import { gsap } from "gsap";
function createJoystic({ x = 0, y = 0, angle = 0 }, handler) {
  let joystick = Sprite.from("./assets/joystic.png");
  let joyContainer = new Container();
  joyContainer.sortableChildren = true;
  joyContainer.x = x;
  joyContainer.zIndex = 3;
  joyContainer.angle = angle;
  joyContainer.y = y;
  joyContainer.interactive = true;
  joyContainer.buttonMode = true;
  joystick.alpha = 1;
  joystick.zIndex = 2;
  joyContainer.scale.y = 0.5 / window.devicePixelRatio;
  joyContainer.scale.x = 0.5 / window.devicePixelRatio;
  joyContainer.on("pointerover", e => {
    gsap.to(joystick.scale, {
      x: joystick.scale.x + 0.03,
      y: joystick.scale.y + 0.03,
      duration: 0.3,
    });
  });
  joyContainer.on("pointerout", e => {
    gsap.to(joystick.scale, {
      x: joystick.scale.x - 0.03,
      y: joystick.scale.y - 0.03,
      duration: 0.3,
    });
  });
  joyContainer.on("pointerdown", () => {
    handler();
    joystick.interval = setInterval(() => handler(), 150);
  });
  joyContainer.on("pointerup", () => clearInterval(joystick.interval));
  joyContainer.addChild(joystick);
  return joyContainer;
}
function getMontain(frames, store, id) {
  let names = Object.keys(frames);
  let container = new Container();
  let sprite = new Sprite(id["Wall005.png"]);
  let random = Math.ceil(Math.random() * names.length - 1);
  let name = names[random];
  let mountain = new Sprite(store[name]);
  mountain.width = 200;
  mountain.height = 200;
  sprite.width = 256;
  container.height = 128;
  mountain.x = 30;
  mountain.y = -70;
  container.addChild(sprite);
  container.addChild(mountain);
  container.unclickable = true;
  container.sortableChildren = true;
  container.zIndex = 1;
  return container;
}
function getJoystics(store, renderMap) {
  let joystics = [
    createJoystic({ x: window.innerWidth / 2, y: 0, angle: 90 }, () => {
      if (store.x > -5) store.x--;
      if (store.y > -5) store.y--;
      renderMap();
    }),
    createJoystic(
      { x: window.innerWidth / 2 - 50, y: window.innerHeight, angle: -90 },
      () => {
        store.x++;
        store.y++;
        renderMap();
      }
    ),
    createJoystic({ x: 0, y: window.innerHeight / 2 - 50, angle: 0 }, () => {
      store.y++;
      if (store.x > -5) store.x--;
      renderMap();
    }),
    createJoystic(
      { x: window.innerWidth, y: window.innerHeight / 2, angle: 180 },
      () => {
        if (store.y > -5) store.y--;
        store.x++;
        renderMap();
      }
    ),
    createJoystic({ x: window.innerWidth, y: 40, angle: 135 }, () => {
      if (store.y > -5) store.y--;
      renderMap();
    }),
    createJoystic({ x: 0, y: window.innerHeight - 40, angle: -45 }, () => {
      store.y++;
      renderMap();
    }),
    createJoystic({ x: 40, y: -5, angle: 45 }, () => {
      if (store.x > -5) store.x--;
      renderMap();
    }),
    createJoystic(
      { x: window.innerWidth - 40, y: window.innerHeight, angle: 225 },
      () => {
        store.x++;
        renderMap();
      }
    ),
  ];
  return joystics;
}

function initMap(arr, store, count) {
  let map = [];
  let multiplier = count * 0.005;
  for (let i = 0; i < count; i++) {
    let y = Math.floor(i / multiplier) + 1;
    let x = (i % multiplier) + 1;
    let random = Math.ceil(Math.random() * arr.length - 1);
    let name = arr[random];
    let sprite;
    if (x <= 10 && y <= 10) sprite = Sprite.from("./assets/city.png");
    else sprite = new Sprite(store[name]);
    sprite.posX = x;
    sprite.posY = y;
    if (i % multiplier === 0) map.push([]);
    map[Math.floor(i / multiplier)].push(sprite);
  }
  return map;
}
async function sortUnit(unit, activeUnit, zone, container, circle) {
  let ground = zone.find(gr => gr.posX === unit.posX && gr.posY === unit.posY);
  if (ground) {
    let x = unit.diffX || 60;
    let y = unit.diffY || -10;
    unit.x = ground.x + x;
    unit.y = ground.y + y;
    container.addChild(unit);
    unit.visible = true;
    if (unit === activeUnit) {
      circle.x = ground.x + 20;
      circle.y = ground.y + 35;
    }
  } else {
    unit.visible = false;
    container.removeChild(unit);
    if (unit === activeUnit) circle.alpha = 0;
  }
}
async function enableInteractiveMap(zone) {
  window.addEventListener("mousewheel", e => {
    let { x, y } = zone.scale;
    if (e.deltaY > 0 && x > 0.1) {
      zone.scale.x -= 0.01;
      zone.scale.y -= 0.01;
      zone.x += 5;
      zone.y += 5;
    }
    if (e.deltaY < 0 && x < 1.5) {
      zone.scale.x += 0.01;
      zone.scale.y += 0.01;
      zone.x += (window.innerWidth / 2 - e.clientX) / 50;
      zone.y += (window.innerHeight / 2 - e.clientY) / 50;
    }
  });
  window.addEventListener("mousedown", e => {
    zone.dragging = true;
    zone.dragX = e.clientX;
    zone.dragY = e.clientY;
  });
  let tpCache = {};
  window.addEventListener("touchstart", e => {
    if (e.touches.length < 2) {
      e = e.touches[0];
      zone.dragging = true;
      zone.dragX = e.clientX;
      zone.dragY = e.clientY;
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
  window.addEventListener("mousemove", e => {
    if (zone.dragging) {
      let deltaX = zone.dragX - e.clientX;
      let deltaY = zone.dragY - e.clientY;
      if (Math.abs(deltaY) < 2 && Math.abs(deltaX) < 2) return 0;
      zone.x += deltaX;
      zone.dragX = e.clientX;
      zone.y += deltaY;
      zone.dragY = e.clientY;
      zone.blockedUI = true;
    }
  });
  window.addEventListener("touchmove", e => {
    let { x, y } = zone.scale;
    if (e.targetTouches.length < 2) {
      if (zone.blockedMultitouch) return 0;
      e = e.touches[0];
      if (!zone.dragX || !zone.dragY) {
        zone.dragY = e.clientY;
        zone.dragX = e.clientX;
      }
      let deltaX = zone.dragX - e.clientX;
      let deltaY = zone.dragY - e.clientY;
      if (Math.abs(deltaY) < 2 && Math.abs(deltaX) < 2) return 0;
      zone.x -= deltaX;
      zone.dragX = e.clientX;
      zone.y -= deltaY;
      zone.dragY = e.clientY;
      zone.blockedUI = true;
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
        zone.scale.x += diff / 300;
        zone.scale.y += diff / 300;
        zone.x -= diff;
        zone.y -= diff;
      }
      tpCache.rightFinger = rightFinger;
      tpCache.leftFinger = leftFinger;
      zone.blockedMultitouch = true;
      zone.blockedUI = true;
    }
  });
  window.addEventListener("touchend", e => {
    zone.dragging = false;
    zone.dragX = null;
    zone.dragY = null;
    tpCache = {};
    setTimeout(() => {
      zone.blockedUI = false;
      zone.blockedMultitouch = false;
    }, 100);
  });
  window.addEventListener("mouseup", e => {
    zone.dragging = false;
    zone.dragX = null;
    zone.dragY = null;
    setTimeout(() => (zone.blockedUI = false), 100);
  });
}
async function moveUnit(unit, ground) {
  let multiX = Math.abs(unit.posX - ground.posX);
  let multiY = Math.abs(unit.posY - ground.posY);
  console.log(multiX, multiY);
  if (multiX > 1 || multiY > 1) return false;
  unit.unit.direction = getDirection(unit.ground, ground);
  unit.ground.unit = null;
  unit.ground = ground;
  ground.unit = unit;
  unit.posX = ground.posX;
  unit.posY = ground.posY;
  unit.alpha = 1;
  gsap.to(unit, {
    x: ground.x + 60,
    y: ground.y - 10,
    duration: 0.5,
    ease: "back.out(1)",
  });
  unit.lockedTime = Date.now() + 10000;
  return true;
}
async function moveCircle(circle, ground, duration = 0.5) {
  circle.x = ground.x + 20;
  circle.y = ground.y + 35;
}
async function updateText(container, textNode, text) {
  container.removeChild(textNode.text);
  textNode.text = new Text(`${text}`, {
    fontSize: 30,
    fontFamily: "metalwar",
    fill: 0xffffff,
  });
  textNode.text.zIndex = 3;
  container.addChild(textNode.text);
}
function getDirection(fromPlace, toPlace) {
  console.log(fromPlace.x, fromPlace.y, toPlace.x, toPlace.y);
  if (fromPlace.x > toPlace.x && fromPlace.y == toPlace.y) return "l";
  if (fromPlace.x < toPlace.x && fromPlace.y == toPlace.y) return "r";
  if (fromPlace.y > toPlace.y && fromPlace.x == toPlace.x) return "u";
  if (fromPlace.y < toPlace.y && fromPlace.x == toPlace.x) return "d";

  if (fromPlace.x > toPlace.x && fromPlace.y > toPlace.y) return "ul";
  if (fromPlace.x < toPlace.x && fromPlace.y < toPlace.y) return "dr";
  if (fromPlace.x < toPlace.x && fromPlace.y > toPlace.y) return "ur";
  if (fromPlace.x > toPlace.x && fromPlace.y < toPlace.y) return "dl";
  return "ul";
}
function setUnit(unit, ground, unclickable = false) {
  // unit.x = ground.x + 60;
  // unit.y = ground.y - 10;
  if (ground.unit) return console.log("ground is busy");
  unit.posX = ground.posX;
  unit.posY = ground.posY;
  unit.ground = ground;
  ground.unit = unit;
  ground.unclickable = unclickable;
}
export {
  initMap,
  createJoystic,
  sortUnit,
  enableInteractiveMap,
  setUnit,
  moveCircle,
  moveUnit,
  updateText,
  getDirection,
  getMontain,
  getJoystics,
};
