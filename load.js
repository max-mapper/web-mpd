var loadSound = function(url, context, callback, err) {

  var decodeSuccess = function(buffer) {
    callback(buffer);
  };

  var decodeError = function(request) {
    return function(response) {
      try {
        throw 'Error decoding sound at `' + url + '`. This is as good as the error gets. Sorry.';
      } catch (message) {
        if (typeof err === 'function') {
          err(message, request);
        }
      }
    };
  }

  var decodeAudioData = function(e) {
    var request = e.currentTarget;
    context.decodeAudioData(request.response, decodeSuccess, decodeError(request));
  }

  var load = function(url) {
    var request = new XMLHttpRequest();

    request.open('GET', url);
    request.responseType = 'arraybuffer';
    request.onload = decodeAudioData;
    request.send();

    return request;
  };

  var request = load(url);

  return request;
};