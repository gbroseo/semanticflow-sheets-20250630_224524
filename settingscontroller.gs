function openSettings() {
  var html = HtmlService.createHtmlOutputFromFile('settingsview').setTitle('SemanticFlow Settings');
  SpreadsheetApp.getUi().showSidebar(html);
}

function getUserSettings() {
  return PropertiesService.getUserProperties().getProperties();
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
    var props = PropertiesService.getUserProperties();
    var propsToSet = {};
    Object.keys(settings).forEach(function(key) {
      propsToSet[key] = String(settings[key]);
    });
    props.setProperties(propsToSet);
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
  if (!settings.serpApiKey || !settings.serpApiKey.trim()) {
    errors.serpApiKey = 'SERP API key is required.';
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

function closeSettings() {
  return { success: true, closeSidebar: true };
}