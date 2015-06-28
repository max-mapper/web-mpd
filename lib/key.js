var nets = require('nets')
var vkey = require('vkey')
var invert = require('./invert')
var pkey = invert(vkey)

var keyMap = require('../config/keyMap.json')

module.exports = Key

function Key (opts) {
  var self = this

  // Instance properties:
  this.raw     = opts.raw
  this.url     = opts.url
  this.name    = opts.name
  this.player  = opts.player
  this.opts    = opts
  this.loading = true
  this.buffer
  this.baudioFn
  this.code    = parseInt(pkey[this.name])
  this.el      = getElementForKey(this)

  // Instance methods:
  this.downloadAudio = downloadAudio
  this.showKeypress  = showKeypress

  this.downloadAudio(function (err) {
    if (!err){
      console.log("Audio downloaded");
    }
  })
}

function getElementForKey(key) {
  var selector = '[data-key="'+key.raw+'"]'
  return document.querySelector(selector)
}

function downloadAudio(cb){
  console.log("Downloading "+this.name);
  var self = this
  this.loading = true

  var keyEl = this.el

  if (keyEl) {
    keyEl.classList.add('loading')

    if (!this.url || !keyEl) {
      console.log("Not key to load " + this.name)
      this.loading = false
      keyEl.classList.remove('loading')
      return
    }
    nets(this.url, function(err, resp, buff) {
      if (err) return cb(err)
      console.log("Downloaded "+self.name);

      if (self.url.indexOf('studio.substack.net') !== -1) {

        try{
          var stringContent = buff.toString()
          self.baudioFn = Function(stringContent)()
          self.buffer
          self.loading = false
          keyEl.classList.remove('loading')
          cb()
        } catch (e){
          console.error(e)
          self.loading = false
          keyEl.classList.remove('loading')
          cb(err)
        }

      } else {

        buff = ensureBufferType(buff)

        self.player.context.decodeAudioData(buff.buffer, function(buffer) {
          self.buffer = buffer
          delete self.baudio
          self.loading = false
          keyEl.classList.remove('loading')
          cb()
        }, cb)
      }
    })
  }
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

function showKeypress(pressed) {
  var keyEl = this.el
  if (keyEl) {
    keyEl.classList.add('pressed')
    setTimeout(function(){
      keyEl.classList.remove('pressed')
    }, 200)
  }
}

