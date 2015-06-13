var ws = require('websocket-stream')
var vkey = require('vkey')
var nets = require('nets')
var parallel = require('run-parallel')
// var grid = require('splash-grid')

var context = new (window.webkitAudioContext || window.AudioContext)()

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
  '<space>': 'record',
}

var samples = {
  'z':  '808/808-Clap07.wav',
  'x':  '808/808-Cowbell2.wav',
  'c':  '808/hihat.wav',
  'v':  '808/808-Kicks33.wav',
  'a':  '808/808-Conga1.wav',
  's':  '808/808-Snare25.wav',
  'd':  '808/808-Tom3.wav',
  'f':  'windows/Windows XP Balloon.wav',
  'q':  'windows/Windows XP Battery Critical.wav',
  'w':  'windows/Windows XP Battery Low.wav',
  'e': 'windows/Windows XP Critical Stop.wav',
  'r': 'windows/Windows XP Default.wav',
  'b': 'windows/Windows XP Ding.wav',
  'n': 'windows/Windows XP Error.wav',
  'm': 'windows/Windows XP Exclamation.wav',
  'g': 'windows/Windows XP Hardware Fail.wav',
  'h': 'windows/Windows XP Hardware Insert.wav',
  'j': 'windows/Windows XP Hardware Remove.wav',
  't': 'windows/Windows XP Information Bar.wav',
  'y': 'windows/Windows XP Logoff Sound.wav',
  'u': 'windows/Windows XP Logon Sound.wav',
  '5': 'windows/Windows XP Menu Command.wav',
  '6': 'windows/Windows XP Notify.wav',
  '7': 'windows/Windows XP Print complete.wav',
  '1': 'windows/Windows XP Recycle.wav',
  '2': 'windows/Windows XP Ringin.wav',
  '3': 'windows/Windows XP Ringout.wav',
  '4': 'windows/Windows XP Shutdown.wav',
  '8': 'windows/Windows XP Start.wav',
  '9': 'windows/Windows XP Startup.wav',
  '0': 'windows/classic chimes.wav',
  'i': 'windows/classic chord.wav',
  'o': 'windows/classic ding.wav',
  '[': 'windows/classic notify.wav',
  'k': 'windows/classic recycle.wav',
  'l': 'windows/classic start.wav',
  'p': 'windows/classic tada.wav',
  'backtick': 'windows/windows xp pop-up blocked.wav',
  'comma':  '808/808-Clap07.wav',
  'period':  '808/808-Cowbell2.wav',
  'forwardslash':  '808/hihat.wav',
  'semicolon':  '808/808-Kicks33.wav',
  'quote':  '808/808-Conga1.wav',
  'openbracket':  '808/808-Snare25.wav',
  'closebracket':  '808/808-Tom3.wav',
  'backslash':  '808/hihat.wav',
  'minus':  '808/808-Kicks33.wav',
  'equals':  '808/808-Conga1.wav',
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
