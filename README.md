# BRUTTI AI Marketing Hub

An AI-first internal marketing workspace for BRUTTI, a Sabah-based custom furniture and interior brand.

## What this version includes

- Premium responsive dashboard using BRUTTI's forest-green, cream and terracotta direction
- Content Studio with BM, English and bilingual OpenAI generation when the backend is connected
- Content Library with Edit, Approve, Reject and approval-gated Facebook publishing
- Review pipeline: Idea → Draft → AI Generated → Review → Approved → Scheduled → Published → Archived
- Campaign Planner with add, edit and delete controls
- Brand, Product and Asset libraries
- AI Prompt Library covering writing, video, customer service and creative tasks
- Verified Facebook activity snapshot without fabricated Meta KPI
- Supabase database, authentication and private asset-storage foundation
- Browser fallback when the cloud backend is not configured
- Server-side adapters for OpenAI, Notion, Google Drive and Meta/Facebook

## Accuracy and integration boundaries

GitHub Pages hosts only the frontend. Supabase provides the database, staff login, private storage and Edge Function needed to keep API credentials off the browser.

The integration code is included, but each service remains inactive until its project and credentials are configured:

- OpenAI Responses API
- Notion database sync
- Google Drive asset retrieval
- Human-approved Facebook publishing
- Live Meta Insights KPI

The interface does not fabricate prices, promotions, availability, delivery dates, specifications or social-performance KPI. Generated copy remains review-first.

## Cloud backend setup

1. Create a Supabase project.
2. Run the migration in `supabase/migrations/202608130001_init.sql`.
3. Add approved staff emails to the allowlist:
   `insert into public.staff_members (email, role) values ('staff@example.com', 'admin');`
4. Deploy `supabase/functions/marketing-api`.
5. Add the server-side values shown in `.env.example` with Supabase secrets.
6. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as GitHub repository variables.
7. In Supabase Auth, allow this redirect URL:
   `https://brutti-team.github.io/brutti-ai-marketing-hub/`

Never commit real OpenAI, Notion, Google or Meta credentials. The Supabase anon key is public by design; Row Level Security and staff authentication protect the data.

### Integration behaviour

- OpenAI: generates and reviews copy using only supplied verified facts.
- Notion: creates a controlled database entry through the backend.
- Drive: reads approved assets from one configured Drive folder.
- Meta: publishes only a database item that a human has marked `Approved`.
- Analytics: remains blank for live KPI until Meta returns real data.

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
