const BigNumber = require('bignumber.js');

module.exports = (a, b = 0) => {
  return new BigNumber(a)
    .minus(b)
    .dividedBy(1000000)
    .toString()
};