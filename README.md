# BRUTTI AI Marketing Hub

An AI-first internal marketing workspace for BRUTTI, a Sabah-based custom furniture and interior brand.

## What ChatGPT / AI does in this website

The website does not log in to a personal ChatGPT account. Google Apps Script securely calls the OpenAI Responses API using a separate API key. The AI layer can:

- generate Facebook drafts in BM, English or bilingual format from verified facts
- review copy for unsupported prices, promotions, delivery claims, specifications and KPI
- suggest daily and weekly content directions
- turn approved product information into reusable content
- prepare planner records and content drafts for Google Sheets
- support Meta publishing after a human marks content `Approved`

Google remains the operational source of truth:

- **Google Sheets** stores Content Library, Daily Planner and Integration Log records.
- **Google Drive** stores approved logos, photos, source exports and brand assets.
- **Google Apps Script** protects credentials and runs OpenAI, Drive, Sheets and eventual Meta API actions.
- **GitHub Pages** displays the website only; it never receives private API keys.

ChatGPT Plus and OpenAI API billing are separate. If the OpenAI API is not configured, the website keeps a local rule-based preview but does not claim that it is a live AI result.

## Included workflow

- Content Studio with live AI generation when Apps Script and OpenAI are connected
- Content Library with Edit, Approve, Reject and approval-gated Facebook publishing
- Review pipeline: Idea → Draft → AI Generated → Review → Approved → Scheduled → Published → Archived
- Campaign Planner with add, edit and delete controls
- Brand, Product and Google Drive asset libraries
- AI Prompt Library for writing, video, customer service and creative tasks
- Verified Facebook activity snapshot without fabricated Meta KPI
- Session-only internal workspace key; it is never committed or built into the site
- Browser fallback when the Google backend is not connected

## Google Apps Script setup

The backend source is in `apps-script/Code.gs` and `apps-script/appsscript.json`.

1. Open Google Apps Script and create a standalone project named `BRUTTI AI Marketing Backend`.
2. Replace `Code.gs` with the repository version.
3. Enable manifest editing in Project Settings and replace `appsscript.json` with the repository version.
4. In **Project Settings → Script Properties**, add:

   - `WORKSPACE_KEY` — a long random internal key shared only with approved staff
   - `PLANNER_SPREADSHEET_ID` — spreadsheet ID for `BRUTTI DAILY CONTENT PLANNER`
   - `DRIVE_FOLDER_ID` — folder ID for the approved BRUTTI asset folder
   - `OPENAI_API_KEY` — optional until live AI is activated
   - `OPENAI_MODEL` — model selected for content generation
   - `META_PAGE_ID` — optional until Meta publishing is activated
   - `META_PAGE_ACCESS_TOKEN` — optional until Meta publishing is activated
   - `META_GRAPH_VERSION` — required with the Meta connection

5. Run `setupBruttiWorkspace()` once and approve the requested Google permissions.
6. Select **Deploy → New deployment → Web app**:

   - Execute as: `Me`
   - Who has access: `Anyone`

7. Copy the final `/exec` URL. Add it to GitHub repository variables as `VITE_APPS_SCRIPT_URL`.
8. Redeploy the website, open Settings, and enter `WORKSPACE_KEY` for the current browser session.

The web app URL is public because GitHub Pages must reach it, but every operational POST request requires the separate workspace key. Never place that key or another private credential in GitHub variables, Vite environment files, screenshots or chat messages.

## Existing Google structure

The backend preserves the current `Daily Planner` columns and uses these additional tabs in `BRUTTI DAILY CONTENT PLANNER`:

- `Content Library` — draft, approval and publishing records
- `Integration Log` — timestamped AI, Sheet, Drive and Meta actions

The existing `BRUTTI AI MARKETING MASTER DATA`, `BRUTTI Website & Make Sync Mapping`, `BRUTTI Sync` workflow and Drive folder structure remain separate and are not deleted.

## Accuracy boundaries

- AI receives only the verified facts entered in the website.
- Content stays review-first; Meta publishing requires the `Approved` stage.
- The system does not fabricate prices, promotions, availability, delivery dates, specifications or social-performance KPI.
- Live Meta analytics remain blank until real Meta data is connected.

## Local development and validation

```bash
npm install
npm run dev
```

```bash
npm run check
npm run build
```

## Deployment

The GitHub Actions workflow validates and builds the Vite app. Pushes to `main` deploy `dist` to GitHub Pages.
