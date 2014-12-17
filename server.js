var WebSocketServer = require('ws').Server
var http = require('http')
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
  
  var midi = require('midi-stream')

  var duplex = midi('Akai MPD32 Port 1', 0)
  var proxy = duplexify()
  duplex.on('data', function(data) {
    console.log(data)
    proxy.write(JSON.stringify(data))
  })

  wss.on('connection', function(ws) {
    var stream = websocket(ws)
    stream.on('end', function() {
      proxy.setWritable(null)
    })
    proxy.setWritable(stream)
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