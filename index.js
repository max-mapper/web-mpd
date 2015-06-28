// External Dependencies:
var ws = require('websocket-stream')
var vkey = require('vkey')
var nets = require('nets')
var async = require('async')
var debounce = require('debounce')

// Internal Classes:
var persister = require('./lib/persister')
var player    = require('./lib/player')

player.init()

/*
// Config Files:
var on = require('./config/keyMap.json')
var keyNames = require('./config/keyNames')

/*  Buffers & Baudios:
 *
 *  When a key is pressed, we check if there is a baudio
 *  function for that key in the baudios hash.
 *
 *  If there is, we'll run a baudio function for the keypress.
 * 
 *  If there isn't, we'll play any buffer from the buffers.
var baudioStartTime;
var baudios = {}
var baudioStartTimes = {};
var activeBaudios = {}
var buffers = {}

loadSamples()

function loadSamples(){
  showLoadingScreen()
  var sampleGets = Object.keys(samples).map(function(id) {
    var url = samples[id]
    return async.retry.bind(async, 3, downloadAudio.bind(null, id, url));
  })

  async.parallel(sampleGets, function(err) {
    if (err) {
      alert("Problem loading initial samples.  Try reloading or dragging new samples onto keys.")
      return console.error(err)
    }
    removeLoadingScreen();
    connect()
  })
}

function removeLoadingScreen(){
  var a = document.getElementById('loading-screen')
  a.className = 'hidden';
}
function showLoadingScreen(){
  var a = document.getElementById('loading-screen')
  if (a) {
    a.classList.remove('hidden')
  }
}

var recorded = []
var recordBuffer, startTime, lastVal, stream
var recording = false

function connect() {
  
  window.addEventListener('keydown', function(e) {
    var pressed = vkey[e.keyCode]
    pressed = (keyNames[pressed] || pressed).toLowerCase()
    onkeydown([pressed, null, 127], pressed)
  })

  window.addEventListener('keyup', function(e) {
    var pressed = vkey[e.keyCode]
    pressed = (keyNames[pressed] || pressed).toLowerCase()
    onkeyup([pressed, null, 127], pressed)
  })

  window.addEventListener('drop', doDrop)
  window.addEventListener('dragover', dragover)
  console.log('ready')
  
  function onkeydown(evt, pressed) {
    var key = pressed
    if (!key) return

    // If recording
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

    // Normal key playback
    if (recording && buffers[pressed]) recordBuffer.push({data: evt, time: Date.now() - startTime})
    trigger(pressed, key, evt)

  }

  function onkeyup(evt, pressed) {
    if (!pressed) return
    var key = pressed
    if (!key) return
    var baudioData = activeBaudios[key]
    showKeypress(pressed)

    if (baudioData) {
      // UNPLAY BAUDIO
      delete activeBaudios[key]
    }
  }
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

function playback(start, idx) {
  var evt = recorded[idx]
  baudioStartTimes[idx] = start

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

function scale( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}
*/
