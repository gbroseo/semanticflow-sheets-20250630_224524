function renderTable(containerId, data) {
  if (typeof containerId !== 'string') throw new Error('renderTable: containerId must be a string');
  var normalized = _normalizeTableData(data);
  var headers = normalized.headers;
  var rows = normalized.rows;
  var html = '<table class="sf-table"><thead><tr>';
  headers.forEach(function(header) {
    html += '<th>' + _escapeHtml(header) + '</th>';
  });
  html += '</tr></thead><tbody>';
  rows.forEach(function(row) {
    html += '<tr>';
    row.forEach(function(cell) {
      html += '<td>' + _escapeHtml(cell != null ? cell.toString() : '') + '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return { containerId: containerId, html: html };
}

function renderChart(containerId, data, options) {
  if (typeof containerId !== 'string') throw new Error('renderChart: containerId must be a string');
  options = options || {};
  var normalized = _normalizeTableData(data);
  var headers = normalized.headers;
  var rows = normalized.rows;
  var dataTableBuilder = Charts.newDataTable();
  headers.forEach(function(header, index) {
    var sample = rows[0] && rows[0][index];
    var type = 'string';
    if (typeof sample === 'number') type = 'number';
    else if (sample instanceof Date) type = 'date';
    dataTableBuilder.addColumn(type, header);
  });
  rows.forEach(function(row) {
    dataTableBuilder.addRow(row);
  });
  var chartType = (options.type || 'bar').toLowerCase();
  var chartBuilder;
  switch (chartType) {
    case 'pie':
      chartBuilder = Charts.newPieChart();
      break;
    case 'line':
      chartBuilder = Charts.newLineChart();
      break;
    case 'column':
      chartBuilder = Charts.newColumnChart();
      break;
    case 'bar':
      chartBuilder = Charts.newBarChart();
      break;
    default:
      chartBuilder = Charts.newColumnChart();
      break;
  }
  chartBuilder.setDataTable(dataTableBuilder.build());
  if (options.title) chartBuilder.setOption('title', options.title);
  if (options.width) chartBuilder.setOption('width', options.width);
  if (options.height) chartBuilder.setOption('height', options.height);
  if (options.colors) chartBuilder.setOption('colors', options.colors);
  if (options.legendPosition) chartBuilder.setOption('legend', { position: options.legendPosition });
  if (options.customOptions) {
    for (var key in options.customOptions) {
      if (options.customOptions.hasOwnProperty(key)) {
        chartBuilder.setOption(key, options.customOptions[key]);
      }
    }
  }
  var chart = chartBuilder.build();
  var blob = chart.getAs('image/png');
  var imgTag = '<img src="data:image/png;base64,' + Utilities.base64Encode(blob.getBytes()) + '"';
  if (options.imgStyle) imgTag += ' style="' + _escapeHtml(options.imgStyle) + '"';
  imgTag += ' />';
  return { containerId: containerId, html: imgTag };
}

function clearContainer(containerId) {
  if (typeof containerId !== 'string') throw new Error('clearContainer: containerId must be a string');
  return { containerId: containerId, html: '' };
}

function _normalizeTableData(data) {
  var headers = [], rows = [];
  if (!data) return { headers: headers, rows: rows };
  if (Array.isArray(data)) {
    if (data.length === 0) return { headers: headers, rows: rows };
    if (Array.isArray(data[0])) {
      headers = data[0].map(function(h) { return String(h); });
      rows = data.slice(1).map(function(r) { return r.slice(0); });
    } else if (typeof data[0] === 'object' && data[0] !== null) {
      headers = Object.keys(data[0]).sort();
      rows = data.map(function(obj) {
        return headers.map(function(k) { return obj[k]; });
      });
    }
  } else if (typeof data === 'object' && data !== null) {
    headers = Object.keys(data).sort();
    rows = [ headers.map(function(k) { return data[k]; }) ];
  }
  rows = rows.map(function(row) {
    var newRow = row.slice(0, headers.length);
    while (newRow.length < headers.length) newRow.push(null);
    return newRow;
  });
  return { headers: headers, rows: rows };
}

function _escapeHtml(text) {
  var str = String(text || '');
  var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}