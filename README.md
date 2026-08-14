# BRUTTI AI Marketing Hub

An internal marketing workspace for BRUTTI, a Sabah-based custom furniture and interior brand, with a zero-cost AI Assist workflow.

## Free AI Assist Mode

The production website does not call a paid AI API and does not require staff to open a separate AI platform. Instead it provides a no-cost assisted workflow:

- generate a structured Facebook draft from BRUTTI templates and verified facts
- refine captions inside the website with More Engaging, Casual, Professional, Shorten, New Hook, New CTA and Refresh Hashtags controls
- provide three Brutti-style variations for every verified direction
- run rule-based checks for Brutti Facebook style, readability, CTA, hashtag discipline and unsupported claims
- save drafts and planner records to Google Sheets
- require human approval before any future Meta publishing

Google remains the operational source of truth:

- **Google Sheets** stores Content Library, Daily Planner and Integration Log records.
- **Google Drive** stores approved logos, photos, source exports and brand assets.
- **Google Apps Script** protects the workspace key and runs Drive, Sheets and eventual Meta API actions.
- **GitHub Pages** displays the website only; it never receives private API keys.

Free Smart Rewrite is deterministic rather than generative AI: it combines verified facts with controlled BRUTTI Facebook writing patterns. This keeps the workflow free and consistent, while human review remains the final approval step.

## Included workflow

- Content Studio with free structured drafts, internal Smart Rewrite controls, three caption variations and Brutti style checks
- Content Library with Edit, Approve, Reject and approval-gated Facebook publishing
- Review pipeline: Idea → Draft → Review → Approved → Scheduled → Published → Archived
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
- `Integration Log` — timestamped Sheet, Drive and Meta actions

The existing `BRUTTI AI MARKETING MASTER DATA`, `BRUTTI Website & Make Sync Mapping`, `BRUTTI Sync` workflow and Drive folder structure remain separate and are not deleted.

## Accuracy boundaries

- Template drafts and Smart Rewrite receive only the verified facts entered in the website.
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
