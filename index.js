var ws = require('websocket-stream')
var vkey = require('vkey')
var nets = require('nets')
var parallel = require('run-parallel')
// var grid = require('splash-grid')

var context = new (window.webkitAudioContext || window.AudioContext)()
// var canvas = document.createElement('canvas')
//
// document.body.appendChild(canvas)
// grid(canvas)
//

//var h1 = document.createElement('h1')
//document.body.appendChild(h1)
//h1.setAttribute('style', 'font-size: 500px; font-family: Helvetica; margin: 0; padding: 0; color: #FF851B;')

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

var on = require('./keyMap.json');

var samples = {
  "0":  "808/808-Clap07.wav",
  "1":  "808/808-Cowbell2.wav",
  "2":  "808/hihat.wav",
  "3":  "808/808-Kicks33.wav",
  "4":  "808/808-Conga1.wav",
  "5":  "808/808-Snare25.wav",
  "6":  "808/808-Tom3.wav",
  "7":  "windows/Windows XP Balloon.wav",
  "8":  "windows/Windows XP Battery Critical.wav",
  "9":  "windows/Windows XP Battery Low.wav",
  "10": "windows/Windows XP Critical Stop.wav",
  "11": "windows/Windows XP Default.wav",
  "12": "windows/Windows XP Ding.wav",
  "13": "windows/Windows XP Error.wav",
  "14": "windows/Windows XP Exclamation.wav",
  "15": "windows/Windows XP Hardware Fail.wav",
  "16": "windows/Windows XP Hardware Insert.wav",
  "17": "windows/Windows XP Hardware Remove.wav",
  "18": "windows/Windows XP Information Bar.wav",
  "19": "windows/Windows XP Logoff Sound.wav",
  "20": "windows/Windows XP Logon Sound.wav",
  "21": "windows/Windows XP Menu Command.wav",
  "22": "windows/Windows XP Notify.wav",
  "23": "windows/Windows XP Print complete.wav",
  "24": "windows/Windows XP Recycle.wav",
  "25": "windows/Windows XP Ringin.wav",
  "26": "windows/Windows XP Ringout.wav",
  "27": "windows/Windows XP Shutdown.wav",
  "28": "windows/Windows XP Start.wav",
  "29": "windows/Windows XP Startup.wav",
  "30": "windows/classic chimes.wav",
  "31": "windows/classic chord.wav",
  "32": "windows/classic ding.wav",
  "33": "windows/classic notify.wav",
  "34": "windows/classic recycle.wav",
  "35": "windows/classic start.wav",
  "36": "windows/classic tada.wav",
  "37": "windows/windows xp pop-up blocked.wav",
    /*
  "38": "GB_Kit/GB_Crash.wav",
  "39": "GB_Kit/GB_Hat_1.wav",
  "40": "GB_Kit/GB_Hat_2.wav",
  "41": "GB_Kit/GB_Hat_3.wav",
  "42": "GB_Kit/GB_Hat_4.wav",
  "43": "GB_Kit/GB_High_Tom.wav",
  "44": "GB_Kit/GB_Kick_1.wav",
  "45": "GB_Kit/GB_Kick_2.wav",
  "46": "GB_Kit/GB_Kick_3.wav",
  "47": "GB_Kit/GB_Kick_4.wav",
  "48": "GB_Kit/GB_Kick_5.wav",
  "49": "GB_Kit/GB_Low_Tom.wav",
  "50": "GB_Kit/GB_Mid_Tom.wav",
  "51": "GB_Kit/GB_Ride.wav",
  "52": "GB_Kit/GB_Snare_1.wav",
  "53": "GB_Kit/GB_Snare_2.wav",
  "54": "GB_Kit/GB_Snare_3.wav",
  "55": "GB_Kit/GB_Snare_4.wav",
  "56": "GB_Kit/GB_Snare_5.wav",
  "57": "GB_Kit/GB_Snare_6.wav",
  "58": "GB_Kit/GB_Snare_7.wav",
  "59": "GB_Kit/GB_Snare_8.wav",
  "60": "GB_Kit/GB_Startup.wav",
  "61": "GB_Kit/GB_Triangle.wav"

}
//
//
// var samples = {
//   "0": "stabs/5601 BUZ+RAV.wav",
//   "1": "stabs/5602 BUZ+RAV.wav",
//   "2": "stabs/5603 BUZ+RAV.wav",
//   "3": "stabs/5604 BUZ+RAV.wav",
//   "4": "stabs/5605 BUZ+RAV.wav",
//   "5": "stabs/5606 BUZ+RAV.wav",
//   "6": "stabs/5607 BUZ+RAV.wav",
//   "7": "stabs/5608 BUZ+RAV.wav",
//   "8": "stabs/5609 BUZ+RAV.wav",
//   "9": "stabs/5610 BUZ+RAV.wav",
//   "10": "stabs/5611 BUZ+RAV.wav",
//   "11": "stabs/5612 BUZ+RAV.wav",
//   "12": "stabs/5701 BUZ.CHD.wav",
//   "13": "stabs/5702 BUZ.CHD.wav",
//   "14": "stabs/5703 BUZ.CHD.wav",
//   "15": "stabs/5704 BUZ.CHD.wav",
//   "16": "stabs/5705 BUZ.CHD.wav",
//   "17": "stabs/5706 BUZ.CHD.wav",
//   "18": "stabs/5707 BUZ.CHD.wav",
//   "19": "stabs/5708 BUZ.CHD.wav",
//   "20": "stabs/5709 BUZ.CHD.wav",
//   "21": "stabs/5710 BUZ.CHD.wav",
//   "22": "stabs/5711 BUZ.CHD.wav",
//   "23": "stabs/5712 BUZ.CHD.wav",
//   "24": "stabs/5801 BUZ+BLP.wav",
//   "25": "stabs/5802 BUZ+BLP.wav",
//   "26": "stabs/5803 BUZ+BLP.wav",
//   "27": "stabs/5804 BUZ+BLP.wav",
//   "28": "stabs/5805 BUZ+BLP.wav",
//   "29": "stabs/5806 BUZ+BLP.wav",
//   "30": "stabs/5807 BUZ+BLP.wav",
//   "31": "stabs/5808 BUZ+BLP.wav",
//   "32": "stabs/5809 BUZ+BLP.wav",
//   "33": "stabs/5810 BUZ+BLP.wav",
//   "34": "stabs/5811 BUZ+BLP.wav",
//   "35": "stabs/Hoover 02.wav",
//   "36": "stabs/Hoover 03.wav",
//   "37": "stabs/Hoover 04.wav",
//   "38": "stabs/Hoover 05.wav",
//   "39": "stabs/Hoover 06.wav",
//   "40": "stabs/Hoover 07.wav",
//   "41": "stabs/Hoover 08.wav",
//   "42": "stabs/Stab 1.WAV",
//   "43": "stabs/Stab 2.WAV",
//   "44": "stabs/Stab 3.WAV",
//   "45": "stabs/Stab 4.wav",
//   "46": "stabs/Stab 5.wav",
//   "47": "stabs/Stab 6.wav",
//   "48": "stabs/Stab 7.wav",
//   "49": "stabs/anastastab.wav",
//   "50": "stabs/cyclnpno.wav",
//   "51": "stabs/letthebasskick.wav",
//   "52": "stabs/old skool bizz 00.wav",
//   "53": "stabs/old skool bizz 01.wav",
//   "54": "stabs/old skool bizz 02.wav",
//   "55": "stabs/old skool bizz 03.wav",
//   "56": "stabs/old skool bizz 04.wav",
//   "57": "stabs/old skool bizz 05.wav",
//   "58": "stabs/old skool bizz 06.wav",
//   "59": "stabs/old skool bizz 07.wav",
//   "60": "stabs/old skool bizz 08.wav",
//   "61": "stabs/old skool bizz 09.wav",
//   "62": "stabs/old skool bizz 10.wav"
//   */
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
