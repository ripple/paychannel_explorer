module.exports = require('nconf').argv().env().file({
  file: __dirname + '/../config.json'
}).defaults({
  ripple: {
    host: 's1.ripple.com',
    port: 51234,
    timeout: 10000
  },
})