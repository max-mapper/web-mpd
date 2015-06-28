var test = require('tape')

var player = require ('../lib/player')

test('keyForEvent', function (t) {
  var ev = {
    keyCode: 65
  } // Letter 'a'
  var result = player.keyForEvent(ev)

  t.equal(result.name, 'a')
})
