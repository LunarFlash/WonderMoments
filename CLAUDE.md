# CLAUDE.md

## Project Overview

wonderMoments is an AI-powered image generation web app. Users sign in, select a template (e.g., superhero themes), upload a photo, and generate a stylized image. The core image generation integration is currently a placeholder.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19, TypeScript 5
- **Styling**: Tailwind CSS 4 (utility-first, no custom CSS classes)
- **Database**: Supabase (PostgreSQL) with Row-Level Security
- **Auth**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (buckets: `user-uploads`, `generated-images`)
- **AI**: Google Generative AI (`@google/generative-ai`) — placeholder implementation
- **Deployment**: Netlify with `@netlify/plugin-nextjs`, Node 20

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Project Structure

```
app/                    # Next.js App Router
  api/generate/         # POST — AI image generation endpoint
  api/quota/            # GET — User quota check endpoint
  auth/                 # Sign in / sign up page
  page.tsx              # Home page (server component)
  layout.tsx            # Root layout
  globals.css           # Global styles
components/             # Client components ('use client')
  GeneratorPage.tsx     # Main multi-step UI (template → upload → result)
  ImageUpload.tsx       # Drag-and-drop image uploader
  TemplateCard.tsx      # Individual template card
  TemplateCollection.tsx # Grouped template display
lib/                    # Utilities
  supabase/client.ts    # Browser Supabase client
  supabase/server.ts    # Server Supabase client (cookie-based auth)
  gemini.ts             # Gemini AI integration (placeholder)
  quota.ts              # Rate limiting with sliding time windows
  storage.ts            # Supabase Storage upload/delete helpers
  templates.ts          # Template fetching
  template-utils.ts     # Template grouping by collection
types/database.ts       # TypeScript interfaces for DB schema
supabase/schema.sql     # Full database schema with RLS policies
```

## Architecture

- **Server components** fetch data (templates) at the page level, pass to client components
- **Client components** handle interactivity (template selection, image upload, generation)
- **API routes** in `app/api/` handle server-side logic (auth checks, quota enforcement, AI calls)
- **Auth** is checked server-side in API routes via Supabase SSR cookies
- **Quota system** uses sliding time windows per user with configurable limits

## Database Tables

- `templates` — Template definitions with prompt templates, grouped by collection
- `generations` — Generation records per user (status: pending → processing → completed/failed)
- `user_quotas` — Per-user rate limiting with period windows

## Conventions

- **Files**: lowercase with hyphens (`template-utils.ts`)
- **Components**: PascalCase (`GeneratorPage.tsx`)
- **Variables/functions**: camelCase
- **DB columns**: snake_case
- **Styling**: Tailwind utility classes only, purple/pink/blue gradient theme, mobile-first responsive with `md:` breakpoints
- **Error handling**: try-catch in async operations, user-friendly messages in UI, generation status tracking

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase public anon key
- `GEMINI_API_KEY` — Google Gemini API key (server-side only)

Optional (have defaults):
- `NEXT_PUBLIC_APP_URL` — App URL (default: `http://localhost:3000`)
- `GENERATIONS_LIMIT_PER_PERIOD` — Max generations per period (default: 10)
- `QUOTA_PERIOD_DAYS` — Quota period length in days (default: 30)

## Key Implementation Notes

- `lib/gemini.ts` is a placeholder — returns an error message. Needs integration with an actual image generation API (Imagen, DALL-E, Stable Diffusion, etc.)
- Templates use prompt placeholders (`{subject}`, `{other_input}`) that get substituted at generation time
- Storage filenames use `{userId}/{timestamp}.{ext}` pattern
- Quota returns 429 when exceeded
- All Supabase tables use RLS — users can only access their own data (except templates which are publicly readable)
