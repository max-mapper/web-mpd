var qs = require('querystring')

module.exports = {
  loadUrlConfig: loadUrlConfig,
  saveUrlConfig: saveUrlConfig,
};

window.addEventListener('popstate', statePopped)

function loadUrlConfig () {
  var query = getUrlHalves()[1];
  if (!query) return
  query = qs.parse(query)
  if (query.kit) {
    var val
    try {
      val = JSON.parse(query.kit)
    } catch (e) {}
    return val;
  }
}

function saveUrlConfig (config) {
  var string = JSON.stringify(config)
  var urlEncoded = encodeURIComponent(string)
  var mainUrl = getUrlHalves()[0]

  var newQueryString = '?kit=' + urlEncoded
  history.pushState(config, 'web mpd', mainUrl + newQueryString);
}

// Returns the current URL split between main URL and queryString
function getUrlHalves(){
  var url = window.location.href
  return url.split('?') 
}

// Called when user presses back, receives config object.
function statePopped (ev) {
//  debugger;
}
