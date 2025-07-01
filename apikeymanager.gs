const API_KEY_PROP = 'TEXTRAZOR_API_KEY';
const LANGUAGE_PROP = 'TEXTRAZOR_LANGUAGE';
const SUPPORTED_LANGUAGES = ['en', 'zh'];

function setApiKey(key) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Invalid API key.');
  }
  PropertiesService.getDocumentProperties().setProperty(API_KEY_PROP, key.trim());
}

function getApiKey() {
  var key = PropertiesService.getDocumentProperties().getProperty(API_KEY_PROP);
  return key || '';
}

function getLanguage() {
  var lang = PropertiesService.getDocumentProperties().getProperty(LANGUAGE_PROP);
  return (lang && SUPPORTED_LANGUAGES.indexOf(lang) >= 0) ? lang : 'en';
}

function validateApiKey() {
  var key = getApiKey();
  if (!key) {
    Logger.log('validateApiKey: No API key set.');
    return false;
  }
  var response;
  try {
    response = UrlFetchApp.fetch('https://api.textrazor.com', {
      method: 'post',
      headers: { 'x-textrazor-key': key },
      payload: { text: 'test' },
      muteHttpExceptions: true,
      contentType: 'application/x-www-form-urlencoded'
    });
  } catch (e) {
    Logger.log('validateApiKey fetch error: ' + e);
    return false;
  }
  var code = response.getResponseCode();
  if (code === 401 || code === 403) {
    Logger.log('validateApiKey authentication error, response code: ' + code);
    return false;
  }
  if (code === 429) {
    // Rate limited but key is valid
    return true;
  }
  if (code === 200) {
    try {
      var data = JSON.parse(response.getContentText());
      if (data.error) {
        Logger.log('validateApiKey API returned error: ' + data.error);
        return false;
      }
      return true;
    } catch (e) {
      Logger.log('validateApiKey JSON parse error: ' + e);
      return false;
    }
  }
  Logger.log('validateApiKey unexpected response code: ' + code);
  return false;
}