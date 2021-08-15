import { Graphics, Container, Sprite } from "pixi.js";

function getBorder() {
  const border = new Graphics();
  border.beginFill(0x3500fa, 0);
  border.lineStyle(0.2, 0xffffff, 0.5);
  border.drawPolygon([0, 64, 127, 0, 254, 64, 129, 127]);
  border.endFill();
  border.zIndex = 1;
  return border;
}
function getCircle() {
  const circle = new Graphics();

  circle.beginFill(0xffffff, 0);
  circle.lineStyle(1, 0x99ffaa, 1);
  circle.drawCircle(50, 50, 50);
  circle.endFill();
  circle.skew.y = -0.2;
  circle.skew.x = 0.7;
  circle.scale.x = 1.5;
  circle.zIndex = 1;
  return circle;
}

const generateSpinner = obj => {
  const container = new Container();

  const base = Sprite.from("./assets/timer.png");
  const size = 100;
  base.width = size;
  base.height = size;

  const mask = new Graphics();
  mask.position.set(size / 2, size / 2);
  base.mask = mask;
  window.mask = mask;

  container.addChild(base);
  container.addChild(mask);
  obj.addChild(container);
  obj.spinner = container;

  let phase = 0;
  let count = 0;
  let interval = "";
  const maxCount = 377;
  obj.updateSpinner = delta => {
    count += delta;
    phase += delta / 60;
    phase %= Math.PI * 2;
    const angleStart = 0 - Math.PI / 2;
    const angle = phase + angleStart;
    const radius = 50;

    const x1 = Math.cos(angleStart) * radius;
    const y1 = Math.sin(angleStart) * radius;
    mask.clear();
    mask.lineStyle(2, 0xff0000, 1);
    mask.beginFill(0xff0000, 1);
    mask.moveTo(0, 0);
    mask.lineTo(x1, y1);
    mask.arc(0, 0, radius, angleStart, angle, false);
    mask.lineTo(0, 0);
    mask.endFill();
    if (count >= maxCount) {
      return true;
    }
  };
  obj.setTimer = unlockedtime => {
    if (interval) return 0;
    interval = setInterval(() => {
      // let anglePerSec = maxCount / seconds;
      let leftCount = maxCount - count;
      let leftTime = (unlockedtime - Date.now()) / 1000;
      if (leftTime <= 0) return obj.stopTimer();
      let anglePerSec = leftCount / leftTime;
      if (obj.updateSpinner(anglePerSec / 4)) {
        obj.stopTimer();
      }
    }, 250);
  };
  obj.stopTimer = () => {
    clearInterval(interval);
    interval = null;
    count = 0;
    phase = 0;
    mask.clear();
  };
};

export { getBorder, getCircle, generateSpinner };
