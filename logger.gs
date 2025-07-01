var AppLogger = (function(){
  var LEVELS = { 'ERROR': 0, 'WARN': 1, 'INFO': 2, 'DEBUG': 3 };
  var DEFAULT_LEVEL = 'INFO';
  var scriptProperties = PropertiesService.getScriptProperties();
  var configuredLevel = scriptProperties.getProperty('LOG_LEVEL') || DEFAULT_LEVEL;
  var currentLevel = LEVELS[configuredLevel] !== undefined ? LEVELS[configuredLevel] : LEVELS[DEFAULT_LEVEL];

  function setLevel(levelName) {
    if (LEVELS[levelName] !== undefined) {
      currentLevel = LEVELS[levelName];
    } else {
      Logger.log(formatMessage('WARN', 'Attempted to set invalid log level: ' + levelName));
    }
  }

  function shouldLog(levelName) {
    return LEVELS[levelName] <= currentLevel;
  }

  function formatMessage(levelName, message) {
    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    var msgStr = '';
    if (message === null || message === undefined) {
      msgStr = '';
    } else if (typeof message === 'object') {
      try {
        msgStr = JSON.stringify(message);
      } catch (e) {
        msgStr = String(message);
      }
    } else {
      msgStr = String(message);
    }
    return '[' + timestamp + '][' + levelName + '] ' + msgStr;
  }

  function log(levelName, message) {
    if (shouldLog(levelName)) {
      Logger.log(formatMessage(levelName, message));
    }
  }

  return {
    setLevel: setLevel,
    error: function(message) { log('ERROR', message); },
    warn: function(message) { log('WARN', message); },
    info: function(message) { log('INFO', message); },
    debug: function(message) { log('DEBUG', message); }
  };
})();

function logInfo(message) {
  AppLogger.info(message);
}

function logWarning(message) {
  AppLogger.warn(message);
}

function logError(message) {
  AppLogger.error(message);
}

function logDebug(message) {
  AppLogger.debug(message);
}