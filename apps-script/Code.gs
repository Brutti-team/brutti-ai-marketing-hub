const CONTENT_SHEET = 'Content Library';
const PLANNER_SHEET = 'Daily Planner';
const LOG_SHEET = 'Integration Log';
const PRODUCT_SHEET = 'Product Library';
const PRODUCT_REFERENCE_SHEET = 'Product References';
const META_POST_INSIGHTS_SHEET = 'META_POST_INSIGHTS';
const META_POST_INSIGHTS_HEADERS = ['Post ID', 'Platform', 'Created Time', 'Message', 'Permalink', 'Format', 'Views', 'Reach', 'Reactions', 'Comments', 'Shares', 'Saves', 'Engagement', 'Synced At'];

const BRUTTI_RESOURCE_IDS = {
  plannerSpreadsheet: '10o2HcCKqbkcvTPx58MKiKG2bx6cnvBtuJULEIEWG8xQ',
  driveRootFolder: '1V3AIjXMqIWU5mi6tG2m4UzDGv1rhBqgO',
  driveAssetFolder: '17klllaMxznv8IiRUwggEVUsbQ_qcSNFU',
  notionProductPage: '3b35a38f-1fa4-8034-bfc4-f9fad18eed8b',
  notionPlannerDatabase: 'aa9bba50-17fd-4d27-9bbb-82a2247424d4'
};

const CONTENT_HEADERS = [
  'ID', 'Title', 'Platform', 'Content Type', 'Product', 'Language', 'Tone',
  'AI Review', 'Stage', 'Updated At', 'Content', 'Approved At',
  'Published At', 'Publish Link', 'Source', 'Drive File ID', 'Asset Name'
];

const PLANNER_HEADERS = [
  'Content Date', 'Platform', 'Content Type', 'Product Name', 'Objective',
  'Key Message', 'Promotion', 'Language', 'Generated Content', 'Status',
  'Approval Notes', 'Approved Date', 'Published Date', 'Drive Link',
  'Publish Link', 'Request ID', 'Notion Page ID', 'Source', 'Website Action',
  'Website Sync Status', 'Last Website Update', 'Sync Error', 'Name'
];

const LOG_HEADERS = ['Timestamp', 'Action', 'Record ID', 'Status', 'Message', 'Actor', 'Source'];
const PRODUCT_HEADERS = ['ID', 'Product Name', 'Category', 'Price', 'Material', 'Dimensions', 'Colour', 'Status', 'Source'];
const PRODUCT_REFERENCE_HEADERS = ['ID', 'Project / Kiosk Name', 'Reference Type', 'Location / Client', 'Notes / Posting Direction', 'Drive File ID', 'Drive URL', 'Image Name', 'Updated At', 'Source'];

function doGet(e) {
  if (e && e.parameter && e.parameter.view === 'meta-insights') return json_({ ok: true, data: metaInsightsPublic_() });
  return json_({
    ok: true,
    data: {
      service: 'BRUTTI Google Marketing Backend',
      status: 'ready',
      message: 'Use an authenticated POST request from the BRUTTI website.'
    }
  });
}

function syncMetaInsights() {
  const properties = scriptProperties_();
  const pageId = properties.getProperty('META_PAGE_ID');
  const token = properties.getProperty('META_PAGE_ACCESS_TOKEN');
  const version = properties.getProperty('META_GRAPH_VERSION') || 'v23.0';
  if (!pageId || !token) throw new Error('Set META_PAGE_ID and META_PAGE_ACCESS_TOKEN in Apps Script Properties first.');
  const unavailable = {};
  const posts = metaGraphRequest_(version + '/' + encodeURIComponent(pageId) + '/published_posts', token, {
    fields: 'id,message,created_time,permalink_url,attachments{media_type,type},comments.limit(0).summary(true),reactions.limit(0).summary(true),shares',
    limit: '25'
  }).data || [];
  const syncedAt = new Date().toISOString();
  const records = posts.map(post => {
    const metric = name => safeMetaPostMetric_(version, post.id, token, name, unavailable);
    const attachment = post.attachments && post.attachments.data && post.attachments.data[0];
    return {
      sourceId: String(post.id || ''), platform: 'facebook', createdTime: post.created_time || '', message: post.message || '', permalink: post.permalink_url || '',
      format: attachment ? (attachment.media_type || attachment.type || 'post') : 'post',
      views: metric('post_video_views'), reach: metric('post_impressions_unique'),
      reactions: metaCount_(post.reactions), comments: metaCount_(post.comments), shares: post.shares ? numericOrNull_(post.shares.count) : null,
      saves: metric('post_saves'), engagement: metric('post_engaged_users'), syncedAt: syncedAt
    };
  }).filter(post => post.sourceId && hasMetaPostMetric_(post));
  const sheet = ensureMetaPostInsightsSheet_();
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, META_POST_INSIGHTS_HEADERS.length).clearContent();
  if (records.length) sheet.getRange(2, 1, records.length, META_POST_INSIGHTS_HEADERS.length).setValues(records.map(post => [
    post.sourceId, post.platform, post.createdTime, post.message, post.permalink, post.format, post.views, post.reach, post.reactions, post.comments, post.shares, post.saves, post.engagement, post.syncedAt
  ]));
  logEvent_('sync_meta_insights', '', 'Success', records.length + ' verified Meta post records synced. Unavailable metrics: ' + Object.keys(unavailable).join(', '));
  return { posts: records.length, unavailableMetrics: Object.keys(unavailable), syncedAt: syncedAt };
}

// Run once from Apps Script after Script Properties are set. The trigger uses
// the project's configured timezone and keeps Meta requests off GitHub Pages.
function installDailyMetaInsightsSync() {
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === 'syncMetaInsights') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('syncMetaInsights').timeBased().everyDays(1).atHour(7).create();
}

function ensureMetaPostInsightsSheet_() {
  const spreadsheet = SpreadsheetApp.openById('1Zs9mc5E6aBk3l9tr6x0crs4XnbBHgemcADwZaNlJByU');
  const sheet = spreadsheet.getSheetByName(META_POST_INSIGHTS_SHEET) || spreadsheet.insertSheet(META_POST_INSIGHTS_SHEET);
  if (sheet.getLastRow() < 1) sheet.getRange(1, 1, 1, META_POST_INSIGHTS_HEADERS.length).setValues([META_POST_INSIGHTS_HEADERS]);
  return sheet;
}

function safeMetaPostMetric_(version, postId, token, metricName, unavailable) {
  try {
    const data = metaGraphRequest_(version + '/' + encodeURIComponent(postId) + '/insights', token, { metric: metricName }).data || [];
    const values = data[0] && data[0].values ? data[0].values : [];
    const latest = values.length ? values[values.length - 1] : null;
    const value = latest ? numericOrNull_(latest.value) : null;
    if (value === null) unavailable[metricName] = true;
    return value;
  } catch (error) { unavailable[metricName] = true; return null; }
}

function metaCount_(field) { return field && field.summary ? numericOrNull_(field.summary.total_count) : null; }
function numericOrNull_(value) { return typeof value === 'number' && isFinite(value) ? value : null; }
function hasMetaPostMetric_(post) { return ['views', 'reach', 'reactions', 'comments', 'shares', 'saves', 'engagement'].some(key => post[key] !== null); }

function metaGraphRequest_(path, token, params) {
  const query = Object.keys(params || {}).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
  query.push('access_token=' + encodeURIComponent(token));
  const response = UrlFetchApp.fetch('https://graph.facebook.com/' + path + '?' + query.join('&'), { muteHttpExceptions: true });
  const body = JSON.parse(response.getContentText() || '{}');
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || body.error) throw new Error('Meta Graph API request failed: ' + (body.error && body.error.message ? body.error.message : response.getResponseCode()));
  return body;
}

function metaInsightsPublic_() {
  const spreadsheet = SpreadsheetApp.openById('1Zs9mc5E6aBk3l9tr6x0crs4XnbBHgemcADwZaNlJByU');
  const sheet = spreadsheet.getSheetByName(META_POST_INSIGHTS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return { sourceUpdatedAt: null, unavailableMetrics: [], instagram: { latestReach: null, followers: null, trend: [], topPosts: [] }, facebook: { followers: null, topPosts: [] } };
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, META_POST_INSIGHTS_HEADERS.length).getValues();
  const unavailable = {};
  const postList = rows.map(row => {
    const post = { sourceId: String(row[0] || ''), platform: String(row[1] || 'facebook'), createdTime: formatIso_(row[2]), message: String(row[3] || ''), permalink: String(row[4] || ''), format: String(row[5] || 'post'), views: numericOrNull_(row[6]), reach: numericOrNull_(row[7]), reactions: numericOrNull_(row[8]), comments: numericOrNull_(row[9]), shares: numericOrNull_(row[10]), saves: numericOrNull_(row[11]), engagement: numericOrNull_(row[12]), syncedAt: formatIso_(row[13]) };
    ['views', 'reach', 'reactions', 'comments', 'shares', 'saves', 'engagement'].forEach(key => { if (post[key] === null) unavailable[key] = true; });
    return post;
  }).filter(hasMetaPostMetric_);
  const rankingValue = post => post.engagement !== null ? post.engagement : post.reach !== null ? post.reach : post.reactions !== null ? post.reactions : post.views !== null ? post.views : 0;
  const topPosts = postList.sort((a, b) => rankingValue(b) - rankingValue(a)).slice(0, 25);
  const sourceUpdatedAt = topPosts.reduce((latest, post) => post.syncedAt && post.syncedAt > latest ? post.syncedAt : latest, '');
  return {
    sourceUpdatedAt: sourceUpdatedAt || null, unavailableMetrics: Object.keys(unavailable),
    instagram: { latestReach: null, followers: null, trend: [], topPosts: [] },
    facebook: { followers: null, topPosts: topPosts }
  };
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
      test_integrations: testIntegrations_,
      configure_resources: configureKnownResources_,
      load_workspace: loadWorkspace_,
      save_content: () => saveContent_(payload.item),
      delete_content: () => deleteContent_(payload.id),
      save_plan: () => savePlan_(payload.plan),
      delete_plan: () => deletePlan_(payload.id),
      list_drive_assets: listDriveAssets_,
      sync_notion_products: syncNotionProducts_,
      save_product_reference: () => saveProductReference_(payload.reference),
      delete_product_reference: () => deleteProductReference_(payload.id),
      sync_notion_planner: syncNotionPlanner_,
      sync_meta_insights: syncMetaInsights,
      publish_meta: () => { throw new Error('Facebook publishing is currently deferred. Keep approved content in BRUTTI and publish manually when Meta access is ready.'); }
    };
    if (!handlers[action]) throw new Error('Unsupported action: ' + action);
    return json_({ ok: true, data: handlers[action]() });
  } catch (error) {
    logEvent_('request_error', '', 'Error', error.message);
    return json_({ ok: false, error: error.message || 'Unexpected backend error.' });
  }
}

function setupBruttiWorkspace() {
  applyKnownResourceDefaults_();
  const spreadsheet = plannerSpreadsheet_();
  ensureSheet_(spreadsheet, CONTENT_SHEET, CONTENT_HEADERS);
  ensureSheet_(spreadsheet, PLANNER_SHEET, PLANNER_HEADERS);
  ensureSheet_(spreadsheet, LOG_SHEET, LOG_HEADERS);
  ensureSheet_(spreadsheet, PRODUCT_SHEET, PRODUCT_HEADERS);
  ensureSheet_(spreadsheet, PRODUCT_REFERENCE_SHEET, PRODUCT_REFERENCE_HEADERS);
  const tests = testIntegrations_();
  return JSON.stringify({
    message: 'BRUTTI Google workspace setup completed.',
    spreadsheetUrl: spreadsheet.getUrl(),
    integrations: tests
  });
}

function integrationStatus_() {
  const tests = testIntegrations_();
  const properties = scriptProperties_();
  const meta = metaConnectionStatus_();
  return {
    appsScript: true,
    sheets: Boolean(tests.sheets && tests.sheets.connected),
    drive: Boolean(tests.drive && tests.drive.connected),
    notion: Boolean(tests.notion && tests.notion.connected),
    meta: Boolean(meta.connected),
    details: Object.assign({}, tests, { meta: meta })
  };
}

function metaConnectionStatus_() {
  const properties = scriptProperties_();
  const pageId = properties.getProperty('META_PAGE_ID');
  const token = properties.getProperty('META_PAGE_ACCESS_TOKEN');
  const version = properties.getProperty('META_GRAPH_VERSION') || 'v23.0';
  if (!pageId || !token) return { connected: false, configured: false, message: 'Meta Page ID and access token are not configured.' };
  try {
    const page = metaGraphRequest_(version + '/' + encodeURIComponent(pageId), token, { fields: 'id,name' });
    return { connected: true, configured: true, pageName: String(page.name || ''), checkedAt: new Date().toISOString() };
  } catch (error) {
    return { connected: false, configured: true, message: clean_(error.message) };
  }
}

function loadWorkspace_() {
  const spreadsheet = plannerSpreadsheet_();
  const contentSheet = ensureSheet_(spreadsheet, CONTENT_SHEET, CONTENT_HEADERS);
  const plannerSheet = ensureSheet_(spreadsheet, PLANNER_SHEET, PLANNER_HEADERS);
  const productSheet = ensureSheet_(spreadsheet, PRODUCT_SHEET, PRODUCT_HEADERS);
  const referenceSheet = ensureSheet_(spreadsheet, PRODUCT_REFERENCE_SHEET, PRODUCT_REFERENCE_HEADERS);
  return {
    content: contentRows_(contentSheet),
    plans: planRows_(plannerSheet),
    products: productRows_(productSheet),
    references: productReferenceRows_(referenceSheet)
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
      'BRUTTI AI Marketing Hub',
      clean_(item.driveFileId || existing[15] || ''),
      clean_(item.assetName || existing[16] || '')
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
      clean_(plan.websiteAction || (rowNumber ? 'Edit' : 'Add')),
      'Synced',
      now,
      clean_(existing[21] || ''),
      clean_(plan.name || plan.title || existing[22] || '')
    ];
    if (notionPlannerConfigured_()) {
      try {
        const synced = upsertNotionPlan_(values);
        values[16] = synced.pageId || values[16];
        values[19] = 'Synced';
        values[21] = '';
        values[22] = values[22] || values[5];
      } catch (error) {
        values[19] = 'Error';
        values[21] = clean_(error.message);
        values[22] = values[22] || values[5];
        logEvent_('notion_plan_sync', id, 'Error', error.message);
      }
    }
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
    const values = sheet.getRange(rowNumber, 1, 1, PLANNER_HEADERS.length).getValues()[0];
    if (notionPlannerConfigured_() && values[16]) {
      try { notionRequest_('/v1/pages/' + encodeURIComponent(String(values[16])), 'patch', { archived: true }); }
      catch (error) { logEvent_('notion_plan_delete', String(id), 'Error', error.message); }
    }
    sheet.deleteRow(rowNumber);
    logEvent_('delete_plan', String(id), 'Success', 'Planner row deleted');
    return { id: String(id) };
  });
}

function applyKnownResourceDefaults_() {
  const properties = scriptProperties_();
  const current = properties.getProperties();
  const defaults = {
    PLANNER_SPREADSHEET_ID: BRUTTI_RESOURCE_IDS.plannerSpreadsheet,
    DRIVE_ROOT_FOLDER_ID: BRUTTI_RESOURCE_IDS.driveRootFolder,
    DRIVE_FOLDER_ID: BRUTTI_RESOURCE_IDS.driveRootFolder,
    DRIVE_ASSET_FOLDER_ID: BRUTTI_RESOURCE_IDS.driveAssetFolder,
    NOTION_PRODUCT_PAGE_ID: BRUTTI_RESOURCE_IDS.notionProductPage,
    NOTION_DAILY_PLANNER_DATABASE_ID: BRUTTI_RESOURCE_IDS.notionPlannerDatabase
  };
  const missing = {};
  Object.keys(defaults).forEach(key => {
    if (!current[key]) missing[key] = defaults[key];
  });
  if (Object.keys(missing).length) properties.setProperties(missing, false);
  return missing;
}

function configureKnownResources_() {
  const properties = scriptProperties_();
  properties.setProperties({
    PLANNER_SPREADSHEET_ID: BRUTTI_RESOURCE_IDS.plannerSpreadsheet,
    DRIVE_ROOT_FOLDER_ID: BRUTTI_RESOURCE_IDS.driveRootFolder,
    DRIVE_FOLDER_ID: BRUTTI_RESOURCE_IDS.driveRootFolder,
    DRIVE_ASSET_FOLDER_ID: BRUTTI_RESOURCE_IDS.driveAssetFolder,
    NOTION_PRODUCT_PAGE_ID: BRUTTI_RESOURCE_IDS.notionProductPage,
    NOTION_DAILY_PLANNER_DATABASE_ID: BRUTTI_RESOURCE_IDS.notionPlannerDatabase
  }, false);
  return testIntegrations_();
}

function testIntegrations_() {
  applyKnownResourceDefaults_();
  const properties = scriptProperties_();
  const result = {
    checkedAt: new Date().toISOString(),
    sheets: { connected: false, configured: false },
    drive: { connected: false, configured: false },
    notion: { connected: false, configured: false }
  };

  const spreadsheetId = properties.getProperty('PLANNER_SPREADSHEET_ID');
  result.sheets.configured = Boolean(spreadsheetId);
  if (spreadsheetId) {
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const requiredTabs = [PLANNER_SHEET, CONTENT_SHEET, LOG_SHEET];
      const planner = spreadsheet.getSheetByName(PLANNER_SHEET);
      const plannerHeaders = planner ? planner.getRange(1, 1, 1, PLANNER_HEADERS.length).getDisplayValues()[0] : [];
      const plannerSchemaMatches = plannerHeaders.join('|') === PLANNER_HEADERS.join('|');
      const existingTabs = spreadsheet.getSheets().map(sheet => sheet.getName());
      const missingTabs = requiredTabs.filter(name => existingTabs.indexOf(name) < 0);
      result.sheets = {
        connected: missingTabs.length === 0 && plannerSchemaMatches,
        configured: true,
        id: spreadsheetId,
        name: spreadsheet.getName(),
        url: spreadsheet.getUrl(),
        tabs: existingTabs,
        missingTabs: missingTabs,
        plannerSchemaMatches: plannerSchemaMatches,
        plannerColumns: PLANNER_HEADERS.length
      };
    } catch (error) {
      result.sheets.error = error.message;
    }
  }

  const rootId = properties.getProperty('DRIVE_ROOT_FOLDER_ID') || properties.getProperty('DRIVE_FOLDER_ID');
  const assetId = properties.getProperty('DRIVE_ASSET_FOLDER_ID');
  result.drive.configured = Boolean(rootId && assetId);
  if (rootId && assetId) {
    try {
      const root = DriveApp.getFolderById(rootId);
      const assets = DriveApp.getFolderById(assetId);
      const files = assets.getFiles();
      let assetCount = 0;
      let imageCount = 0;
      while (files.hasNext() && assetCount < 250) {
        const file = files.next();
        assetCount += 1;
        if (String(file.getMimeType()).indexOf('image/') === 0) imageCount += 1;
      }
      result.drive = {
        connected: true,
        configured: true,
        rootId: rootId,
        rootName: root.getName(),
        assetFolderId: assetId,
        assetFolderName: assets.getName(),
        directAssetFiles: assetCount,
        directImageFiles: imageCount
      };
    } catch (error) {
      result.drive.error = error.message;
    }
  }

  const notionToken = properties.getProperty('NOTION_TOKEN');
  const productPageId = properties.getProperty('NOTION_PRODUCT_PAGE_ID');
  const plannerDatabaseId = properties.getProperty('NOTION_DAILY_PLANNER_DATABASE_ID');
  result.notion.configured = Boolean(notionToken && productPageId && plannerDatabaseId);
  result.notion.resourceIdsConfigured = Boolean(productPageId && plannerDatabaseId);
  result.notion.tokenConfigured = Boolean(notionToken);
  if (notionToken && productPageId && plannerDatabaseId) {
    try {
      const productPage = notionRequest_('/v1/pages/' + encodeURIComponent(productPageId), 'get');
      const plannerDatabase = notionRequest_('/v1/databases/' + encodeURIComponent(plannerDatabaseId), 'get');
      result.notion = {
        connected: true,
        configured: true,
        tokenConfigured: true,
        resourceIdsConfigured: true,
        productPageId: productPageId,
        productPageTitle: notionApiTitle_(productPage),
        plannerDatabaseId: plannerDatabaseId,
        plannerDatabaseTitle: notionApiTitle_(plannerDatabase)
      };
    } catch (error) {
      result.notion.error = error.message;
    }
  } else if (!notionToken) {
    result.notion.error = 'NOTION_TOKEN is not configured in Apps Script Properties.';
  }

  result.ready = Boolean(result.sheets.connected && result.drive.connected && result.notion.connected);
  return result;
}

function notionApiTitle_(entity) {
  try {
    const properties = entity && entity.properties ? entity.properties : {};
    const titleProperty = Object.keys(properties).map(key => properties[key]).find(prop => prop && prop.type === 'title');
    if (titleProperty && titleProperty.title) return titleProperty.title.map(item => item.plain_text || '').join('').trim();
    if (entity && entity.title) return entity.title.map(item => item.plain_text || '').join('').trim();
  } catch (ignored) {}
  return '';
}

function listDriveAssets_() {
  applyKnownResourceDefaults_();
  const properties = scriptProperties_();
  const folderId = properties.getProperty('DRIVE_ASSET_FOLDER_ID') || properties.getProperty('DRIVE_FOLDER_ID');
  if (!folderId) throw new Error('DRIVE_ASSET_FOLDER_ID is not configured in Apps Script Properties.');
  const folder = DriveApp.getFolderById(folderId);
  const iterator = folder.getFiles();
  const files = [];
  while (iterator.hasNext() && files.length < 100) {
    const file = iterator.next();
    if (String(file.getMimeType()).indexOf('image/') !== 0) continue;
    files.push({
      id: file.getId(),
      name: file.getName(),
      url: file.getUrl(),
      mimeType: file.getMimeType(),
      updatedAt: file.getLastUpdated().toISOString()
    });
  }
  return { files: files, folderName: folder.getName(), folderId: folderId };
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

    const hasImage = Boolean(values[15]);
    const endpoint = hasImage ? '/photos' : '/feed';
    const url = 'https://graph.facebook.com/' + encodeURIComponent(version) + '/' + encodeURIComponent(pageId) + endpoint;
    const payload = hasImage
      ? { caption: String(values[10]), source: DriveApp.getFileById(String(values[15])).getBlob(), access_token: token }
      : { message: String(values[10]), access_token: token };
    const response = UrlFetchApp.fetch(url, { method: 'post', payload: payload, muteHttpExceptions: true });
    const body = JSON.parse(response.getContentText() || '{}');
    const objectId = body.post_id || body.id;
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || !objectId) {
      throw new Error((body.error && body.error.message) || 'Meta publishing failed.');
    }
    const now = new Date();
    values[8] = 'Published';
    values[9] = now;
    values[12] = now;
    values[13] = metaPermalink_(objectId, version, token) || ('https://www.facebook.com/' + objectId);
    sheet.getRange(rowNumber, 1, 1, values.length).setValues([values]);
    logEvent_('publish_meta', String(contentId), 'Success', objectId + (hasImage ? ' photo' : ' text'));
    return { postId: objectId, publishLink: values[13], type: hasImage ? 'photo' : 'text' };
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
    approvedAt: formatIso_(row[11]), publishedAt: formatIso_(row[12]), publishLink: String(row[13] || ''),
    driveFileId: String(row[15] || ''), assetName: String(row[16] || '')
  };
}

function productRows_(sheet) {
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, PRODUCT_HEADERS.length).getValues()
    .filter(row => row[1])
    .map(row => ({
      id: String(row[0] || ''), name: String(row[1] || ''), category: String(row[2] || ''),
      price: String(row[3] || ''), material: String(row[4] || ''), dimensions: String(row[5] || ''),
      colour: String(row[6] || ''), status: String(row[7] || ''), sourceStatus: String(row[8] || 'Verified source'),
      photoConfirmed: false
    }));
}

function productReferenceRows_(sheet) {
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, PRODUCT_REFERENCE_HEADERS.length).getValues()
    .filter(row => row[0] && row[1])
    .map(productReferenceFromValues_);
}

function productReferenceFromValues_(row) {
  const fileId = String(row[5] || '');
  return {
    id: String(row[0] || ''),
    name: String(row[1] || ''),
    category: String(row[2] || 'Kiosk / Project'),
    price: '',
    material: String(row[4] || 'Saved kiosk or project reference'),
    dimensions: String(row[3] || ''),
    sourceStatus: String(row[9] || 'Saved kiosk / project reference'),
    photoConfirmed: Boolean(fileId),
    imageDataUrl: fileId ? driveImageUrl_(fileId) : '',
    imageName: String(row[7] || ''),
    driveFileId: fileId,
    driveUrl: String(row[6] || ''),
    isReference: true,
    isRemoteReference: true
  };
}

function saveProductReference_(reference) {
  if (!reference || !clean_(reference.name)) throw new Error('Project or kiosk name is required.');
  return withLock_(() => {
    const sheet = ensureSheet_(plannerSpreadsheet_(), PRODUCT_REFERENCE_SHEET, PRODUCT_REFERENCE_HEADERS);
    const id = String(reference.id || Utilities.getUuid());
    const rowNumber = findRow_(sheet, 1, id);
    const existing = rowNumber ? sheet.getRange(rowNumber, 1, 1, PRODUCT_REFERENCE_HEADERS.length).getValues()[0] : [];
    let driveFileId = String(existing[5] || reference.driveFileId || '');
    let driveUrl = String(existing[6] || reference.driveUrl || '');
    let imageName = String(existing[7] || reference.imageName || '');
    if (reference.imageDataUrl) {
      const uploaded = uploadReferenceImage_(reference.imageDataUrl, reference.imageName || ('brutti-reference-' + id + '.jpg'));
      if (driveFileId && driveFileId !== uploaded.id) trashDriveFile_(driveFileId);
      driveFileId = uploaded.id;
      driveUrl = uploaded.url;
      imageName = uploaded.name;
    } else if (reference.removeImage && driveFileId) {
      trashDriveFile_(driveFileId);
      driveFileId = '';
      driveUrl = '';
      imageName = '';
    }
    const values = [
      id,
      clean_(reference.name),
      clean_(reference.category || 'Kiosk / Project'),
      clean_(reference.location || ''),
      clean_(reference.notes || ''),
      driveFileId,
      driveUrl,
      imageName,
      new Date(),
      'BRUTTI shared kiosk / project reference'
    ];
    upsertRow_(sheet, rowNumber, values);
    logEvent_('save_product_reference', id, 'Success', reference.name);
    return productReferenceFromValues_(values);
  });
}

function deleteProductReference_(id) {
  return withLock_(() => {
    const sheet = ensureSheet_(plannerSpreadsheet_(), PRODUCT_REFERENCE_SHEET, PRODUCT_REFERENCE_HEADERS);
    const rowNumber = findRow_(sheet, 1, String(id));
    if (!rowNumber) throw new Error('Kiosk or project reference was not found.');
    const values = sheet.getRange(rowNumber, 1, 1, PRODUCT_REFERENCE_HEADERS.length).getValues()[0];
    if (values[5]) trashDriveFile_(String(values[5]));
    sheet.deleteRow(rowNumber);
    logEvent_('delete_product_reference', String(id), 'Success', 'Kiosk / project reference deleted');
    return { id: String(id) };
  });
}

function uploadReferenceImage_(dataUrl, fileName) {
  const match = String(dataUrl || '').match(/^data:(image\/(?:png|jpe?g|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) throw new Error('Use a PNG, JPG, WEBP or GIF image for the reference.');
  const bytes = Utilities.base64Decode(match[2].replace(/\s/g, ''));
  if (bytes.length > 1200000) throw new Error('Reference image must be 1.2 MB or smaller.');
  const safeName = clean_(fileName).replace(/[^a-z0-9._ -]/gi, '_') || ('brutti-reference-' + Utilities.getUuid() + '.jpg');
  const file = productReferenceFolder_().createFile(Utilities.newBlob(bytes, match[1].toLowerCase(), safeName));
  return { id: file.getId(), name: file.getName(), url: file.getUrl() };
}

function productReferenceFolder_() {
  const properties = scriptProperties_();
  const knownId = properties.getProperty('PRODUCT_REFERENCE_FOLDER_ID');
  if (knownId) {
    try { return DriveApp.getFolderById(knownId); } catch (error) { properties.deleteProperty('PRODUCT_REFERENCE_FOLDER_ID'); }
  }
  const rootId = properties.getProperty('DRIVE_ROOT_FOLDER_ID') || properties.getProperty('DRIVE_FOLDER_ID');
  if (!rootId) throw new Error('Google Drive folder is not configured for product references.');
  const folder = DriveApp.getFolderById(rootId).createFolder('BRUTTI Product References');
  properties.setProperty('PRODUCT_REFERENCE_FOLDER_ID', folder.getId());
  return folder;
}

function trashDriveFile_(fileId) {
  try { DriveApp.getFileById(fileId).setTrashed(true); } catch (error) { logEvent_('reference_image_delete', fileId, 'Warning', error.message); }
}

function driveImageUrl_(fileId) {
  return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(fileId) + '&sz=w1200';
}

function syncNotionProducts_() {
  const properties = scriptProperties_();
  const pageId = properties.getProperty('NOTION_PRODUCT_PAGE_ID');
  if (!properties.getProperty('NOTION_TOKEN') || !pageId) throw new Error('NOTION_TOKEN and NOTION_PRODUCT_PAGE_ID are required in Apps Script Properties.');
  const table = findNotionTable_(pageId, 0);
  if (!table) throw new Error('No product table was found on the configured Notion page.');
  const rows = notionChildren_(table.id).filter(block => block.type === 'table_row');
  const products = rows.slice(1).map((block, index) => {
    const cells = (block.table_row && block.table_row.cells) || [];
    const values = cells.map(notionCellText_);
    return [
      'BR-' + String(index + 1).padStart(3, '0'), clean_(values[1] || ''), clean_(values[2] || ''),
      clean_(values[3] || ''), clean_(values[4] || ''), clean_(values[5] || ''), clean_(values[6] || ''),
      clean_(values[7] || ''), 'Verified Notion source'
    ];
  }).filter(row => row[1]);
  const sheet = ensureSheet_(plannerSpreadsheet_(), PRODUCT_SHEET, PRODUCT_HEADERS);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, PRODUCT_HEADERS.length).setValues([PRODUCT_HEADERS]);
  if (products.length) sheet.getRange(2, 1, products.length, PRODUCT_HEADERS.length).setValues(products);
  logEvent_('sync_notion_products', '', 'Success', products.length + ' products synced');
  return { count: products.length, products: productRows_(sheet) };
}

function syncNotionPlanner_() {
  if (!notionPlannerConfigured_()) throw new Error('NOTION_TOKEN and NOTION_DAILY_PLANNER_DATABASE_ID are required in Apps Script Properties.');
  const sheet = ensureSheet_(plannerSpreadsheet_(), PLANNER_SHEET, PLANNER_HEADERS);
  if (sheet.getLastRow() < 2) return { count: 0 };
  const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, PLANNER_HEADERS.length);
  const rows = range.getValues();
  let count = 0;
  rows.forEach((row, index) => {
    try {
      const synced = upsertNotionPlan_(row);
      row[16] = synced.pageId || row[16];
      row[19] = 'Synced';
      row[20] = new Date();
      row[21] = '';
      row[22] = row[22] || row[5];
      count += 1;
    } catch (error) {
      row[19] = 'Error';
      row[20] = new Date();
      row[21] = clean_(error.message);
      row[22] = row[22] || row[5];
      logEvent_('notion_plan_sync', String(row[15] || ''), 'Error', error.message);
    }
    rows[index] = row;
  });
  range.setValues(rows);
  return { count: count };
}

function notionPlannerConfigured_() {
  const properties = scriptProperties_();
  return Boolean(properties.getProperty('NOTION_TOKEN') && properties.getProperty('NOTION_DAILY_PLANNER_DATABASE_ID'));
}

function upsertNotionPlan_(row) {
  const properties = scriptProperties_();
  const databaseId = properties.getProperty('NOTION_DAILY_PLANNER_DATABASE_ID');
  const pageId = String(row[16] || '');
  const statusMap = { Idea:'Draft', 'AI Generated':'Draft', Draft:'Draft', Review:'Review', Approved:'Approved', Rejected:'Rejected', Scheduled:'Scheduled', Published:'Published' };
  const languageMap = { 'BM + English':'Bahasa Melayu + English', 'Bahasa Melayu + English':'Bahasa Melayu + English', English:'English', 'Bahasa Melayu':'Bahasa Melayu' };
  const props = {
    'Name': notionTitle_(row[22] || row[5]),
    'Content Date': { date: { start: formatDate_(row[0]) } },
    'Platform': { select: { name: String(row[1] || 'Facebook') } },
    'Content Type': { select: { name: 'Facebook Post' } },
    'Product Name': notionText_(row[3]),
    'Objective': notionText_(row[4]),
    'Key Message': notionText_(row[5]),
    'Promotion': notionText_(row[6]),
    'Language': { select: { name: languageMap[String(row[7] || '')] || 'Bahasa Melayu' } },
    'Generated Content': notionText_(row[8]),
    'Status': { select: { name: statusMap[String(row[9] || '')] || 'Draft' } },
    'Approval Notes': notionText_(row[10]),
    'Approved Date': row[11] ? { date: { start: formatIso_(row[11]) } } : { date: null },
    'Published Date': row[12] ? { date: { start: formatIso_(row[12]) } } : { date: null },
    'Drive Link': { url: row[13] ? String(row[13]) : null },
    'Publish Link': { url: row[14] ? String(row[14]) : null },
    'Request ID': notionText_(row[15]),
    'Source': { select: { name: 'BRUTTI AI Marketing Hub' } },
    'Website Action': { select: { name: ['Add','Edit','Save','Approve','Reject','Publish','Delete'].indexOf(String(row[18])) >= 0 ? String(row[18]) : 'Save' } },
    'Website Sync Status': { select: { name: 'Synced' } },
    'Last Website Update': { date: { start: new Date().toISOString() } }
  };
  if (pageId) {
    notionRequest_('/v1/pages/' + encodeURIComponent(pageId), 'patch', { properties: props, archived: false });
    return { pageId: pageId };
  }
  const created = notionRequest_('/v1/pages', 'post', { parent: { database_id: databaseId }, properties: props });
  return { pageId: created.id };
}

function notionRequest_(endpoint, method, payload) {
  const token = scriptProperties_().getProperty('NOTION_TOKEN');
  if (!token) throw new Error('NOTION_TOKEN is not configured.');
  const options = {
    method: method || 'get',
    headers: { Authorization: 'Bearer ' + token, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    muteHttpExceptions: true
  };
  if (payload !== undefined) options.payload = JSON.stringify(payload);
  const response = UrlFetchApp.fetch('https://api.notion.com' + endpoint, options);
  const body = JSON.parse(response.getContentText() || '{}');
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
    throw new Error((body && body.message) || 'Notion request failed (' + response.getResponseCode() + ').');
  }
  return body;
}

function notionChildren_(blockId) {
  let cursor = '';
  const results = [];
  do {
    const query = cursor ? '?page_size=100&start_cursor=' + encodeURIComponent(cursor) : '?page_size=100';
    const body = notionRequest_('/v1/blocks/' + encodeURIComponent(blockId) + '/children' + query, 'get');
    (body.results || []).forEach(item => results.push(item));
    cursor = body.has_more ? body.next_cursor : '';
  } while (cursor);
  return results;
}

function findNotionTable_(blockId, depth) {
  if (depth > 4) return null;
  const children = notionChildren_(blockId);
  for (let i = 0; i < children.length; i += 1) if (children[i].type === 'table') return children[i];
  for (let i = 0; i < children.length; i += 1) {
    if (children[i].has_children) {
      const found = findNotionTable_(children[i].id, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function notionCellText_(richText) {
  return (richText || []).map(item => item.plain_text || (item.text && item.text.content) || '').join('').trim();
}

function notionText_(value) {
  const content = clean_(value).substring(0, 1900);
  return { rich_text: content ? [{ type:'text', text:{ content:content } }] : [] };
}

function notionTitle_(value) {
  const content = clean_(value).substring(0, 1900) || 'Untitled BRUTTI content';
  return { title: [{ type:'text', text:{ content:content } }] };
}

function metaPermalink_(objectId, version, token) {
  try {
    const url = 'https://graph.facebook.com/' + encodeURIComponent(version) + '/' + encodeURIComponent(objectId) + '?fields=permalink_url&access_token=' + encodeURIComponent(token);
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions:true });
    const body = JSON.parse(response.getContentText() || '{}');
    return body.permalink_url || '';
  } catch (ignored) {
    return '';
  }
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
    publishLink: String(row[14] || ''),
    notionPageId: String(row[16] || ''),
    source: String(row[17] || ''),
    websiteAction: String(row[18] || ''),
    websiteSyncStatus: String(row[19] || ''),
    lastWebsiteUpdate: formatIso_(row[20]),
    syncError: String(row[21] || ''),
    name: String(row[22] || row[5] || '')
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
  applyKnownResourceDefaults_();
  const id = scriptProperties_().getProperty('PLANNER_SPREADSHEET_ID');
  if (!id) throw new Error('PLANNER_SPREADSHEET_ID is not configured in Apps Script Properties.');
  return SpreadsheetApp.openById(id);
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
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
