var _defaultRateLimitInterval = 1000;
var _defaultRetryCount = 3;
var _defaultBackoffBaseDelay = 500;
var _throttles = [];

function throttle(fn, intervalMs) {
  var interval = typeof intervalMs === 'number' && intervalMs >= 0 ? intervalMs : _defaultRateLimitInterval;
  var lastTimestamp = 0;
  var wrapper = function() {
    var now = new Date().getTime();
    var wait = interval - (now - lastTimestamp);
    if (wait > 0) {
      Utilities.sleep(wait);
    }
    var result = fn.apply(this, arguments);
    lastTimestamp = new Date().getTime();
    return result;
  };
  wrapper._reset = function() {
    lastTimestamp = 0;
  };
  _throttles.push(wrapper);
  return wrapper;
}

function retryWithBackoff(fn, maxRetries) {
  var retries = typeof maxRetries === 'number' && maxRetries >= 0 ? maxRetries : _defaultRetryCount;
  return function() {
    var args = arguments;
    for (var i = 0; i <= retries; i++) {
      try {
        return fn.apply(this, args);
      } catch (e) {
        if (i === retries) {
          throw e;
        }
        var backoff = _defaultBackoffBaseDelay * Math.pow(2, i) + Math.floor(Math.random() * _defaultBackoffBaseDelay);
        Utilities.sleep(backoff);
      }
    }
  };
}

function reset() {
  _throttles.forEach(function(wrapper) {
    if (typeof wrapper._reset === 'function') {
      wrapper._reset();
    }
  });
}