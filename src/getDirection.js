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
export default getDirection;
