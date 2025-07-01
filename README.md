# semanticflow-sheets-20250630_224524

A Google Sheets add-on (?SemanticFlow Sheets?) that integrates TextRazor NLP to perform URL Analysis, SERP Exploration, and Entity Gap Analysis directly in your spreadsheet.  
Full spec & details: https://docs.google.com/document/d/1soUiLYbMPFQP73x8O_-lKG7RzNBN68y9IuLQRhMvL98/

---

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Architecture](#architecture)  
4. [Components](#components)  
5. [Installation](#installation)  
6. [Usage](#usage)  
7. [Dependencies](#dependencies)  
8. [Contributing](#contributing)  
9. [License](#license)  

---

## Overview

SemanticFlow Sheets is a modular Google Apps Script add-on for Google Sheets that lets you:

- Analyze web pages (URL Analysis) for entities, topics, and categories  
- Explore top SERP results for given keywords (SERP Explorer)  
- Compare entity coverage across competitor pages (Entities Gap Analysis)  

All results appear in an interactive sidebar (tables & charts) and can be written to new sheets or exported as JSON-LD/CSV. Supports English and Chinese.

---

## Features

- Secure TextRazor API key storage & validation  
- URL Analysis: entities, categories, topics  
- SERP Explorer: analyze top search results  
- Entities Gap Analysis: identify missing entities  
- Automatic batching & exponential back-off for rate limits  
- Interactive sidebar UI (Google Visualization tables & charts)  
- One-click export to JSON-LD or CSV  
- English/Chinese internationalization  
- Loading spinner & comprehensive error dialogs  

---

## Architecture

The add-on follows a modular Apps Script structure:

- **Core Services**:  
  - APIKeyManager (secure key storage & validation)  
  - TextRazorClient (HTTP wrapper with batching & retries)  
  - I18nService (translations)  
  - RateLimiter (throttling & back-off)  
  - Logger  
- **Controllers**:  
  - SettingsController (manage API key & language)  
  - SidebarController (route UI events)  
- **Data Processors**:  
  - ResponseParser (parse TextRazor JSON)  
  - DataAggregator (compute frequencies & gaps)  
  - JSONLDBuilder (build export structures)  
- **Output Handlers**:  
  - SheetWriter (populate sheets)  
  - ChartRenderer (render charts in sidebar)  
- **Utilities & Views**:  
  - LoadingComponent, styles.css, and HTML templates for sidebar & modes  
- **Manifest**: external `appsscript.json` (menus, scopes)

---

## Components

| File                      | Type     | Purpose                                                                                  |
|---------------------------|----------|------------------------------------------------------------------------------------------|
| code.gs                   | .gs      | Entry point: onOpen/onInstall triggers + add-on menu                                     |
| apikeymanager.gs          | .gs      | Store/validate TextRazor API key & language via PropertiesService                       |
| textrazorclient.gs        | .gs      | Wrap HTTP calls to TextRazor API (batching, rate limits, retries)                       |
| i18nservice.gs            | .gs      | Load translation dictionaries & provide `t(key)`                                         |
| ratelimiter.gs            | .gs      | Throttle requests & retry with back-off                                                  |
| logger.gs                 | .gs      | Log info, warnings, errors to Execution Log                                             |
| sidebarcontroller.gs      | .gs      | Server-side router for sidebar events (mode selection, submit, export, error handling)  |
| settingscontroller.gs     | .gs      | Manage Settings sidebar (open, save & validate API key & language)                      |
| responseparser.gs         | .gs      | Parse TextRazor JSON into entities, categories, topics                                   |
| dataaggregator.gs         | .gs      | Aggregate parsed data (frequencies, clustering, gap computations)                       |
| jsonldbuilder.gs          | .gs      | Build JSON-LD (@context, @graph) for entities/topics/categories                         |
| sheetwriter.gs            | .gs      | Create/populate sheets with headers, filters, frozen rows                                |
| chartrenderer.gs          | .gs      | Render google.visualization tables & charts in the sidebar                               |
| sidebar.html              | .html    | Main sidebar container (navigation + dynamic content)                                    |
| urlanalysisview.html      | .html    | URL Analysis UI: input form & results area                                               |
| serpexplorerview.html     | .html    | SERP Explorer UI: query form & results pane                                              |
| entitygapview.html        | .html    | Entities Gap Analysis UI: compare form & gap visualization                                |
| exportcomponent.html      | .html    | Export options: JSON-LD & CSV                                                             |
| errordialog.html          | .html    | Modal dialog for error messages                                                           |
| settingsview.html         | .html    | Settings form: API key & language selection                                               |
| loadingcomponent.html     | .html    | Reusable loading spinner / progress indicator                                             |
| styles.css                | .css     | Global styles for sidebar, forms, tables, charts, loading spinner                         |

---

## Installation

Prerequisites:  
- A Google account with access to Google Sheets  
- A valid TextRazor API key (https://www.textrazor.com/)

Option A: Deploy via Clasp  
1. Install/clasp:  
   ```bash
   npm install -g @google/clasp
   clasp login
   ```  
2. Clone this repo:  
   ```bash
   git clone https://github.com/your-org/semanticflow-sheets-20250630_224524.git
   cd semanticflow-sheets-20250630_224524
   ```  
3. Create a new Sheets project:  
   ```bash
   clasp create --type sheets --title "SemanticFlow Sheets"
   ```  
4. Push code & manifest:  
   ```bash
   clasp push
   ```  
5. In the Apps Script editor, click **Deploy ? Test deployments ? Install**.

Option B: Manual Apps Script Upload  
1. Open your Google Sheet ? **Extensions ? Apps Script**.  
2. Copy each `.gs`, `.html`, and `styles.css` file into the editor.  
3. Update `appsscript.json` manifest (menus & scopes).  
4. **Save**, then **Deploy ? Test deployments ? Install**.

---

## Usage

1. Open your Google Sheet.  
2. Click **Extensions ? SemanticFlow ? Open Sidebar**.  
3. In **Settings**:  
   - Enter your TextRazor API key  
   - Select language (en / zh)  
   - Click **Save**  
4. In the main sidebar, choose a mode:  
   - **URL Analysis**: Paste one or more URLs ? **Analyze**  
   - **SERP Explorer**: Enter keywords ? **Analyze SERP**  
   - **Entities Gap Analysis**: Provide two sets of URLs ? **Compare**  
5. View interactive tables & charts.  
6. (Optional) Click **Export** to download JSON-LD or insert CSV into a sheet.  

---

## Dependencies

- Google Apps Script services:  
  - PropertiesService, UrlFetchApp, SpreadsheetApp, HtmlService, Utilities  
- Google Visualization API (bundled in sidebar)  
- TextRazor REST API (requires valid API key)  

---

## Contributing

1. Fork the repo  
2. Create a feature branch (`git checkout -b feat/my-feature`)  
3. Commit your changes & push (`git push origin feat/my-feature`)  
4. Open a Pull Request  

Please follow existing code style and update `README.md` with any new features.

---

## License

MIT ? [Your Name or Organization]  

---

*Built with ? by the SemanticFlow Team*