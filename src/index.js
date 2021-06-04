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
import { PixiPlugin } from "gsap/PixiPlugin.js";
import { MotionPathPlugin } from "gsap/MotionPathPlugin.js";
gsap.registerPlugin(PixiPlugin, MotionPathPlugin);
const graphics = new Graphics();
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
};
app.renderer.backgroundColor = "0x202020";
app.renderer.autoResize = true;
let unit = Sprite.from("./assets/ant_ul.png");
["u", "d", "r", "l", "ur", "ul", "dl", "dr"].forEach(
  (el) => (unit[el] = Texture.from(`./assets/ant_${el}.png`))
);
unit.x = 560;
unit.y = 340;
unit.width = 150;
unit.height = 150;
app.loader.add("./assets/sheet.json").load(setup);
function setup() {
  store.id = app.loader.resources["./assets/sheet.json"].textures;
  store.gameScene = new Container();
  app.stage.addChild(store.gameScene);
  graphics.beginFill(0x3500fa, 0);
  graphics.lineStyle(1, 0xffffff, 0.5);
  graphics.drawPolygon([0, 64, 127, 0, 254, 64, 129, 127]);
  graphics.endFill();
  app.stage.addChild(graphics);
  app.stage.addChild(unit);
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
  arr.forEach((el, i) => {
    let sprite = new Sprite(store.id[el]);
    addSprite(sprite, i);
  });
}

function addSprite(target, i) {
  let multipler = (target.height - 2) * Math.ceil(i / 10) - 1;
  i = i % 10;
  target.x = (i * (target.width - 2)) / 2 - 250;
  target.y = (i * (target.height - 2)) / 2 - 250 + multipler;
  target.interactive = true;
  target.buttonMode = true;
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
    if (unit.pos) {
      if (unit.pos.x > e.target.x && unit.pos.y == e.target.y)
        unit.texture = unit.l;
      if (unit.pos.x < e.target.x && unit.pos.y == e.target.y)
        unit.texture = unit.r;
      if (unit.pos.y > e.target.y && unit.pos.x == e.target.x)
        unit.texture = unit.u;
      if (unit.pos.y < e.target.y && unit.pos.x == e.target.x)
        unit.texture = unit.d;

      if (unit.pos.x > e.target.x && unit.pos.y > e.target.y)
        unit.texture = unit.ul;
      if (unit.pos.x < e.target.x && unit.pos.y < e.target.y)
        unit.texture = unit.dr;
      if (unit.pos.x < e.target.x && unit.pos.y > e.target.y)
        unit.texture = unit.ur;
      if (unit.pos.x > e.target.x && unit.pos.y < e.target.y)
        unit.texture = unit.dl;
    }
    unit.pos = { x: e.target.x, y: e.target.y };
    gsap.to(unit, {
      x: e.target.x + 50,
      y: e.target.y - 40,
      duration: 0.5,
      ease: "back.out(1)",
    });
  });
  target.hitArea = new Polygon([0, 64, 127, 0, 254, 64, 129, 127]);
}
