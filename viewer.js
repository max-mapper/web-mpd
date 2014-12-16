var Viewer = require('mesh-viewer')

module.exports = function(smooth) {
  var viewer = Viewer({
    useCellNormals: true
    , meshColor: [1, 1, 1]
    , specular: [0.3, 0.3, 0.3]
    , ambient: [0, 0, 0]
    , clearColor: [0.1, 0.1, 0.1, 1]
  })

  return viewer  
}
