function clearSheet(sheetName) {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  return sheet;
}

function writeDataToSheet(sheetName, data) {
  var sheet = clearSheet(sheetName);
  if (!data || data.length === 0) {
    return;
  }
  var values;
  var first = data[0];
  if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
    var headers = Object.keys(first);
    var rows = data.map(function(item) {
      return headers.map(function(key) {
        return item[key];
      });
    });
    values = [headers].concat(rows);
  } else if (Array.isArray(first)) {
    values = data;
  } else {
    throw new Error('Unsupported data format for writing to sheet: ' + sheetName);
  }
  var numRows = values.length;
  var numCols = values[0].length;
  sheet.getRange(1, 1, numRows, numCols).setValues(values);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, numRows, numCols).createFilter();
  for (var i = 0; i < numCols; i++) {
    sheet.autoResizeColumn(i + 1);
  }
}

function writeEntitiesSheet(tableData) {
  writeDataToSheet('Entities', tableData);
}

function writeCategoriesSheet(tableData) {
  writeDataToSheet('Categories', tableData);
}

function writeTopicsSheet(tableData) {
  writeDataToSheet('Topics', tableData);
}

function writeComparisonSheet(comparisonData) {
  writeDataToSheet('Comparison', comparisonData);
}