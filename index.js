var ws = require('websocket-stream')
var vkey = require('vkey')
var nets = require('nets')
var parallel = require('run-parallel')
var baudio = require('webaudio')
var debounce = require('debounce')

var samples = require('./config/samples.json')
var on = require('./config/keyMap.json')
var keyNames = require('./config/keyNames')

var context = new (window.AudioContext)()

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
var baudios = {}
var activeBaudios = {}
var buffers = {}

var sampleGets = Object.keys(samples).map(function(id) {
  var url = samples[id]
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
  console.log('ready')

  var channel = baudio(playBaudio)
  channel.play()
  
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

function playBaudio(time) {
  var total = 0
  Object.keys(activeBaudios).forEach(function(id){
    var baudio = activeBaudios[id]
    total += baudio.play(time)
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

      context.decodeAudioData(buff.buffer, function(buffer) {
       
        buffers[id] = buffer
        delete baudios[id]
        cb()
      }, cb)
    }
  })
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
        resetTimeout: debounce(function(){
          console.log('timeout')
          delete activeBaudios[key]
        }, 100),
      }
      activeBaudios[key] = newActiveBaudio
      newActiveBaudio.resetTimeout()
    } else {
      var activeBaudio = activeBaudios[key]
      activeBaudio.resetTimeout()
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
