function onOpen(e) {
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem('Open Sidebar', 'showSidebar')
    .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function showSidebar() {
  const htmlOutput = HtmlService.createTemplateFromFile('sidebar')
    .evaluate()
    .setTitle('SemanticFlow Sheets')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}