const CONTENT_SHEET = 'Content Library';
const PLANNER_SHEET = 'Daily Planner';
const LOG_SHEET = 'Integration Log';

const CONTENT_HEADERS = [
  'ID', 'Title', 'Platform', 'Content Type', 'Product', 'Language', 'Tone',
  'AI Review', 'Stage', 'Updated At', 'Content', 'Approved At',
  'Published At', 'Publish Link', 'Source'
];

const PLANNER_HEADERS = [
  'Content Date', 'Platform', 'Content Type', 'Product Name', 'Objective',
  'Key Message', 'Promotion', 'Language', 'Generated Content', 'Status',
  'Approval Notes', 'Approved Date', 'Published Date', 'Drive Link',
  'Publish Link', 'Request ID', 'Notion Page ID', 'Source', 'Website Action',
  'Website Sync Status', 'Last Website Update'
];

const LOG_HEADERS = ['Timestamp', 'Action', 'Record ID', 'Status', 'Message', 'Actor', 'Source'];

function doGet() {
  return json_({
    ok: true,
    data: {
      service: 'BRUTTI Google Marketing Backend',
      status: 'ready',
      message: 'Use an authenticated POST request from the BRUTTI website.'
    }
  });
}

function doPost(e) {
  try {
    const request = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    authorize_(request.accessKey);
    rateLimit_();
    const action = String(request.action || '');
    const payload = request.payload || {};
    const handlers = {
      integration_status: integrationStatus_,
      load_workspace: loadWorkspace_,
      save_content: () => saveContent_(payload.item),
      delete_content: () => deleteContent_(payload.id),
      save_plan: () => savePlan_(payload.plan),
      delete_plan: () => deletePlan_(payload.id),
      list_drive_assets: listDriveAssets_,
      publish_meta: () => publishMeta_(payload.contentId)
    };
    if (!handlers[action]) throw new Error('Unsupported action: ' + action);
    return json_({ ok: true, data: handlers[action]() });
  } catch (error) {
    logEvent_('request_error', '', 'Error', error.message);
    return json_({ ok: false, error: error.message || 'Unexpected backend error.' });
  }
}

function setupBruttiWorkspace() {
  const spreadsheet = plannerSpreadsheet_();
  ensureSheet_(spreadsheet, CONTENT_SHEET, CONTENT_HEADERS);
  ensureSheet_(spreadsheet, PLANNER_SHEET, PLANNER_HEADERS);
  ensureSheet_(spreadsheet, LOG_SHEET, LOG_HEADERS);
  return 'BRUTTI Google workspace is ready: ' + spreadsheet.getUrl();
}

function integrationStatus_() {
  const properties = scriptProperties_();
  return {
    appsScript: true,
    sheets: Boolean(properties.getProperty('PLANNER_SPREADSHEET_ID')),
    drive: Boolean(properties.getProperty('DRIVE_FOLDER_ID')),
    meta: Boolean(properties.getProperty('META_PAGE_ID') && properties.getProperty('META_PAGE_ACCESS_TOKEN'))
  };
}

function loadWorkspace_() {
  const spreadsheet = plannerSpreadsheet_();
  const contentSheet = ensureSheet_(spreadsheet, CONTENT_SHEET, CONTENT_HEADERS);
  const plannerSheet = ensureSheet_(spreadsheet, PLANNER_SHEET, PLANNER_HEADERS);
  return {
    content: contentRows_(contentSheet),
    plans: planRows_(plannerSheet)
  };
}

function saveContent_(item) {
  if (!item || !item.title || !item.copy) throw new Error('Content title and copy are required.');
  return withLock_(() => {
    const sheet = ensureSheet_(plannerSpreadsheet_(), CONTENT_SHEET, CONTENT_HEADERS);
    const id = String(item.id || Utilities.getUuid());
    const rowNumber = findRow_(sheet, 1, id);
    const existing = rowNumber ? sheet.getRange(rowNumber, 1, 1, CONTENT_HEADERS.length).getValues()[0] : [];
    const now = new Date();
    const approved = ['Approved', 'Scheduled', 'Published'].indexOf(item.stage) >= 0;
    const values = [
      id,
      clean_(item.title),
      clean_(item.platform || 'Facebook'),
      clean_(item.type || 'Facebook Post'),
      clean_(item.product || 'General / No Product'),
      clean_(item.language || 'Bahasa Melayu'),
      clean_(item.tone || 'Warm & confident'),
      clean_(item.aiReview || 'Human Review Required'),
      clean_(item.stage || 'Draft'),
      now,
      clean_(item.copy),
      approved ? (existing[11] || now) : '',
      item.stage === 'Published' ? (existing[12] || now) : '',
      clean_(item.publishLink || existing[13] || ''),
      'BRUTTI AI Marketing Hub'
    ];
    upsertRow_(sheet, rowNumber, values);
    logEvent_('save_content', id, 'Success', item.stage || 'Draft');
    return contentFromValues_(values);
  });
}

function deleteContent_(id) {
  return withLock_(() => {
    const sheet = ensureSheet_(plannerSpreadsheet_(), CONTENT_SHEET, CONTENT_HEADERS);
    const rowNumber = findRow_(sheet, 1, String(id));
    if (!rowNumber) throw new Error('Content record was not found.');
    sheet.deleteRow(rowNumber);
    logEvent_('delete_content', String(id), 'Success', 'Content deleted');
    return { id: String(id) };
  });
}

function savePlan_(plan) {
  if (!plan || !plan.title || !plan.date) throw new Error('Plan title and date are required.');
  return withLock_(() => {
    const sheet = ensureSheet_(plannerSpreadsheet_(), PLANNER_SHEET, PLANNER_HEADERS);
    const id = String(plan.id || Utilities.getUuid());
    let rowNumber = id.indexOf('sheet-row-') === 0 ? Number(id.replace('sheet-row-', '')) : findRow_(sheet, 16, id);
    if (!rowNumber || rowNumber < 2 || rowNumber > sheet.getLastRow()) rowNumber = 0;
    const existing = rowNumber ? sheet.getRange(rowNumber, 1, 1, PLANNER_HEADERS.length).getValues()[0] : [];
    const now = new Date();
    const approved = ['Approved', 'Scheduled', 'Published'].indexOf(plan.status) >= 0;
    const values = [
      new Date(String(plan.date) + 'T00:00:00'),
      clean_(plan.channel || 'Facebook'),
      clean_(plan.type || 'Facebook Post'),
      clean_(plan.product || 'General / No Product'),
      clean_(plan.objective || ''),
      clean_(plan.title),
      clean_(plan.promotion || ''),
      clean_(plan.language || 'Bahasa Melayu'),
      clean_(plan.generatedContent || existing[8] || ''),
      clean_(plan.status || 'Idea'),
      clean_(plan.approvalNotes || existing[10] || ''),
      approved ? (existing[11] || now) : '',
      plan.status === 'Published' ? (existing[12] || now) : '',
      clean_(plan.driveLink || existing[13] || ''),
      clean_(plan.publishLink || existing[14] || ''),
      id,
      clean_(existing[16] || ''),
      'BRUTTI AI Marketing Hub',
      'None',
      'Synced',
      now
    ];
    upsertRow_(sheet, rowNumber, values);
    logEvent_('save_plan', id, 'Success', plan.status || 'Idea');
    return planFromValues_(values, rowNumber || sheet.getLastRow());
  });
}

function deletePlan_(id) {
  return withLock_(() => {
    const sheet = ensureSheet_(plannerSpreadsheet_(), PLANNER_SHEET, PLANNER_HEADERS);
    let rowNumber = String(id).indexOf('sheet-row-') === 0 ? Number(String(id).replace('sheet-row-', '')) : findRow_(sheet, 16, String(id));
    if (!rowNumber || rowNumber < 2 || rowNumber > sheet.getLastRow()) throw new Error('Planner record was not found.');
    sheet.deleteRow(rowNumber);
    logEvent_('delete_plan', String(id), 'Success', 'Planner row deleted');
    return { id: String(id) };
  });
}

function listDriveAssets_() {
  const folderId = scriptProperties_().getProperty('DRIVE_FOLDER_ID');
  if (!folderId) throw new Error('DRIVE_FOLDER_ID is not configured in Apps Script Properties.');
  const folder = DriveApp.getFolderById(folderId);
  const iterator = folder.getFiles();
  const files = [];
  while (iterator.hasNext() && files.length < 100) {
    const file = iterator.next();
    files.push({
      id: file.getId(),
      name: file.getName(),
      url: file.getUrl(),
      mimeType: file.getMimeType(),
      updatedAt: file.getLastUpdated().toISOString()
    });
  }
  return { files: files, folderName: folder.getName() };
}

function publishMeta_(contentId) {
  const properties = scriptProperties_();
  const pageId = properties.getProperty('META_PAGE_ID');
  const token = properties.getProperty('META_PAGE_ACCESS_TOKEN');
  const version = properties.getProperty('META_GRAPH_VERSION');
  if (!pageId || !token || !version) throw new Error('Meta publishing is not configured in Apps Script Properties.');

  return withLock_(() => {
    const sheet = ensureSheet_(plannerSpreadsheet_(), CONTENT_SHEET, CONTENT_HEADERS);
    const rowNumber = findRow_(sheet, 1, String(contentId));
    if (!rowNumber) throw new Error('Content record was not found.');
    const values = sheet.getRange(rowNumber, 1, 1, CONTENT_HEADERS.length).getValues()[0];
    if (String(values[8]) !== 'Approved') throw new Error('Human approval is required before Meta publishing.');
    if (!values[10]) throw new Error('Approved content is empty.');

    const url = 'https://graph.facebook.com/' + encodeURIComponent(version) + '/' + encodeURIComponent(pageId) + '/feed';
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      payload: { message: String(values[10]), access_token: token },
      muteHttpExceptions: true
    });
    const body = JSON.parse(response.getContentText() || '{}');
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || !body.id) {
      throw new Error((body.error && body.error.message) || 'Meta publishing failed.');
    }
    const now = new Date();
    values[8] = 'Published';
    values[9] = now;
    values[12] = now;
    values[13] = 'https://www.facebook.com/' + body.id.replace('_', '/posts/');
    sheet.getRange(rowNumber, 1, 1, values.length).setValues([values]);
    logEvent_('publish_meta', String(contentId), 'Success', body.id);
    return { postId: body.id, publishLink: values[13] };
  });
}

function contentRows_(sheet) {
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, CONTENT_HEADERS.length).getValues()
    .filter(row => row[0] && row[1])
    .map(contentFromValues_)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

function contentFromValues_(row) {
  return {
    id: String(row[0]), title: String(row[1] || ''), platform: String(row[2] || 'Facebook'),
    type: String(row[3] || ''), product: String(row[4] || ''), language: String(row[5] || ''),
    tone: String(row[6] || ''), aiReview: String(row[7] || 'Human Review Required'),
    stage: String(row[8] || 'Draft'), updatedAt: formatDateTime_(row[9]), copy: String(row[10] || ''),
    approvedAt: formatIso_(row[11]), publishedAt: formatIso_(row[12]), publishLink: String(row[13] || '')
  };
}

function planRows_(sheet) {
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, PLANNER_HEADERS.length).getValues()
    .map((row, index) => planFromValues_(row, index + 2))
    .filter(plan => plan.title && plan.date)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function planFromValues_(row, rowNumber) {
  return {
    id: String(row[15] || ('sheet-row-' + rowNumber)),
    title: String(row[5] || ''),
    date: formatDate_(row[0]),
    channel: String(row[1] || 'Facebook'),
    type: String(row[2] || 'Facebook Post'),
    status: String(row[9] || 'Idea'),
    product: String(row[3] || 'General / No Product'),
    objective: String(row[4] || ''),
    language: String(row[7] || 'Bahasa Melayu'),
    generatedContent: String(row[8] || ''),
    approvalNotes: String(row[10] || ''),
    driveLink: String(row[13] || ''),
    publishLink: String(row[14] || '')
  };
}

function authorize_(accessKey) {
  const expected = scriptProperties_().getProperty('WORKSPACE_KEY');
  if (!expected) throw new Error('WORKSPACE_KEY is not configured in Apps Script Properties.');
  if (!safeEqual_(String(accessKey || ''), expected)) throw new Error('Invalid BRUTTI workspace key.');
}

function safeEqual_(left, right) {
  let result = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) result |= (left.charCodeAt(i % Math.max(left.length, 1)) || 0) ^ (right.charCodeAt(i % Math.max(right.length, 1)) || 0);
  return result === 0;
}

function rateLimit_() {
  const cache = CacheService.getScriptCache();
  const bucket = 'requests-' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHHmm');
  const count = Number(cache.get(bucket) || 0) + 1;
  if (count > 120) throw new Error('Request limit reached. Try again in one minute.');
  cache.put(bucket, String(count), 90);
}

function plannerSpreadsheet_() {
  const id = scriptProperties_().getProperty('PLANNER_SPREADSHEET_ID');
  if (!id) throw new Error('PLANNER_SPREADSHEET_ID is not configured in Apps Script Properties.');
  return SpreadsheetApp.openById(id);
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}

function upsertRow_(sheet, rowNumber, values) {
  const target = rowNumber || Math.max(sheet.getLastRow() + 1, 2);
  sheet.getRange(target, 1, 1, values.length).setValues([values]);
  return target;
}

function findRow_(sheet, column, value) {
  if (sheet.getLastRow() < 2) return 0;
  const finder = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).createTextFinder(value).matchEntireCell(true).findNext();
  return finder ? finder.getRow() : 0;
}

function logEvent_(action, recordId, status, message) {
  try {
    const spreadsheetId = scriptProperties_().getProperty('PLANNER_SPREADSHEET_ID');
    if (!spreadsheetId) return;
    const sheet = ensureSheet_(SpreadsheetApp.openById(spreadsheetId), LOG_SHEET, LOG_HEADERS);
    sheet.appendRow([new Date(), action, recordId, status, message, Session.getActiveUser().getEmail() || 'Workspace user', 'BRUTTI AI Marketing Hub']);
  } catch (ignored) {
    console.error(ignored);
  }
}

function withLock_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return callback(); } finally { lock.releaseLock(); }
}

function scriptProperties_() {
  return PropertiesService.getScriptProperties();
}

function clean_(value) {
  return String(value === null || value === undefined ? '' : value).trim().substring(0, 45000);
}

function formatDate_(value) {
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? '' : Utilities.formatDate(date, 'Asia/Kuala_Lumpur', 'yyyy-MM-dd');
}

function formatDateTime_(value) {
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? '' : Utilities.formatDate(date, 'Asia/Kuala_Lumpur', 'd MMM yyyy, h:mm a');
}

function formatIso_(value) {
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? '' : date.toISOString();
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
