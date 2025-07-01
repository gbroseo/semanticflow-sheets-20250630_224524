var I18nService = (function() {
  var translations = {};
  var availableLanguages = [];
  var currentLanguage = 'en';
  var loaded = false;

  function loadTranslations() {
    if (loaded) return;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Translations');
    if (!sheet) {
      throw new Error('Translations sheet not found.');
    }
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      throw new Error('Translations sheet is empty.');
    }
    var headers = data.shift();
    // Capture language codes with their column indices
    var langCols = [];
    for (var i = 1; i < headers.length; i++) {
      var raw = headers[i];
      if (raw != null) {
        var lang = raw.toString().trim();
        if (lang) {
          langCols.push({ lang: lang, index: i });
        }
      }
    }
    if (langCols.length === 0) {
      throw new Error('No language columns found in Translations sheet.');
    }
    availableLanguages = langCols.map(function(c) { return c.lang; });
    // Initialize translation mappings
    translations = {};
    availableLanguages.forEach(function(lang) {
      translations[lang] = {};
    });
    // Populate translations
    data.forEach(function(row) {
      var key = row[0];
      if (!key) return;
      key = key.toString();
      langCols.forEach(function(info) {
        var val = row[info.index];
        translations[info.lang][key] = (val !== undefined && val !== null) ? val.toString() : '';
      });
    });
    // Determine current language
    var userLang = PropertiesService.getUserProperties().getProperty('selectedLanguage');
    if (userLang && availableLanguages.indexOf(userLang) !== -1) {
      currentLanguage = userLang;
    } else if (availableLanguages.indexOf('en') !== -1) {
      currentLanguage = 'en';
    } else {
      currentLanguage = availableLanguages[0];
    }
    loaded = true;
  }

  function setLanguage(lang) {
    loadTranslations();
    if (availableLanguages.indexOf(lang) === -1) {
      throw new Error('Language not available: ' + lang);
    }
    currentLanguage = lang;
    PropertiesService.getUserProperties().setProperty('selectedLanguage', lang);
  }

  function translate(key) {
    loadTranslations();
    var langMap = translations[currentLanguage] || {};
    if (langMap.hasOwnProperty(key)) {
      return langMap[key];
    }
    var enMap = translations['en'] || {};
    if (enMap.hasOwnProperty(key)) {
      return enMap[key];
    }
    return key;
  }

  function getAvailableLanguages() {
    loadTranslations();
    return availableLanguages.slice();
  }

  return {
    loadTranslations: loadTranslations,
    setLanguage: setLanguage,
    translate: translate,
    getAvailableLanguages: getAvailableLanguages
  };
})();