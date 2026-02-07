# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be set up

## 2. Run the Database Schema

1. In your Supabase project dashboard, go to the SQL Editor
2. Copy the contents of `schema.sql` from this directory
3. Paste and run it in the SQL Editor

## 3. Set Up Authentication

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Email authentication (or any other providers you want)
3. Configure the email templates if desired

## 4. Get Your API Keys

1. Go to Settings > API in your Supabase dashboard
2. Copy the Project URL and anon/public key
3. Add them to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## 5. Set Up Storage (for image uploads)

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `user-uploads`
3. Set it to public or create appropriate policies
4. Create another bucket called `generated-images` for the AI-generated images

## Database Schema Overview

- **templates**: Stores the different image generation templates (superhero, princess, etc.)
- **generations**: Tracks each image generation request and result
- **user_quotas**: Manages rate limiting per user over time periods
