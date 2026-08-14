from pathlib import Path
import re

path = Path('apps-script/Code.gs')
text = path.read_text()


def replace_once(old, new):
    global text
    if old not in text:
        raise SystemExit('Missing expected text: ' + old[:180])
    text = text.replace(old, new, 1)


def replace_function(start_sig, next_sig, replacement):
    global text
    pattern = re.compile(re.escape(start_sig) + r'.*?(?=' + re.escape(next_sig) + r')', re.S)
    updated, count = pattern.subn(lambda _: replacement + '\n\n', text, count=1)
    if count != 1:
        raise SystemExit('Could not replace function: ' + start_sig)
    text = updated


replace_once(
    "const PRODUCT_SHEET = 'Product Library';",
    "const PRODUCT_SHEET = 'Product Library';\n\nconst BRUTTI_RESOURCE_IDS = {\n  plannerSpreadsheet: '10o2HcCKqbkcvTPx58MKiKG2bx6cnvBtuJULEIEWG8xQ',\n  driveRootFolder: '1V3AIjXMqIWU5mi6tG2m4UzDGv1rhBqgO',\n  driveAssetFolder: '17klllaMxznv8IiRUwggEVUsbQ_qcSNFU',\n  notionProductPage: '3b35a38f-1fa4-8034-bfc4-f9fad18eed8b',\n  notionPlannerDatabase: 'aa9bba50-17fd-4d27-9bbb-82a2247424d4'\n};"
)

replace_once(
    "      integration_status: integrationStatus_,",
    "      integration_status: integrationStatus_,\n      test_integrations: testIntegrations_,\n      configure_resources: configureKnownResources_,"
)

setup = '''function setupBruttiWorkspace() {
  applyKnownResourceDefaults_();
  const spreadsheet = plannerSpreadsheet_();
  ensureSheet_(spreadsheet, CONTENT_SHEET, CONTENT_HEADERS);
  ensureSheet_(spreadsheet, PLANNER_SHEET, PLANNER_HEADERS);
  ensureSheet_(spreadsheet, LOG_SHEET, LOG_HEADERS);
  ensureSheet_(spreadsheet, PRODUCT_SHEET, PRODUCT_HEADERS);
  const tests = testIntegrations_();
  return JSON.stringify({
    message: 'BRUTTI Google workspace setup completed.',
    spreadsheetUrl: spreadsheet.getUrl(),
    integrations: tests
  });
}'''
replace_function('function setupBruttiWorkspace() {', 'function integrationStatus_() {', setup)

integration = '''function integrationStatus_() {
  const tests = testIntegrations_();
  const properties = scriptProperties_();
  return {
    appsScript: true,
    sheets: Boolean(tests.sheets && tests.sheets.connected),
    drive: Boolean(tests.drive && tests.drive.connected),
    notion: Boolean(tests.notion && tests.notion.connected),
    meta: Boolean(properties.getProperty('META_PAGE_ID') && properties.getProperty('META_PAGE_ACCESS_TOKEN') && properties.getProperty('META_GRAPH_VERSION')),
    details: tests
  };
}'''
replace_function('function integrationStatus_() {', 'function loadWorkspace_() {', integration)

connection_helpers = r'''function applyKnownResourceDefaults_() {
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
      const existingTabs = spreadsheet.getSheets().map(sheet => sheet.getName());
      const missingTabs = requiredTabs.filter(name => existingTabs.indexOf(name) < 0);
      result.sheets = {
        connected: missingTabs.length === 0,
        configured: true,
        id: spreadsheetId,
        name: spreadsheet.getName(),
        url: spreadsheet.getUrl(),
        tabs: existingTabs,
        missingTabs: missingTabs
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
}'''

marker = 'function listDriveAssets_() {'
if connection_helpers not in text:
    if marker not in text:
        raise SystemExit('Missing listDriveAssets marker')
    text = text.replace(marker, connection_helpers + '\n\n' + marker, 1)

list_drive = '''function listDriveAssets_() {
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
}'''
replace_function('function listDriveAssets_() {', 'function publishMeta_(contentId) {', list_drive)

# Ensure spreadsheet helper applies safe resource defaults even when called directly.
replace_once(
    "function plannerSpreadsheet_() {\n  const id = scriptProperties_().getProperty('PLANNER_SPREADSHEET_ID');",
    "function plannerSpreadsheet_() {\n  applyKnownResourceDefaults_();\n  const id = scriptProperties_().getProperty('PLANNER_SPREADSHEET_ID');"
)

path.write_text(text)
