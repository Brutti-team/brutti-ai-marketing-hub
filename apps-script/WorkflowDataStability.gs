function auditPlannerRequestIds() {
  const sheet = ensureSheet_(plannerSpreadsheet_(), PLANNER_SHEET, PLANNER_HEADERS);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { rows: 0, missingRequestIds: 0 };

  const values = sheet.getRange(2, 1, lastRow - 1, PLANNER_HEADERS.length).getValues();
  const missingRows = [];

  values.forEach((row, index) => {
    const hasContent = row.some(value => String(value || '').trim());
    const requestId = String(row[15] || '').trim();
    if (hasContent && !requestId) missingRows.push(index + 2);
  });

  return {
    rows: values.length,
    missingRequestIds: missingRows.length,
    missingRows
  };
}

function repairPlannerRequestIds() {
  return withLock_(() => {
    const sheet = ensureSheet_(plannerSpreadsheet_(), PLANNER_SHEET, PLANNER_HEADERS);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { updated: 0, remainingMissing: 0 };

    const range = sheet.getRange(2, 1, lastRow - 1, PLANNER_HEADERS.length);
    const values = range.getValues();
    let updated = 0;

    values.forEach(row => {
      const hasContent = row.some(value => String(value || '').trim());
      if (hasContent && !String(row[15] || '').trim()) {
        row[15] = Utilities.getUuid();
        updated += 1;
      }
    });

    if (updated) range.setValues(values);
    const audit = auditPlannerRequestIds();
    logEvent_('repair_plan_ids', '', 'Success', updated + ' planner Request IDs created');

    return {
      updated,
      remainingMissing: audit.missingRequestIds,
      missingRows: audit.missingRows
    };
  });
}
