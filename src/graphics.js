import { Graphics } from "pixi.js";

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
  circle.lineStyle(3, 0x99ffaa, 1);
  circle.drawCircle(50, 50, 50);
  circle.endFill();
  circle.skew.y = -0.2;
  circle.skew.x = 0.7;
  circle.scale.x = 1.5;
  circle.zIndex = 1;
  return circle;
}
export { getBorder, getCircle };
