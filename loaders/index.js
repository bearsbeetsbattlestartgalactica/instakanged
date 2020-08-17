const mongooseLoader = require('./mongoose');
// const passportLoader = require('./passport');
const expressLoader = require('./express');

//this also stops someone scrolling back and viewing sensitive data that may have been logged
function clearConsoleAndScrollbackBuffer() {
  process.stdout.write('\u001b[3J\u001b[2J\u001b[1J');
  console.clear();
}

module.exports = async expressApp => {
  clearConsoleAndScrollbackBuffer();

  const mongooseDb = await mongooseLoader();
  console.log('✌️ DB loaded and connected!');

  await expressLoader(expressApp, mongooseDb);
};
