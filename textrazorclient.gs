var TEXT_RAZOR_ENDPOINT = 'https://api.textrazor.com/';
var MAX_RETRIES = 3;
var RETRY_BACKOFF_BASE_MS = 500;
var RATE_LIMIT_INTERVAL_MS = 1100;

function analyzeUrl(url) {
  return _callTextRazor({ url: url });
}

function analyzeText(text) {
  return _callTextRazor({ text: text });
}

function batchAnalyze(requests) {
  if (!Array.isArray(requests)) {
    throw new Error('batchAnalyze requires an array of request objects');
  }
  var results = [];
  for (var i = 0; i < requests.length; i++) {
    var req = requests[i];
    if (!req.url && !req.text) {
      throw new Error('Each request must have url or text');
    }
    try {
      var result = _callTextRazor(req);
      results.push(result);
    } catch (e) {
      throw new Error('Batch request ' + i + ' failed: ' + e.message);
    }
    if (i < requests.length - 1) {
      Utilities.sleep(RATE_LIMIT_INTERVAL_MS);
    }
  }
  return results;
}

function _callTextRazor(params) {
  if (!params.url && !params.text) {
    throw new Error('Missing url or text');
  }
  var apiKey = _getApiKey();
  var allResponses = [];
  var pageParams = Object.assign({}, params);
  var pageCount = 0;
  while (true) {
    var payload = {
      apiKey: apiKey,
      extractors: 'entities,topics,relations,dependencyTree'
    };
    if (pageParams.url) payload.url = pageParams.url;
    else payload.text = pageParams.text;
    if (pageParams.offset) payload.offset = pageParams.offset;
    var options = {
      method: 'post',
      payload: payload,
      muteHttpExceptions: true
    };
    var res = _fetchWithRetry(TEXT_RAZOR_ENDPOINT, options);
    var code = res.getResponseCode();
    var content = res.getContentText();
    if (code !== 200) {
      throw new Error('TextRazor API error: ' + content);
    }
    var json = JSON.parse(content);
    allResponses.push(json);
    var nextOffset = json.meta && json.meta.next && json.meta.next.offset;
    if (nextOffset) {
      pageParams.offset = nextOffset;
      pageCount++;
      if (pageCount > MAX_RETRIES * 5) {
        break;
      }
      Utilities.sleep(RATE_LIMIT_INTERVAL_MS);
      continue;
    }
    break;
  }
  if (allResponses.length === 1) {
    return allResponses[0];
  }
  return _mergeResponses(allResponses);
}

function _fetchWithRetry(url, options) {
  var attempt = 0;
  var backoff = RETRY_BACKOFF_BASE_MS;
  while (true) {
    try {
      var res = UrlFetchApp.fetch(url, options);
      var code = res.getResponseCode();
      if (code === 200) {
        return res;
      }
      if ((code === 429 || (code >= 500 && code < 600)) && attempt < MAX_RETRIES) {
        Utilities.sleep(backoff);
        backoff *= 2;
        attempt++;
        continue;
      }
      return res;
    } catch (e) {
      if (attempt < MAX_RETRIES) {
        Utilities.sleep(backoff);
        backoff *= 2;
        attempt++;
        continue;
      }
      throw e;
    }
  }
}

function _mergeResponses(responses) {
  var merged = JSON.parse(JSON.stringify(responses[0]));
  var base = merged.response || {};
  for (var i = 1; i < responses.length; i++) {
    var resp = responses[i].response || {};
    for (var key in resp) {
      if (resp.hasOwnProperty(key) && Array.isArray(base[key]) && Array.isArray(resp[key])) {
        base[key] = base[key].concat(resp[key]);
      }
    }
    if (responses[i].meta) {
      merged.meta = responses[i].meta;
    }
  }
  merged.response = base;
  return merged;
}

function _getApiKey() {
  var key = PropertiesService.getDocumentProperties().getProperty('TEXTRAZOR_API_KEY');
  if (!key) {
    throw new Error('TEXTRAZOR_API_KEY is not set in Document Properties');
  }
  return key;
}