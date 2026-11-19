const MARKETING_TOOLS_SHEET = 'Marketing Tools';
const MARKETING_TOOLS_HEADERS = ['ID', 'Campaign Name', 'Tool', 'Brand', 'Location/Platform', 'Start Date', 'End Date', 'Cost (RM)', 'Status', 'Notes', 'Created At', 'Updated At', 'Cost Note', 'TikTok', 'Instagram', 'Facebook', 'YouTube', 'Phone', 'Image File ID', 'Image URL'];
const MARKETING_TOOL_TYPES = ['Bunting', 'Billboard', 'KOL'];
const MARKETING_TOOL_STATUSES = ['Idea', 'In Progress', 'Live', 'Done'];

function marketingToolsSheet_() {
  const sheet = ensureSheet_(plannerSpreadsheet_(), MARKETING_TOOLS_SHEET, MARKETING_TOOLS_HEADERS);
  // v3/v4: add missing headers to an older tab (v3 KOL contacts N:R, v4 image S:T). Existing data is untouched.
  if (sheet.getMaxColumns() < MARKETING_TOOLS_HEADERS.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), MARKETING_TOOLS_HEADERS.length - sheet.getMaxColumns());
  const header = sheet.getRange(1, 1, 1, MARKETING_TOOLS_HEADERS.length).getDisplayValues()[0];
  if (MARKETING_TOOLS_HEADERS.some((name, i) => header[i] !== name && !header[i])) {
    sheet.getRange(1, 1, 1, MARKETING_TOOLS_HEADERS.length).setValues([MARKETING_TOOLS_HEADERS]);
  }
  // Plain text so dates and IDs stay exactly as typed.
  sheet.getRange(1, 1, sheet.getMaxRows(), MARKETING_TOOLS_HEADERS.length).setNumberFormat('@');
  return sheet;
}

function marketingToolFromValues_(row) {
  return {
    id: String(row[0] || ''), name: String(row[1] || ''), tool: String(row[2] || ''), brand: String(row[3] || ''),
    location: String(row[4] || ''), startDate: String(row[5] || ''), endDate: String(row[6] || ''),
    cost: Number(row[7]) || 0, status: String(row[8] || 'Idea'), notes: String(row[9] || ''),
    createdAt: String(row[10] || ''), updatedAt: String(row[11] || ''), costNote: String(row[12] || ''),
    tiktok: String(row[13] || ''), instagram: String(row[14] || ''), facebook: String(row[15] || ''),
    youtube: String(row[16] || ''), phone: String(row[17] || ''),
    imageFileId: String(row[18] || ''), imageUrl: String(row[19] || '')
  };
}

function listMarketingTools_() {
  const sheet = marketingToolsSheet_();
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, MARKETING_TOOLS_HEADERS.length).getDisplayValues()
    .filter((row) => row[0]).map(marketingToolFromValues_);
}

function saveMarketingTool_(record, isCreate) {
  if (!record || !clean_(record.name)) throw new Error('Campaign name is required.');
  const tool = clean_(record.tool);
  if (MARKETING_TOOL_TYPES.indexOf(tool) < 0) throw new Error('Tool must be Bunting, Billboard or KOL.');
  const status = clean_(record.status || 'Idea');
  if (MARKETING_TOOL_STATUSES.indexOf(status) < 0) throw new Error('Status must be Idea, In Progress, Live or Done.');
  const cost = Number(record.cost) || 0;
  if (cost < 0) throw new Error('Cost cannot be negative.');
  return withLock_(() => {
    const sheet = marketingToolsSheet_();
    let id = clean_(record.id);
    let rowNumber = id ? findRow_(sheet, 1, id) : 0;
    if (!isCreate && !rowNumber) throw new Error('Marketing Tools record was not found.');
    if (isCreate) {
      if (rowNumber) throw new Error('Marketing Tools record already exists.');
      if (!id) id = 'mt-' + Utilities.getUuid();
    }
    const existing = rowNumber ? sheet.getRange(rowNumber, 1, 1, MARKETING_TOOLS_HEADERS.length).getDisplayValues()[0] : [];
    // v4: optional KOL image in Drive (S = file ID, T = <img>-friendly URL).
    // Keep existing values unless a new image (imageDataUrl) or removeImage is sent.
    let imageFileId = String(existing[18] || '');
    let imageUrl = String(existing[19] || '');
    if (record.imageDataUrl) {
      const uploaded = uploadReferenceImage_(record.imageDataUrl, 'kol-' + id + '.jpg');
      if (imageFileId && imageFileId !== uploaded.id) trashDriveFile_(imageFileId);
      imageFileId = uploaded.id;
      imageUrl = driveImageUrl_(uploaded.id);
    } else if (record.removeImage) {
      if (imageFileId) trashDriveFile_(imageFileId);
      imageFileId = '';
      imageUrl = '';
    }
    const now = Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', "yyyy-MM-dd'T'HH:mm:ssXXX");
    const values = [id, clean_(record.name), tool, clean_(record.brand) || 'Brutti', clean_(record.location),
      clean_(record.startDate), clean_(record.endDate), String(cost), status, clean_(record.notes),
      existing[10] || clean_(record.createdAt) || now, now, clean_(record.costNote),
      clean_(record.tiktok), clean_(record.instagram), clean_(record.facebook), clean_(record.youtube), clean_(record.phone),
      imageFileId, imageUrl];
    const target = upsertRow_(sheet, rowNumber, values);
    sheet.getRange(target, 1, 1, values.length).setNumberFormat('@');
    logEvent_(isCreate ? 'create_marketing_tool' : 'update_marketing_tool', id, 'Success', tool + ' / ' + status + (imageFileId ? ' / image' : ''));
    return marketingToolFromValues_(values);
  });
}

function deleteMarketingTool_(id) {
  return withLock_(() => {
    const sheet = marketingToolsSheet_();
    const rowNumber = id ? findRow_(sheet, 1, String(id)) : 0;
    if (!rowNumber) throw new Error('Marketing Tools record was not found.');
    sheet.deleteRow(rowNumber);
    logEvent_('delete_marketing_tool', String(id), 'Success', 'Marketing Tools row deleted');
    return { id: String(id) };
  });
}
