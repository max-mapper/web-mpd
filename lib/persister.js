var urlSerializer = require('./urlSerializer')

urlSerializer.stateChanged = function (oldSamples){
  samples = oldSamples
  loadSamples()
}

var defaultSamples = require('../config/samples.json')

var persister = {
  loadSampleMap: loadSampleMap,
  persistConfig: persistConfig,
}

module.exports = persister

function loadSampleMap (cb) {

  var samples = defaultSamples
  var oldSamples = urlSerializer.loadUrlConfig() || getLocalSamples()
  if (oldSamples) {
    samples = oldSamples
  } else {
    samples = require('../config/samples')
    for (var key in samples) {
      samples[key] = 'samples/' + samples[key]
    }
  }

  if (cb) cb(null, samples)
}

function getLocalSamples(){
  var json = localStorage.getItem('samples')
  return JSON.parse(json)
}

function persistConfig(key, cb){

  if (key) {
    samples[key.code] = key.url
  }

  var json = JSON.stringify(samples)
  localStorage.setItem('samples', json)
  urlSerializer.saveUrlConfig(samples)
  if (cb) cb(null)
}

