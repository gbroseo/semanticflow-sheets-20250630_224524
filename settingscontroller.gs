function openSettings() {
  var html = HtmlService.createHtmlOutputFromFile('settingsview').setTitle('SemanticFlow Settings');
  SpreadsheetApp.getUi().showSidebar(html);
}

function getUserSettings() {
  var userProps = PropertiesService.getUserProperties().getProperties();
  var docProps = PropertiesService.getDocumentProperties();
  
  // Get TextRazor API key from document properties
  var textRazorApiKey = docProps.getProperty('TEXTRAZOR_API_KEY') || getApiKey();
  var language = docProps.getProperty('TEXTRAZOR_LANGUAGE') || getLanguage();
  
  // Merge settings
  var settings = Object.assign({}, userProps, {
    textRazorApiKey: textRazorApiKey,
    language: language
  });
  
  return settings;
}

function saveUserSettings(settings) {
  // This is a wrapper for the saveSettings function to match the sidebar's expectations
  return saveSettings(settings);
}

function saveSettings(settings) {
  var validation = validateSettings(settings);
  if (!validation.success) {
    return { success: false, errors: validation.errors };
  }
  try {
    var userProps = PropertiesService.getUserProperties();
    var docProps = PropertiesService.getDocumentProperties();
    var propsToSet = {};
    
    Object.keys(settings).forEach(function(key) {
      if (key === 'textRazorApiKey') {
        // Store TextRazor API key in document properties as expected by textrazorclient.gs
        docProps.setProperty('TEXTRAZOR_API_KEY', settings[key]);
        // Also store in APIKeyManager format
        setApiKey(settings[key]);
      } else {
        // Store other settings in user properties
        propsToSet[key] = String(settings[key]);
      }
    });
    
    userProps.setProperties(propsToSet);
    
    // Store language using APIKeyManager
    if (settings.language) {
      docProps.setProperty('TEXTRAZOR_LANGUAGE', settings.language);
    }
    
    return { success: true };
  } catch (e) {
    Logger.log('Error saving settings: ' + e.toString());
    return { success: false, errors: { general: 'Failed to save settings. Please try again.' } };
  }
}

function validateSettings(settings) {
  var errors = {};
  if (!settings.textRazorApiKey || !settings.textRazorApiKey.trim()) {
    errors.textRazorApiKey = 'TextRazor API key is required.';
  }
  var supportedLangs = ['en', 'zh'];
  if (!settings.language || supportedLangs.indexOf(settings.language) === -1) {
    errors.language = 'Language must be one of: ' + supportedLangs.join(', ');
  }
  if (settings.maxResults != null && settings.maxResults.toString().trim() !== '') {
    var num = Number(settings.maxResults);
    if (isNaN(num) || num < 1 || num > 100) {
      errors.maxResults = 'Max results must be a number between 1 and 100.';
    }
  }
  return { success: Object.keys(errors).length === 0, errors: errors };
}

function testApiKey(apiKey) {
  // Temporarily set the API key for validation
  var originalKey = PropertiesService.getDocumentProperties().getProperty('TEXTRAZOR_API_KEY');
  PropertiesService.getDocumentProperties().setProperty('TEXTRAZOR_API_KEY', apiKey);
  
  try {
    var isValid = validateApiKey();
    return isValid;
  } finally {
    // Restore original key
    if (originalKey) {
      PropertiesService.getDocumentProperties().setProperty('TEXTRAZOR_API_KEY', originalKey);
    } else {
      PropertiesService.getDocumentProperties().deleteProperty('TEXTRAZOR_API_KEY');
    }
  }
}

function closeSettings() {
  return { success: true, closeSidebar: true };
}