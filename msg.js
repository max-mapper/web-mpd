var midi = require('midi-stream')
var ndarray = require('ndarray')

var duplex = midi('Ableton Push User Port', 0)

duplex.on('data', function(msg) {
  console.log(msg)
  if (msg[0] === 176 && msg[1] === 102) {
    for (var i = 0; i < 100; i++) {
      duplex.write([128, i, 0])
    }
  }
  if (!msg[2]) return
  msg[2] = 77
  duplex.write(msg)
})