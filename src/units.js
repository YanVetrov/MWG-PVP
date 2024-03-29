import { Sprite, Texture } from "pixi.js";
let base = [
  {
    id: 126335,
    name: "skunk",
    type: "battle",
    locked: false,
    unlockedTime: 0,
    inGame: false,
    image: "skunk",
    shardCode: "SHS",
    lvl: 4,
  },
  {
    id: 126336,
    name: "raccoon",
    type: "battle",
    locked: false,
    unlockedTime: 0,
    inGame: false,
    image: "raccoon",
    shardCode: "SHR",
    lvl: 3,
  },
  // {
  //   id: 126539,
  //   name: "hamster",
  //   type: "miner",
  //   locked: false,
  //   unlockedTime: 0,
  //   inGame: false,
  //   image: "hamster",
  //   shardCode: "SHH",
  //   lvl: 1,
  // },
  {
    id: 126334,
    name: "ant",
    type: "battle",
    locked: false,
    unlockedTime: 0,
    inGame: false,
    image: "ant",
    shardCode: "SHA",
    lvl: 5,
  },
  {
    id: 126341,
    name: "elephantor",
    type: "battle",
    locked: false,
    unlockedTime: 0,
    inGame: false,
    image: "elephantor",
    shardCode: "SHE",
    lvl: 2,
  },
  {
    id: 126332,
    name: "wolf",
    type: "battle",
    locked: false,
    unlockedTime: 0,
    inGame: false,
    image: "wolf",
    shardCode: "SHW",
    lvl: 6,
  },
];
const units = base.map((el, i) => {
  let sprite = Sprite.from(`./assets/cards/${el.image}/ul.png`);
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
export default units;
