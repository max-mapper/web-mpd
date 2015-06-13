var ws = require('websocket-stream')
var vkey = require('vkey')
var nets = require('nets')
var parallel = require('run-parallel')

// Default sample map:
var samples = require('./keyMap.json');

// var grid = require('splash-grid')

var context = new (window.AudioContext)()

var keyNames = {
  '`': 'backtick',
  ',': 'comma',
  '.': 'period',
  '/': 'forwardslash',
  ';': 'semicolon',
  '\'': 'quote',
  '[': 'openbracket',
  ']': 'closebracket',
  '\\': 'backslash',
  '-': 'minus',
  '=': 'equals',
}

var off = {
  // "129-67": '0',
  // "129-69": '1',
  // "129-71": '2',
  // "129-72": '3',
  // "129-60": '4',
  // "129-62": '5',
  // "129-64": '6',
  // "129-65": '7',
  // "128-67": '8',
  // "128-69": '9',
  // "128-71": '10',
  // "128-72": '11',
  // "128-60": '12',
  // "128-62": '13',
  // "128-64": '14',
  // "128-65": '15'
}


var buffers = {}

var sampleGets = Object.keys(samples).map(function(k) {
  return function(cb) {
    nets('samples/' + samples[k], function(err, resp, buff) {
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

var recorded = []
var recordBuffer, startTime, lastVal, stream
var recording = false

function connect() {
  // stream = ws('ws://localhost:8343')
  
  window.addEventListener('keydown', function(e) {
    var pressed = vkey[e.keyCode]
    pressed = keyNames[pressed] || pressed
    dispatch([pressed, null, 127], pressed)
  })

  // stream.on('data', parseEvent)
  
  function parseEvent(o) {
    var evt = JSON.parse(o)
    if (evt[2] === 0) return
    evt[2] = 127
    var pressed = evt.slice(0, 2).join('-')
    dispatch(evt, pressed)
  }
  
  function dispatch(evt, pressed) {
    var key = getKey(pressed)
    if (!key) return
    if (key === 'record') {
      if (recording) {
        var firstStop = recorded.length === 0
        if (recordBuffer.length) storeRecording(recordBuffer)
        recording = false
        if (firstStop) {
          startTime = Date.now()
          playback(startTime, 0)
        }
      } else {
        startRecording()
      }
      return
    }
    if (recording && on[pressed]) recordBuffer.push({data: evt, time: Date.now() - startTime})
    trigger(pressed, key, evt)
  }
}

function startRecording() {
  recording = true
  if (!startTime) startTime = Date.now()
  recordBuffer = []
}

function storeRecording(buffer) {
  recorded = recorded.concat(buffer)
  recorded.sort(function(a, b) {
    return a.time - b.time
  })
}

function playback(start, idx) {
  var evt = recorded[idx]
  if (!evt && recorded.length) {
    startTime = Date.now()
    return playback(startTime, 0)
  }
  var current = Date.now() - start
  var time = evt.time - current
  setTimeout(function() {
    var pressed1 = evt.data.slice(0, 2).join('-')
    var pressed2 = evt.data.slice(0, 1).join('-')
    var key = getKey(pressed1)
    if (key) {
      trigger(pressed1, key, evt.data)
    } else {
      key = getKey(pressed2)
      if (key) trigger(pressed2, key, evt.data)
    }
    idx++
    playback(start, idx)
  }, time)
}

function trigger(pressed, key, evt) {
  var velocity = evt[2]
  var buffer = buffers[key]
  if (!buffer) return
  if (velocity) {
    var velocityRange = Math.floor(velocity / 16)
    velocity = scale(velocity, 0, 127, 0, 1)
    buffer = buffers[key + '-' + velocityRange] || buffer
  }
  lastVal = evt[2] * Math.random() * 10
  if (on[pressed]) {
    showKeypress(pressed)
    play(buffer, velocity)
  }
}

function showKeypress(pressed) {
  var keyEl = document.querySelector('li[data-key="'+pressed.toLowerCase()+'"]')
  if (keyEl) {
    keyEl.classList.add('pressed')
    setTimeout(function(){
      keyEl.classList.remove('pressed')
    }, 200)
  }
}

function getKey(pressed) {
  var onKey = on[pressed]
  var offKey = off[pressed]
  var key = onKey || offKey
  return key
}

function scale( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}
