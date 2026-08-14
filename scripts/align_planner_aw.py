from pathlib import Path
import re

path = Path('apps-script/Code.gs')
text = path.read_text()


def replace_once(old, new):
    global text
    if old not in text:
        raise SystemExit('Missing expected text: ' + old[:180])
    text = text.replace(old, new, 1)

# Extend planner schema from A:U to A:W to match the live BRUTTI DAILY CONTENT PLANNER.
replace_once(
    "  'Website Sync Status', 'Last Website Update'\n];",
    "  'Website Sync Status', 'Last Website Update', 'Sync Error', 'Name'\n];"
)

# Extend savePlan_ values with Sync Error (V) and Name (W).
replace_once(
    "      'Synced',\n      now\n    ];",
    "      'Synced',\n      now,\n      clean_(existing[21] || ''),\n      clean_(plan.name || plan.title || existing[22] || '')\n    ];"
)

# Keep V/W accurate during direct Notion sync inside savePlan_.
replace_once(
    "        values[16] = synced.pageId || values[16];\n        values[19] = 'Synced';",
    "        values[16] = synced.pageId || values[16];\n        values[19] = 'Synced';\n        values[21] = '';\n        values[22] = values[22] || values[5];"
)
replace_once(
    "        values[19] = 'Error';\n        logEvent_('notion_plan_sync', id, 'Error', error.message);",
    "        values[19] = 'Error';\n        values[21] = clean_(error.message);\n        values[22] = values[22] || values[5];\n        logEvent_('notion_plan_sync', id, 'Error', error.message);"
)

# Bulk planner sync: clear/write Sync Error and ensure Name remains populated.
replace_once(
    "      row[16] = synced.pageId || row[16];\n      row[19] = 'Synced';\n      row[20] = new Date();\n      count += 1;",
    "      row[16] = synced.pageId || row[16];\n      row[19] = 'Synced';\n      row[20] = new Date();\n      row[21] = '';\n      row[22] = row[22] || row[5];\n      count += 1;"
)
replace_once(
    "      row[19] = 'Error';\n      logEvent_('notion_plan_sync', String(row[15] || ''), 'Error', error.message);",
    "      row[19] = 'Error';\n      row[20] = new Date();\n      row[21] = clean_(error.message);\n      row[22] = row[22] || row[5];\n      logEvent_('notion_plan_sync', String(row[15] || ''), 'Error', error.message);"
)

# Notion title must mirror W Name without changing F Key Message.
replace_once(
    "    'Name': notionTitle_(row[5]),",
    "    'Name': notionTitle_(row[22] || row[5]),"
)

# Expose sync metadata to frontend/workspace reads.
replace_once(
    "    approvalNotes: String(row[10] || ''),\n    driveLink: String(row[13] || ''),\n    publishLink: String(row[14] || '')",
    "    approvalNotes: String(row[10] || ''),\n    driveLink: String(row[13] || ''),\n    publishLink: String(row[14] || ''),\n    notionPageId: String(row[16] || ''),\n    source: String(row[17] || ''),\n    websiteAction: String(row[18] || ''),\n    websiteSyncStatus: String(row[19] || ''),\n    lastWebsiteUpdate: formatIso_(row[20]),\n    syncError: String(row[21] || ''),\n    name: String(row[22] || row[5] || '')"
)

# Add a stricter A:W schema check to the Sheets connection probe.
replace_once(
    "      const requiredTabs = [PLANNER_SHEET, CONTENT_SHEET, LOG_SHEET];",
    "      const requiredTabs = [PLANNER_SHEET, CONTENT_SHEET, LOG_SHEET];\n      const planner = spreadsheet.getSheetByName(PLANNER_SHEET);\n      const plannerHeaders = planner ? planner.getRange(1, 1, 1, PLANNER_HEADERS.length).getDisplayValues()[0] : [];\n      const plannerSchemaMatches = plannerHeaders.join('|') === PLANNER_HEADERS.join('|');"
)
replace_once(
    "        connected: missingTabs.length === 0,",
    "        connected: missingTabs.length === 0 && plannerSchemaMatches,"
)
replace_once(
    "        missingTabs: missingTabs",
    "        missingTabs: missingTabs,\n        plannerSchemaMatches: plannerSchemaMatches,\n        plannerColumns: PLANNER_HEADERS.length"
)

path.write_text(text)
