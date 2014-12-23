var fs = require('fs')

var wavs = fs.readdirSync(process.cwd()).filter(function(f) { return f.toLowerCase().indexOf('wav') > -1 })
var start = +process.argv[2]
var end = +process.argv[3]

var map = {}
var keymap = {}
for (var i = start; i < end; i++) {
  var key = (i - start + 7).toString()
  keymap['144-' + i] = key
  var next = wavs.shift()
  if (next) map[key] = next
}

console.log(JSON.stringify(map, null, '  '))
