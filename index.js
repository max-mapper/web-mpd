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
  "144-65": '15',
  "176-119": 'record',
  "176-115": 'record',
  "146-48": '16',
  "146-49": '17',
  "146-50": '18',
  "146-51": '19',
  "146-44": '20',
  "146-45": '21',
  "146-46": '22',
  "146-47": '23',
  "146-40": '24',
  "146-41": '25',
  "146-42": '26',
  "146-43": '27',
  "146-36": '28',
  "146-37": '29',
  "146-38": '30',
  "146-39": '31'
}

var samples = {
  "0": "Hat005.wav",
  "1": "Shaker10.wav",
  "2": "Vintage-Rave-Stab-51.wav",
  "3": "ab-synth-stab-02-lo-long.wav",
  "4": "Kick314.wav",
  "5": "Snare207.wav",
  // "6": "Vintage-Rave-Stab-95.wav",
  // "7": "sb-synth-stab.wav",
  "8": "trap-2/loop_5_full_140.wav",
  "9": "trap-2/trap_bass_Gminor_140.wav",
  "10": "trap-2/trap_bleeps7_140_loop3_Amin.wav",
  "11": "trap-2/trap_effects_orchestral_slur_riser_c.wav",
  "12": "trap-2/trap_horns_loops_2_fminor_140.wav",
  "13": "trap-2/trap_loops_clowny_f.wav",
  "14": "trap-2/trap_orchestral_c_minor_brass_140.wav",
  "15": "trap-2/trap_siren_4.wav",
  "6": "trap-2/trap_snare_roll_1_140.wav",
  "7": "trap-2/trap_synths_harsh_pars_F_140.wav",
  // "8": "bb14x6-snare/TMKD_SNARE1_BB14x6_L1_01.wav",
  // "8-1": "bb14x6-snare/TMKD_SNARE1_BB14x6_L1_01.wav",
  // "8-2": "bb14x6-snare/TMKD_SNARE1_BB14x6_L2_01.wav",
  // "8-3": "bb14x6-snare/TMKD_SNARE1_BB14x6_L3_01.wav",
  // "8-4": "bb14x6-snare/TMKD_SNARE1_BB14x6_L4_01.wav",
  // "8-5": "bb14x6-snare/TMKD_SNARE1_BB14x6_L5_01.wav",
  // "8-6": "bb14x6-snare/TMKD_SNARE1_BB14x6_L6_01.wav",
  // "8-7": "bb14x6-snare/TMKD_SNARE1_BB14x6_L7_01.wav",
  // "8-8": "bb14x6-snare/TMKD_SNARE1_BB14x6_L8_01.wav",
  // "9": "bb14x6-snare/TMKD_SNARE1_BB14x6_L1_01.wav",
  // "9-1": "bb14x6-snare/TMKD_SNARE1_BB14x6_L1_01.wav",
  // "9-2": "bb14x6-snare/TMKD_SNARE1_BB14x6_L2_01.wav",
  // "9-3": "bb14x6-snare/TMKD_SNARE1_BB14x6_L3_01.wav",
  // "9-4": "bb14x6-snare/TMKD_SNARE1_BB14x6_L4_01.wav",
  // "9-5": "bb14x6-snare/TMKD_SNARE1_BB14x6_L5_01.wav",
  // "9-6": "bb14x6-snare/TMKD_SNARE1_BB14x6_L6_01.wav",
  // "9-7": "bb14x6-snare/TMKD_SNARE1_BB14x6_L7_01.wav",
  // "9-8": "bb14x6-snare/TMKD_SNARE1_BB14x6_L8_01.wav",
  // "12": "inferno-kick/01.wav",
  // "12-1": "inferno-kick/01.wav",
  // "12-2": "inferno-kick/02.wav",
  // "12-3": "inferno-kick/03.wav",
  // "12-4": "inferno-kick/04.wav",
  // "12-5": "inferno-kick/05.wav",
  // "12-6": "inferno-kick/06.wav",
  // "12-7": "inferno-kick/01.wav",
  // "12-8": "inferno-kick/02.wav",
  // "13": "inferno-kick/01.wav",
  // "13-1": "inferno-kick/01.wav",
  // "13-2": "inferno-kick/02.wav",
  // "13-3": "inferno-kick/03.wav",
  // "13-4": "inferno-kick/04.wav",
  // "13-5": "inferno-kick/05.wav",
  // "13-6": "inferno-kick/06.wav",
  // "13-7": "inferno-kick/01.wav",
  // "13-8": "inferno-kick/02.wav",
  // "10": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Closed-22.wav",
  // "10-1": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Closed-01.wav",
  // "10-2": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Closed-04.wav",
  // "10-3": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Closed-07.wav",
  // "10-4": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Closed-10.wav",
  // "10-5": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Closed-14.wav",
  // "10-6": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Closed-17.wav",
  // "10-7": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Closed-20.wav",
  // "10-8": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Closed-22.wav",
  // "14": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Open-14.wav",
  // "14-1": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_SemiOpen-01.wav",
  // "14-2": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_SemiOpen-07.wav",
  // "14-3": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_SemiOpen-10.wav",
  // "14-4": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_SemiOpen-14.wav",
  // "14-5": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Open-01.wav",
  // "14-6": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Open-07.wav",
  // "14-7": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Open-10.wav",
  // "14-8": "Istanbul-Radiant-14-Hihat/Istanbul_Radiant_14_Hihat_Open-14.wav",
  // "11": "Masterwork-RockMaster-18-Crash/Masterwork_RockMaster_18_Crash-11.wav",
  // "11-1": "Masterwork-RockMaster-18-Crash/Masterwork_RockMaster_18_Crash-01.wav",
  // "11-2": "Masterwork-RockMaster-18-Crash/Masterwork_RockMaster_18_Crash-03.wav",
  // "11-3": "Masterwork-RockMaster-18-Crash/Masterwork_RockMaster_18_Crash-05.wav",
  // "11-4": "Masterwork-RockMaster-18-Crash/Masterwork_RockMaster_18_Crash-06.wav",
  // "11-5": "Masterwork-RockMaster-18-Crash/Masterwork_RockMaster_18_Crash-07.wav",
  // "11-6": "Masterwork-RockMaster-18-Crash/Masterwork_RockMaster_18_Crash-09.wav",
  // "11-7": "Masterwork-RockMaster-18-Crash/Masterwork_RockMaster_18_Crash-10.wav",
  // "11-8": "Masterwork-RockMaster-18-Crash/Masterwork_RockMaster_18_Crash-11.wav",
  // "19": "STOMP-CLAPS/clap-01.wav",
  // "19-1": "STOMP-CLAPS/clap-01.wav",
  // "19-2": "STOMP-CLAPS/clap-02.wav",
  // "19-3": "STOMP-CLAPS/clap-03.wav",
  // "19-4": "STOMP-CLAPS/clap-04.wav",
  // "19-5": "STOMP-CLAPS/clap-05.wav",
  // "19-6": "STOMP-CLAPS/clap-06.wav",
  // "19-7": "STOMP-CLAPS/clap-07.wav",
  // "19-8": "STOMP-CLAPS/clap-07.wav",
  // "18": "STOMP-CLAPS/stomp-02.wav",
  // "18-1": "STOMP-CLAPS/stomp-02.wav",
  // "18-2": "STOMP-CLAPS/stomp-03.wav",
  // "18-3": "STOMP-CLAPS/stomp-04.wav",
  // "18-4": "STOMP-CLAPS/stomp-05.wav",
  // "18-5": "STOMP-CLAPS/stomp-06.wav",
  // "18-6": "STOMP-CLAPS/stomp-07.wav",
  // "18-7": "STOMP-CLAPS/stomp-08.wav",
  // "18-8": "STOMP-CLAPS/stomp-09.wav",
  // "16": "Koan-Snare/05.wav",
  // "17": "Koan-Snare/06.wav",
  // "20": "Koan-Snare/01.wav",
  // "21": "Koan-Snare/02.wav",
  // "22": "Koan-Snare/03.wav",
  // "23": "Koan-Snare/04.wav"
  "16": "trap-1/SOT_ChoppedLoop_10_140bpm.wav",
  "17": "trap-1/SOT_ChoppedLoop_2_140bpm.wav",
  "18": "trap-1/SOT_FullDrumLoop_5_140bpm.wav",
  "19": "trap-1/SOT_KickLoop_3_140bpm.wav",
  "20": "trap-1/SOT_Music_Loop_9__140_Gm.wav",
  "21": "trap-1/SOT_SynthLoop_14_G_140bpm.wav",
  "22": "trap-1/SOT_SynthLoop_1_G_140bpm.wav",
  "23": "trap-1/SOT_SynthLoop_20_G_140bpm.wav",
  "24": "trap-1/SOT_SynthLoop_6_G_140bpm.wav",
  "25": "trap-1/SOT_Vocal_2_140bpm.wav"
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

var recorded = []
var recordBuffer, startTime, lastVal
var recording = false

function connect() {
  var stream = ws('ws://localhost:8343')

  var viewer = meshViewer()
  var mesh, cam

  viewer.on('viewer-init', function() {
    var ico = icosphere(1.1)
    mesh = viewer.createMesh(ico)
    viewer.camera.distance = 3
  })

  viewer.on('gl-render', function() {
    if (cam) {
      viewer.camera.distance = cam
      cam = undefined
    }
    mesh.draw({
      lightPosition: [
          Math.cos(lastVal)
        , Math.sin(lastVal)
        , -2
      ]
    })
  })

  stream.on('data', function(o) {
    var evt = JSON.parse(o)
    var pressed = evt.slice(0, 2).join('-')
    var key = getKey(pressed)
    if (!key) return
    if (key === 'record') {
      if (recording) {
        if (recordBuffer.length) storeRecording(recordBuffer)
        console.log('stop recording')
        recording = false
        playback(Date.now(), 0)
      } else {
        startRecording()
      }
      return
    }
    if (recording && on[pressed]) recordBuffer.push({data: evt, time: Date.now() - startTime})
    trigger(pressed, key, evt)
  })
}

function startRecording() {
  recording = true
  recordBuffer = []
  startTime = Date.now()
  console.log('start recording')
}

function storeRecording(buffer) {
  recorded = recorded.concat(buffer)
  recorded.sort(function(a,b) { return a.time - b.time })
}

function playback(start, idx) {
  var evt = recorded[idx]
  if (!evt && recorded.length) return playback(Date.now(), 0)
  var current = Date.now() - start
  var time = evt.time - current
  setTimeout(function() {
    var pressed = evt.data.slice(0, 2).join('-')
    var key = getKey(pressed)
    if (key) trigger(pressed, key, evt.data)
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
  lastVal = evt[1] * 10
  if (on[pressed]) {
    play(buffer, velocity)
    cam = lastVal - 60
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