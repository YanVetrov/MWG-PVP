import {
  Application,
  Sprite,
  utils,
  Container,
  Graphics,
  filters,
} from "pixi.js";
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

app.loader.add("./assets/sheet.json").load(setup);

function setup() {
  store.id = app.loader.resources["./assets/sheet.json"].textures;
  store.gameScene = new Container();
  app.stage.addChild(store.gameScene);
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
    "Wall028.png",
    "Wall012.png",
    "Wall020.png",
    "Wall021.png",
    "Wall048.png",
    "Wall022.png",
    "Wall014.png",
    "Wall032.png",
    "Wall028.png",
    "Wall028.png",
    "Wall028.png",
    "Wall028.png",
    "Wall012.png",
    "Wall020.png",
    "Wall021.png",
    "Wall048.png",
    "Wall022.png",
    "Wall014.png",
    "Wall032.png",
    "Wall028.png",
    "Wall028.png",
    "Wall022.png",
    "Wall014.png",
    "Wall032.png",
    "Wall022.png",
    "Wall014.png",
    "Wall032.png",
    "Wall028.png",
    "Wall028.png",
    "Wall028.png",
    "Wall022.png",
    "Wall014.png",
    "Wall032.png",
    "Wall022.png",
    "Wall014.png",
    "Wall028.png",
    "Wall028.png",
    "Wall022.png",
    "Wall014.png",
    "Wall032.png",
    "Wall022.png",
    "Wall014.png",
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
  target.on("pointerdown", handler);
}
function handler(e) {
  if (!e.target.clicked) {
    e.target.alpha = 0.7;
  } else e.target.alpha = 1;
  e.target.clicked = !e.target.clicked;
  console.log(e.target);
}
