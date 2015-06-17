var ws = require('websocket-stream')
var vkey = require('vkey')
var nets = require('nets')
var async = require('async')
var baudio = require('webaudio')
var debounce = require('debounce')

var samples = require('./config/samples.json')
var on = require('./config/keyMap.json')
var keyNames = require('./config/keyNames')

var context = new (window.AudioContext || window.webkitAudioContext)()

var oldSamples = localStorage.getItem('samples')
var samples
if (oldSamples) {
  samples = JSON.parse(oldSamples)
} else {
  samples = require('./config/samples')
  for (var key in samples) {
    samples[key] = 'samples/' + samples[key]
  }
}

/*  Buffers & Baudios:
 *
 *  When a key is pressed, we check if there is a baudio
 *  function for that key in the baudios hash.
 *
 *  If there is, we'll run a baudio function for the keypress.
 * 
 *  If there isn't, we'll play any buffer from the buffers.
 */
var baudioStartTime;
var baudios = {}
var baudioStartTimes = {};
var activeBaudios = {}
var buffers = {}

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

function removeLoadingScreen(){
  var a = document.getElementById('loading-screen')
  a.remove()
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

  var channel = baudio(playBaudio)
  channel.play()
  
  function parseEvent(o) {
    var evt = JSON.parse(o)
    if (evt[2] === 0) return
    evt[2] = 127
    var pressed = evt.slice(0, 2).join('-')
    onkeydown(evt, pressed)
  }
  
  function onkeydown(evt, pressed) {
    var key = getKey(pressed)
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
    var key = getKey(pressed)
    if (!key) return
    var baudioData = activeBaudios[key]
    showKeypress(pressed)

    if (baudioData) {
      // UNPLAY BAUDIO
      delete activeBaudios[key]
    }
  }
}

function playBaudio(time) {

  if (!baudioStartTime){
    baudioStartTime = Date.now()
  }

  var total = 0
  Object.keys(activeBaudios).forEach(function(id){
    var baudio = activeBaudios[id]
    var localTime = ((baudio.started - baudioStartTime)/1000)
    total += baudio.play(time-localTime)
  })
  return total
}

function downloadAudio(id, url, cb){

  nets(url, function(err, resp, buff) {
    if (err) return cb(err)

    samples[id] = url
    persistConfig()
 
    if (url.indexOf('studio.substack.net') !== -1) {

      try{
        var stringContent = buff.toString()
        baudios[id] = Function(stringContent)()
        delete buffers[id]
        cb()
      } catch (e){
        console.error(e)
        cb(err)
      }

    } else {

      buff = ensureBufferType(buff)

      context.decodeAudioData(buff.buffer, function(buffer) {
       
        buffers[id] = buffer
        delete baudios[id]
        cb()
      }, cb)
    }
  })
}

function ensureBufferType(buff){
  if (!(buff instanceof Uint8Array)){
    buff = toArrayBuffer(buff)
  }
  return buff
}

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return view
}

// Baudio links can be converted to references to functions:
function correctBaudioLinks(url){
  if (url.indexOf('studio.substack.net') !== -1) {
    return url.split('?')[0] + '.js'
  }
  return url
}

function persistConfig(){
  var json = JSON.stringify(samples)
  localStorage.setItem('samples', json)
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
  var reqUrl = event.dataTransfer.getData('URL')
  reqUrl = correctBaudioLinks(reqUrl)
  var url = 'http://crossorigin.me/'+reqUrl
  downloadAudio(key, url, function(){})
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

function trigger(pressed, key, evt) {

  // var velocity = evt[2]
  // var velocity = null
  var buffer = buffers[key]
  var baudioFn = baudios[key]
  
  if (!pressed) return
  showKeypress(pressed)
  
  if (buffer) {
    // PLAY SAMPLE
    play(buffer)
  } else if (baudioFn) {

    // PLAY BAUDIO
    if (!activeBaudios[key]) {
      var newActiveBaudio = {
        play: baudioFn,
        started: Date.now(),
        resetTimeout: debounce(function(){
          console.log('timeout')
          delete activeBaudios[key]
        }, 100),
      }
      activeBaudios[key] = newActiveBaudio
      // newActiveBaudio.resetTimeout()
    } else {
      var activeBaudio = activeBaudios[key]
    }
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
