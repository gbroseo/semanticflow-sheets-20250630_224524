function initSidebar() {
  var html = HtmlService.createTemplateFromFile('sidebar')
    .evaluate()
    .setTitle('SemanticFlow');
  SpreadsheetApp.getUi().showSidebar(html);
}

function handleModeSelection(mode) {
  PropertiesService.getUserProperties().setProperty('SF_MODE', mode);
  return { mode: mode };
}

function handleSubmit(formData) {
  showLoading();
  try {
    var mode = PropertiesService.getUserProperties().getProperty('SF_MODE') || formData.mode;
    var result;
    switch (mode) {
      case 'urlAnalysis':
        if (formData.urls && formData.urls.length > 0) {
          result = performBatchURLAnalysis(formData.urls);
        } else {
          throw new Error('No URLs provided');
        }
        break;
      case 'serpExploration':
        result = performSERPExploration(formData.query);
        break;
      case 'entityGap':
        result = performEntityGapAnalysis(formData.seed, formData.target);
        break;
      default:
        throw new Error('Unknown mode: ' + mode);
    }
    outputToSheet(result, formData.sheetName || 'Results');
    return { status: 'success' };
  } catch (e) {
    showError(e.message);
    return { status: 'error', message: e.message };
  } finally {
    hideLoading();
  }
}

// Alias for client calls expecting processData
function processData(formData) {
  return handleSubmit(formData);
}

function performURLAnalysis(url) {
  if (!url) throw new Error('URL is required for analysis.');
  var raw = analyzeUrl(url);
  var parsed = parseResponse(raw);
  return parsed.entities;
}

function performBatchURLAnalysis(urls) {
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    throw new Error('URLs array is required for batch analysis.');
  }
  
  var allEntities = [];
  
  urls.forEach(function(url, index) {
    try {
      var entities = performURLAnalysis(url);
      // Add source URL to each entity
      entities.forEach(function(entity) {
        entity.sourceUrl = url;
        entity.sourceIndex = index;
      });
      allEntities = allEntities.concat(entities);
    } catch (e) {
      Logger.log('Failed to analyze URL: ' + url + ', error: ' + e.message);
    }
  });
  
  return allEntities;
}

function performSERPExploration(query) {
  if (!query) throw new Error('Query is required for SERP exploration.');
  var props = PropertiesService.getUserProperties();
  var apiKey = props.getProperty('serpApiKey');
  
  if (!apiKey) {
    // Return mock data for testing when API key is not available
    Logger.log('SERP API key not set. Returning mock data.');
    return [
      { title: 'Example Result 1 for ' + query, link: 'https://example.com/1' },
      { title: 'Example Result 2 for ' + query, link: 'https://example.com/2' },
      { title: 'Example Result 3 for ' + query, link: 'https://example.com/3' }
    ];
  }
  
  var endpoint = 'https://serpapi.com/search.json?q=' + encodeURIComponent(query) + '&api_key=' + apiKey;
  var response = UrlFetchApp.fetch(endpoint);
  var json = JSON.parse(response.getContentText());
  var results = json.organic_results || [];
  return results.map(function(item) {
    return { title: item.title, link: item.link };
  });
}

function performEntityGapAnalysis(url, entity) {
  if (!url || !entity) throw new Error('URL and entity are required for entity gap analysis.');
  
  var mainRaw = analyzeUrl(url);
  var mainParsed = parseResponse(mainRaw);
  var mainEntities = mainParsed.entities;
  
  var serpResults = performSERPExploration(entity);
  var competitorUrls = serpResults.map(function(item) {
    return item.link;
  });
  
  var pageEntitiesMap = {};
  pageEntitiesMap['main'] = mainEntities;
  
  competitorUrls.forEach(function(competitorUrl, index) {
    try {
      var raw = analyzeUrl(competitorUrl);
      var parsed = parseResponse(raw);
      pageEntitiesMap['competitor_' + index] = parsed.entities;
    } catch (e) {
      console.log('Failed to analyze competitor URL: ' + competitorUrl + ', error: ' + e.message);
    }
  });
  
  var gapArray = computeEntityGap(pageEntitiesMap, 'main');
  return gapArray;
}

function handleExport(format) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var values = sheet.getDataRange().getValues();
  if (format === 'csv') {
    var csv = values.map(function(row) {
      return row.map(function(cell) {
        var str = String(cell).replace(/"/g, '""');
        return '"' + str + '"';
      }).join(',');
    }).join('\r\n');
    return { format: 'csv', content: csv };
  } else if (format === 'json') {
    var headers = values[0];
    var data = values.slice(1).map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) {
        obj[h] = row[i];
      });
      return obj;
    });
    return { format: 'json', content: JSON.stringify(data, null, 2) };
  } else {
    throw new Error('Unsupported export format: ' + format);
  }
}

function showError(message) {
  SpreadsheetApp.getActive().toast(message, 'SemanticFlow Error', 5);
}

function showLoading() {
  SpreadsheetApp.getActive().toast('Loading, please wait...', 'SemanticFlow', 30);
}

function hideLoading() {
  SpreadsheetApp.getActive().toast('', 'SemanticFlow', 0);
}

function outputToSheet(data, sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clearContents();
  if (!data || !data.length) return;
  if (Array.isArray(data[0])) {
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  } else if (typeof data[0] === 'object') {
    var headers = Object.keys(data[0]);
    var rows = data.map(function(item) {
      return headers.map(function(key) {
        return item[key];
      });
    });
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  } else {
    sheet.getRange(1, 1, data.length, 1).setValues(data.map(function(d) {
      return [d];
    }));
  }
}