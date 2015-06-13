var ws = require('websocket-stream')
var vkey = require('vkey')
var nets = require('nets')
var parallel = require('run-parallel')

var samples = require('./config/samples.json')
var on = require('./config/keyMap.json')
var keyNames = require('./config/keyNames')

var context = new (window.AudioContext)()

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

var sampleGets = Object.keys(samples).map(function(id) {
  var url = 'samples/' + samples[id]
  return downloadAudio.bind(null, id, url)
})

parallel(sampleGets, function(err) {
  if (err) return console.error(err)
  connect()
})

var recorded = []
var recordBuffer, startTime, lastVal, stream
var recording = false

function connect() {
  
  window.addEventListener('keydown', function(e) {
    var pressed = vkey[e.keyCode]
    pressed = (keyNames[pressed] || pressed).toLowerCase()
    dispatch([pressed, null, 127], pressed)
  })

  document.documentElement.addEventListener('drop', doDrop)
  document.documentElement.addEventListener('dragover', dragover)
  
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
    if (recording && buffers[pressed]) recordBuffer.push({data: evt, time: Date.now() - startTime})
    trigger(pressed, key, evt)
  }
}

function downloadAudio(id, url, cb){
  nets(url, function(err, resp, buff) {
    if (err) return cb(err)
    context.decodeAudioData(buff.buffer, function(buffer) {
      buffers[id] = buffer
      cb()
    }, cb)
  })
}

function play(buff, gain) {
  var source = context.createBufferSource()
  var gainNode = context.createGain()
  source.buffer = buff
  gainNode.gain.value = gain || 1
  source.connect(gainNode)
  gainNode.connect(context.destination)
  source.start(0)
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

function dragover(event) {
  event.preventDefault()
  event.stopPropagation()
}
function doDrop(event) {
  event.preventDefault()
  event.stopPropagation()
  var target = event.target
  if (!target.classList.contains('keyboard-key')) return
  var key = target.getAttribute('data-key')
  var url = 'http://crossorigin.me/'+event.dataTransfer.getData('URL')
  downloadAudio(key, url, function(){})
}

function playback(start, idx) {
  var evt = recorded[idx]
  if (!evt && recorded.length) {
    startTime = Date.now()
    return playback(startTime, 0)
  }
  if (!evt) return
  var current = Date.now() - start
  var time = evt.time - current
  setTimeout(function() {
    var pressed = evt.data[0]
    trigger(pressed, pressed, evt.data)
    idx++
    playback(start, idx)
  }, time)
}

function trigger(pressed, key, evt) {
  // var velocity = evt[2]
  var velocity = null
  var buffer = buffers[key]
  if (!buffer) return
  if (velocity) {
    var velocityRange = Math.floor(velocity / 16)
    velocity = scale(velocity, 0, 127, 0, 1)
    buffer = buffers[key + '-' + velocityRange] || buffer
  }
  lastVal = evt[2] * Math.random() * 10
  if (pressed) {
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
  return pressed
}

function scale( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}
