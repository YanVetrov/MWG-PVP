const registerWebworker = require("webworker-promise/lib/register");

registerWebworker(async (message, emit) => {
  let units = message;
  return units;
});
