# Quick Setup Guide

Follow these steps to get wonderMoments running locally:

## 1. Install Dependencies

```bash
npm install
```

## 2. Create Environment Variables

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and fill in:
- Supabase URL and key (from your Supabase project)
- Gemini API key (from Google AI Studio)

## 3. Set Up Supabase

### Create Project
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Wait for it to initialize

### Run Database Schema
- Open SQL Editor in Supabase dashboard
- Copy contents of `supabase/schema.sql`
- Paste and execute

### Create Storage Buckets
- Go to Storage section
- Create bucket: `user-uploads` (public)
- Create bucket: `generated-images` (public)

### Enable Auth
- Go to Authentication > Providers
- Enable Email authentication

### Get API Keys
- Go to Settings > API
- Copy Project URL to `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
- Copy anon public key to `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. Get Gemini API Key

- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create API key
- Add to `.env.local` as `GEMINI_API_KEY`

## 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Test the App

1. Sign up with email/password
2. Select a template (e.g., Superman)
3. Upload a test image
4. Click "Generate Magic"

## Important Notes

- **Image Generation**: The current Gemini integration is a placeholder. You'll need to integrate with an actual image generation API (Imagen, DALL-E, Stable Diffusion, etc.) for full functionality.

- **Rate Limiting**: Default is 10 generations per 30 days. Adjust in `.env.local`:
  - `GENERATIONS_LIMIT_PER_PERIOD=10`
  - `QUOTA_PERIOD_DAYS=30`

- **Storage Setup**: Make sure both storage buckets are set to public access so generated images can be displayed.

## Troubleshooting

### "Unauthorized" error
- Check that you're signed in
- Verify Supabase environment variables are correct

### Image upload fails
- Confirm storage buckets exist and are public
- Check bucket names match the code (`user-uploads`, `generated-images`)

### Generation fails
- Gemini integration needs to be completed with actual image generation service
- Check API key is valid

## Next Steps

1. Integrate actual image generation API in `lib/gemini.ts`
2. Add more templates in Supabase
3. Customize the UI/styling
4. Deploy to Netlify
