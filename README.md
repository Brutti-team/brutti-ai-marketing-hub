# BRUTTI AI Marketing Hub

An AI-first internal marketing workspace for BRUTTI, a Sabah-based custom furniture and interior brand.

## What this version includes

- Premium responsive dashboard using BRUTTI's forest-green, cream and terracotta direction
- Content Studio with BM, English and bilingual local preview generation
- Content Library with Edit, Approve, Reject and Mark Published actions
- Review pipeline: Idea → Draft → AI Generated → Review → Approved → Scheduled → Published → Archived
- Campaign Planner with add, edit and delete controls
- Brand, Product and Asset libraries
- AI Prompt Library covering writing, video, customer service and creative tasks
- Verified Facebook activity snapshot without fabricated Meta KPI
- Browser persistence for content and planner changes
- Explicit integration states for Notion, Make, Google Drive and Meta/Facebook

## Accuracy and integration boundaries

This repository currently runs as a frontend application. Content and planner changes are stored in the browser and do not yet update Notion, Make, Google Drive or Facebook.

The following require authenticated backend/API connections before they can be treated as live:

- Notion bidirectional database sync
- Make automation execution and status callbacks
- Google Drive asset retrieval
- Direct Facebook publishing
- Live Meta Insights KPI

The interface does not fabricate prices, promotions, availability, delivery dates, specifications or social-performance KPI. Generated copy remains review-first.

## Local development

```bash
npm install
npm run dev
```

Validation:

```bash
npm run check
npm run build
```

## Deployment

The included GitHub Actions workflow builds the Vite app and deploys `dist` to GitHub Pages whenever `main` is updated.
