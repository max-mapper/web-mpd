var invert = require('./invert')
var vkey = require('vkey')
var pkey = invert(vkey)
var baudio = require('webaudio')
var debounce = require('debounce')

// Config Files:
var keyMap = require('../config/keyMap.json')
var keyNames = require('../config/keyNames')
var samples = require('../config/samples.json')

// Internal modules:
var persister = require('./persister')
var Key = require('./key')

// Private variables:
var keys = {} // Map from key name to key objects
var baudioStartTime
var activeBaudios = {}

var player = {
  context:null,

  init:       init,
  keyPressed: keyPressed,
  keyUp:      keyUp,

  playBuffer: playBuffer,
  playBaudio: playBaudio,

  activeBaudios: activeBaudios,
}

module.exports = player

function init () {
  var self = this

  this.persister = persister

  this.onkeydown  = onkeydown
  this.onkeyup    = onkeyup
  this.ondragover   = ondragover
  this.ondrop     = ondrop

  this.registerListeners = registerListeners

  this.context = new (window.AudioContext || window.webkitAudioContext)()

  this.channel = baudio(playBaudio.bind(this))
  this.channel.play()

  persister.loadSampleMap(function (err, sampleMap) {
    self.sampleMap = sampleMap

    var keyVals = Object.keys(sampleMap)
    for( var keyId in sampleMap ){
      var url = sampleMap[ keyId ]

      var pressed = vkey[keyId]
      var secondCode = keyNames[pressed] || keyMap[pressed] || pressed

      keys[keyId] = new Key({
        name: pressed,
        raw: keyId,
        player: self,
        url:    url,
        //name:  keyName,
      })
    }

    self.registerListeners()
  })
}

function playBuffer (buff) {
  console.log("Playing buffer");
  var source = this.context.createBufferSource()
  var gainNode = this.context.createGain()
  source.buffer = buff
  gainNode.gain.value = 1
  source.connect(gainNode)
  gainNode.connect(this.context.destination)
  source.start(0)
}

function keyPressed (key) {
  var self = this

  if (key.buffer) {
    this.playBuffer(key.buffer)

  } else if (key.baudioFn) {
    var baudioFn = key.baudioFn

    // PLAY BAUDIO
    var newActiveBaudio = {
      play: baudioFn,
      started: Date.now(),
      resetTimeout: debounce(function(){
        console.log('timeout')
        delete activeBaudios[key.code]
      }, 100),
    }
    activeBaudios[key.code] = newActiveBaudio
  }
}

function keyUp (key) {
  var baudioData = activeBaudios[key.code]
  if (baudioData) {
    delete activeBaudios[key]
  }
}

// PlayBaudio
//
// Sums all the local "baudio" objects in the
// "activeBaudios" object, and sums them, adjusting
// for their local 'started' times.
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

function registerListeners () {
  document.addEventListener('keydown', this.onkeydown.bind(this))
  document.addEventListener('keyup',   this.onkeyup.bind(this))
  document.addEventListener('drop',    this.ondrop.bind(this))
  document.addEventListener('dragover',ondragover)
}

function ondragover(event) {
  if (event.keyCode !== this.code) return
  event.preventDefault()
  event.stopPropagation()
}

function onkeydown(event) {
 
    /*
  var key = parseEvent(event)
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
  if (recording && buffers[key]) recordBuffer.push({data: evt, time: Date.now() - startTime})
  */

  var key = keyForEvent(event)
  key.showKeypress()
  this.keyPressed(key)
}

function onkeyup (event) {
  var key = keyForEvent(event)
  this.keyUp(key)
}

function ondragover(event) {
  event.preventDefault()
  event.stopPropagation()
}

function ondrop(event) {
  var key = keyForEvent(event)

  var self = this

  event.preventDefault()
  event.stopPropagation()
  var target = event.target

  var reqUrl = event.dataTransfer.getData('URL')
  reqUrl = correctBaudioLinks(reqUrl)
  key.url = 'http://crossorigin.me/'+reqUrl

  key.downloadAudio(function (err) {
    if (err) return

    self.persister.persistConfig(key)
  })
}

function keyForEvent(event){
  var pressed = vkey[event.keyCode]
  var key = keys[pressed.toLowerCase()]
  return key
}

function parseEvent(o) {
  var pressed = vkey[e.keyCode]
  pressed = (keyNames[pressed] || pressed).toLowerCase()
  return pressed
}

// Baudio links can be converted to references to functions:
function correctBaudioLinks(url){
  if (url.indexOf('studio.substack.net') !== -1) {
    return url.split('?')[0] + '.js'
  }
  return url
}
