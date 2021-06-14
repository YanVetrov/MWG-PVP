import { Sprite, Text } from "pixi.js";
import { gsap } from "gsap";
function createJoystic({ x = 0, y = 0, angle = 0 }, handler) {
  let joystick = Sprite.from("./assets/joistik.png");
  joystick.x = x;
  joystick.zIndex = 3;
  joystick.angle = angle;
  joystick.y = y;
  joystick.width = 100;
  joystick.height = 130;
  joystick.interactive = true;
  joystick.buttonMode = true;
  joystick.scale.y = 1 / window.devicePixelRatio;
  joystick.scale.x = 1 / window.devicePixelRatio;
  joystick.on("pointerdown", () => {
    handler();
    joystick.interval = setInterval(() => handler(), 150);
  });
  joystick.on("pointerup", () => clearInterval(joystick.interval));

  return joystick;
}
function initMap(arr, store) {
  let map = [];
  for (let i = 0; i < 40000; i++) {
    let random = Math.ceil(Math.random() * arr.length - 1);
    let name = arr[random];
    let sprite = new Sprite(store[name]);
    sprite.posX = (i % 200) + 1;
    sprite.posY = Math.floor(i / 200) + 1;
    if (i % 200 === 0) map.push([]);
    map[Math.floor(i / 200)].push(sprite);
  }
  return map;
}
function sortUnit(unit, activeUnit, zone, circle) {
  let ground = zone.find(gr => gr.posX === unit.posX && gr.posY === unit.posY);
  if (ground) {
    unit.x = ground.x + 60;
    unit.y = ground.y - 10;
    unit.alpha = 1;
    if (unit === activeUnit) {
      circle.x = ground.x + 20;
      circle.y = ground.y + 35;
    }
  } else {
    unit.alpha = 0;
    if (unit === activeUnit) circle.alpha = 0;
  }
}
function enableInteractiveMap(zone) {
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
function moveUnit(unit, ground) {
  unit.texture = unit[getDirection(unit.ground, ground)];
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
}
function moveCircle(circle, ground, duration = 0.5) {
  gsap.to(circle, {
    x: ground.x + 20,
    y: ground.y + 35,
    duration,
    ease: "back.out(1)",
  });
}
function updateText(container, textNode, text) {
  container.removeChild(textNode.text);
  textNode.text = new Text(`${text}`, { fontSize: 30, fill: 0xffffff });
  textNode.text.zIndex = 3;
  container.addChild(textNode.text);
}
function getDirection(fromPlace, toPlace) {
  if (fromPlace.x > toPlace.x && fromPlace.y == toPlace.y) return "l";
  if (fromPlace.x < toPlace.x && fromPlace.y == toPlace.y) return "r";
  if (fromPlace.y > toPlace.y && fromPlace.x == toPlace.x) return "u";
  if (fromPlace.y < toPlace.y && fromPlace.x == toPlace.x) return "d";

  if (fromPlace.x > toPlace.x && fromPlace.y > toPlace.y) return "ul";
  if (fromPlace.x < toPlace.x && fromPlace.y < toPlace.y) return "dr";
  if (fromPlace.x < toPlace.x && fromPlace.y > toPlace.y) return "ur";
  if (fromPlace.x > toPlace.x && fromPlace.y < toPlace.y) return "dl";
}
function setUnit(unit, ground) {
  unit.x = ground.x + 60;
  unit.y = ground.y - 10;
  unit.posX = ground.posX;
  unit.posY = ground.posY;
  unit.ground = ground;
  ground.unit = unit;
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
};
