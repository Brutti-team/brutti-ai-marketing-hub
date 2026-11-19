/**
 * KOL Sabah directory (read-only).
 * Add as a new script file "KolSabah" in Apps Script project
 * 1fTZUb_f9JTXAN5uhneKtql-yFgAKby1cCXz7P-jQp7IWXCqJqPLDb4fZ, then register
 *   list_kol_sabah: listKolSabah_,
 * in the action map in Code.gs, right below `list_marketing_tools: listMarketingTools_,`.
 */
const KOL_SABAH_SPREADSHEET_ID = '10o2HcCKqbkcvTPx58MKiKG2bx6cnvBtuJULEIEWG8xQ';
const KOL_SABAH_SHEET_NAME = 'KOL Sabah';
const KOL_SABAH_SHEET_GID = 427640740;
const KOL_SABAH_FIELDS = ['name', 'handle', 'niche', 'location', 'tiktok', 'instagram', 'facebook', 'youtube', 'followers', 'businessContact', 'source', 'notes'];

function kolSabahSheet_() {
  const spreadsheet = SpreadsheetApp.openById(KOL_SABAH_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(KOL_SABAH_SHEET_NAME)
    || spreadsheet.getSheets().filter((s) => s.getSheetId() === KOL_SABAH_SHEET_GID)[0];
  if (!sheet) throw new Error('The "KOL Sabah" tab was not found.');
  return sheet;
}

function listKolSabah_() {
  const sheet = kolSabahSheet_();
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, KOL_SABAH_FIELDS.length).getDisplayValues()
    .filter((row) => String(row[0] || '').trim())
    .map((row) => {
      const kol = {};
      KOL_SABAH_FIELDS.forEach((field, index) => { kol[field] = String(row[index] || '').trim(); });
      return kol;
    });
}
