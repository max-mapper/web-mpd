var ws = require('websocket-stream')
var nets = require('nets')
var parallel = require('run-parallel')
var meshViewer = require('./viewer.js')
var icosphere = require('icosphere')

var context = new webkitAudioContext()

var off = {
  "129-67": '0',
  "129-69": '1',
  "129-71": '2',
  "129-72": '3',
  "129-60": '4',
  "129-62": '5',
  "129-64": '6',
  "129-65": '7',
  "128-67": '8',
  "128-69": '9',
  "128-71": '10',
  "128-72": '11',
  "128-60": '12',
  "128-62": '13',
  "128-64": '14',
  "128-65": '15'
}

var on = {
  "145-67": '0',
  "145-69": '1',
  "145-71": '2',
  "145-72": '3',
  "145-60": '4',
  "145-62": '5',
  "145-64": '6',
  "145-65": '7',
  "144-67": '8',
  "144-69": '9',
  "144-71": '10',
  "144-72": '11',
  "144-60": '12',
  "144-62": '13',
  "144-64": '14',
  "144-65": '15'
}

var samples = {
  "0": "Hat005.wav",
  "1": "Shaker10.wav",
  "2": "Vintage Rave Stab 51.wav",
  "3": "ab synth stab 02 lo long.wav",
  "4": "Kick314.wav",
  "5": "Snare207.wav",
  "6": "Vintage Rave Stab 95.wav",
  "7": "sb synth stab.wav"
}

var buffers = {}

var sampleGets = Object.keys(samples).map(function(k) {
  return function(cb) {
    nets('/samples/' + samples[k], function(err, resp, buff) {
      if (err) return cb(err)
  		context.decodeAudioData(buff.buffer, function(buffer) {
        buffers[k] = buffer
        cb()
  		}, cb)
    })
  }
})

parallel(sampleGets, function(err) {
  if (err) return console.error(err)
  console.log('loaded samples')
  connect()
})

function play(buff, gain) {
  var source = context.createBufferSource()
  var gainNode = context.createGain()
  source.buffer = buff
  gainNode.gain.value = gain || 1
  source.connect(gainNode)
  gainNode.connect(context.destination)
  source.start(0)
}

function connect() {
  var stream = ws('ws://localhost:8343')
  var viewer = meshViewer()
  var mesh, lastVal, cam

  viewer.on('viewer-init', function() {
    mesh = viewer.createMesh(icosphere(1.1))
    viewer.camera.distance = 3
  })

  viewer.on('gl-render', function() {
    if (cam) {
      viewer.camera.distance = cam
      cam = undefined
    }

    mesh.draw({
      lightPosition: [
          Math.cos(lastVal) * lastVal * 3
        , Math.sin(lastVal) * lastVal * 3
        , -2
      ]
    })
  })
  
  window.viewer = viewer
  
  stream.on('data', function(o) {
    var evt = JSON.parse(o)
    var pressed = evt.slice(0, 2).join('-')
    var onKey = on[pressed]
    var offKey = off[pressed]
    var velocity = evt[2]
    var key = onKey || offKey
    if (!key) return
    var buffer = buffers[key]
    if (!buffer) return
    if (velocity) velocity = scale(velocity, 0, 127, 0, 1)
    lastVal = evt[1] + Math.random() * 10
    cam = lastVal - 59
    if (onKey) play(buffer, velocity)
  })
}

function scale( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}