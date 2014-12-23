var WebSocketServer = require('ws').Server
var http = require('http')
var midi = require('midi-stream')
var through = require('through2')
var websocket = require('websocket-stream')
var duplexify = require('duplexify')
var server = null

var port = module.exports.port = 8343
var url = module.exports.url = 'ws://localhost:' + module.exports.port

module.exports.start = function(opts, cb) {
  if (server) {
    cb(new Error('already started'));
    return;
  }

  if (typeof opts == 'function') {
    cb = opts;
    opts = {};
  }

  server = http.createServer()
  opts.server = server

  var wss = new WebSocketServer(opts)
  
  // var duplex = midi('Akai MPD32 Port 1', 0)
  var duplex = midi('Ableton Push User Port', 0)
  var proxy = duplexify()
  
  proxy.pipe(through.obj(function(buff, enc, next) {
    var self = this
    var evt = JSON.parse(buff)
    var key1 = evt.slice(0, 2).join('-')
    var key2 = evt.slice(0, 1).join('-')
    evt[2] = colors[key1] || colors[key2]
    this.push(evt)
    setTimeout(function() {
      evt[2] = 0
      self.push(evt)
    }, 30)
    next()
  })).pipe(duplex)
  
  var colors = {}
  for (var i = 36; i < 100; i++) {
    colors['144-' + i] = scale(Math.random(), 0, 1, 0, 127)
  }
  
  duplex.on('data', function(data) {
    console.log(data)
    proxy.write(JSON.stringify(data))
    // duplex.write(data)
  })
  
  wss.on('connection', function(ws) {
    var stream = websocket(ws)
    stream.on('end', function() {
      proxy.setWritable(null)
      proxy.setReadable(null)
    })
    proxy.setWritable(stream)
    proxy.setReadable(stream)
    console.log('websocket conn')
  })
  console.log('starting server on port', port)
  server.listen(port, cb)
}

module.exports.stop = function(cb) {
  if (!server) {
    cb(new Error('not started'))
    return
  }

  server.close(cb)
  server = null
}

if (!module.parent) {
  module.exports.start(function(err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('server started on port ' + port);
  });
}

function scale( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}