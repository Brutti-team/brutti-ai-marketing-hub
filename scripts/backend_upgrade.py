from pathlib import Path
import re

path = Path('apps-script/Code.gs')
text = path.read_text()

def must_replace(old, new, count=1):
    global text
    if old not in text:
        raise SystemExit('Missing expected backend pattern: ' + old[:140])
    text = text.replace(old, new, count)

def replace_block(start, end, replacement):
    global text
    pattern = re.compile(re.escape(start) + r'.*?(?=' + re.escape(end) + r')', re.S)
    updated, n = pattern.subn(replacement + '\n\n', text, count=1)
    if n != 1:
        raise SystemExit('Could not replace backend block: ' + start)
    text = updated

must_replace("const LOG_SHEET = 'Integration Log';", "const LOG_SHEET = 'Integration Log';\nconst PRODUCT_SHEET = 'Product Library';")
must_replace("  'Published At', 'Publish Link', 'Source'\n];", "  'Published At', 'Publish Link', 'Source', 'Drive File ID', 'Asset Name'\n];")
must_replace("const LOG_HEADERS = ['Timestamp', 'Action', 'Record ID', 'Status', 'Message', 'Actor', 'Source'];", "const LOG_HEADERS = ['Timestamp', 'Action', 'Record ID', 'Status', 'Message', 'Actor', 'Source'];\nconst PRODUCT_HEADERS = ['ID', 'Product Name', 'Category', 'Price', 'Material', 'Dimensions', 'Colour', 'Status', 'Source'];")
must_replace("      list_drive_assets: listDriveAssets_,\n      publish_meta: () => publishMeta_(payload.contentId)", "      list_drive_assets: listDriveAssets_,\n      sync_notion_products: syncNotionProducts_,\n      sync_notion_planner: syncNotionPlanner_,\n      publish_meta: () => publishMeta_(payload.contentId)")
must_replace("  ensureSheet_(spreadsheet, LOG_SHEET, LOG_HEADERS);", "  ensureSheet_(spreadsheet, LOG_SHEET, LOG_HEADERS);\n  ensureSheet_(spreadsheet, PRODUCT_SHEET, PRODUCT_HEADERS);")

status_block = '''function integrationStatus_() {
  const properties = scriptProperties_();
  const notionToken = properties.getProperty('NOTION_TOKEN');
  return {
    appsScript: true,
    sheets: Boolean(properties.getProperty('PLANNER_SPREADSHEET_ID')),
    drive: Boolean(properties.getProperty('DRIVE_FOLDER_ID')),
    notion: Boolean(notionToken && (properties.getProperty('NOTION_PRODUCT_PAGE_ID') || properties.getProperty('NOTION_DAILY_PLANNER_DATABASE_ID'))),
    meta: Boolean(properties.getProperty('META_PAGE_ID') && properties.getProperty('META_PAGE_ACCESS_TOKEN') && properties.getProperty('META_GRAPH_VERSION'))
  };
}'''
replace_block('function integrationStatus_()', 'function loadWorkspace_()', status_block)

load_block = '''function loadWorkspace_() {
  const spreadsheet = plannerSpreadsheet_();
  const contentSheet = ensureSheet_(spreadsheet, CONTENT_SHEET, CONTENT_HEADERS);
  const plannerSheet = ensureSheet_(spreadsheet, PLANNER_SHEET, PLANNER_HEADERS);
  const productSheet = ensureSheet_(spreadsheet, PRODUCT_SHEET, PRODUCT_HEADERS);
  return {
    content: contentRows_(contentSheet),
    plans: planRows_(plannerSheet),
    products: productRows_(productSheet)
  };
}'''
replace_block('function loadWorkspace_()', 'function saveContent_(', load_block)

must_replace("      clean_(item.publishLink || existing[13] || ''),\n      'BRUTTI AI Marketing Hub'", "      clean_(item.publishLink || existing[13] || ''),\n      'BRUTTI AI Marketing Hub',\n      clean_(item.driveFileId || existing[15] || ''),\n      clean_(item.assetName || existing[16] || '')")

save_plan = '''function savePlan_(plan) {
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
      now
    ];
    if (notionPlannerConfigured_()) {
      try {
        const synced = upsertNotionPlan_(values);
        values[16] = synced.pageId || values[16];
        values[19] = 'Synced';
      } catch (error) {
        values[19] = 'Error';
        logEvent_('notion_plan_sync', id, 'Error', error.message);
      }
    }
    upsertRow_(sheet, rowNumber, values);
    logEvent_('save_plan', id, 'Success', plan.status || 'Idea');
    return planFromValues_(values, rowNumber || sheet.getLastRow());
  });
}'''
replace_block('function savePlan_(', 'function deletePlan_(', save_plan)

delete_plan = '''function deletePlan_(id) {
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
}'''
replace_block('function deletePlan_(', 'function listDriveAssets_(', delete_plan)

publish = '''function publishMeta_(contentId) {
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
}'''
replace_block('function publishMeta_(', 'function contentRows_(', publish)

must_replace("    approvedAt: formatIso_(row[11]), publishedAt: formatIso_(row[12]), publishLink: String(row[13] || '')\n  };", "    approvedAt: formatIso_(row[11]), publishedAt: formatIso_(row[12]), publishLink: String(row[13] || ''),\n    driveFileId: String(row[15] || ''), assetName: String(row[16] || '')\n  };")

product_functions = '''function productRows_(sheet) {
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
      count += 1;
    } catch (error) {
      row[19] = 'Error';
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
    'Name': notionTitle_(row[5]),
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
'''
must_replace('function planRows_(sheet) {', product_functions + '\nfunction planRows_(sheet) {')

ensure = '''function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}'''
replace_block('function ensureSheet_(', 'function upsertRow_(', ensure)

path.write_text(text)

readme = Path('README.md')
r = readme.read_text()
r = r.replace("- **Google Apps Script** protects the workspace key and runs Drive, Sheets and eventual Meta API actions.", "- **Google Apps Script** protects the workspace key and runs Drive, Sheets, optional Notion sync and Meta publishing actions.")
r = r.replace("   - `META_PAGE_ID` — optional until Meta publishing is activated", "   - `NOTION_TOKEN` — optional; secret integration token for direct Product/Planner sync\n   - `NOTION_PRODUCT_PAGE_ID` — optional; Notion page containing the 2.1 Product Database table\n   - `NOTION_DAILY_PLANNER_DATABASE_ID` — optional; BRUTTI DAILY CONTENT PLANNER database ID\n   - `META_PAGE_ID` — optional until Meta publishing is activated")
r = r.replace("- Content Library with Edit, Approve, Reject and approval-gated Facebook publishing", "- Content Library with Edit, Approve, Reject and approval-gated Facebook text/photo publishing")
r = r.replace("- Campaign Planner with add, edit and delete controls", "- Dynamic weekly Campaign Planner with current-week navigation, add/edit/delete controls and optional direct Notion sync")
r = r.replace("- Brand, Product and Google Drive asset libraries", "- Brand, Product and Google Drive asset libraries, including secure Notion product import and Drive visual attachment")
readme.write_text(r)
