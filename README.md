# wonderMoments

Transform your kids and pets into magical characters with AI-powered image generation!

## Features

- **Template Collections**: Choose from various themed templates (superheroes, and more)
- **Image Upload**: Easy drag-and-drop interface for uploading photos
- **AI Generation**: Powered by Gemini AI for high-quality transformations
- **Rate Limiting**: Built-in quota system to control costs
- **User Authentication**: Secure authentication with Supabase
- **Responsive Design**: Works beautifully on all devices

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Google Gemini API
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- A Supabase account
- A Google Cloud account with Gemini API access

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd wonderMoments
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `GEMINI_API_KEY`: Your Google Gemini API key
- `GENERATIONS_LIMIT_PER_PERIOD`: Number of generations allowed per period (default: 10)
- `QUOTA_PERIOD_DAYS`: Length of quota period in days (default: 30)

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the database schema:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Execute the SQL

3. Set up Storage buckets:
   - Go to Storage in your Supabase dashboard
   - Create two buckets:
     - `user-uploads` (for user uploaded images)
     - `generated-images` (for AI generated images)
   - Set appropriate access policies (public read recommended)

4. Enable Authentication:
   - Go to Authentication > Providers
   - Enable Email authentication
   - Configure any additional providers you want

See `supabase/README.md` for detailed instructions.

### Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

**Important Note**: The current implementation uses Gemini for image understanding. For actual image generation, you may need to integrate with:
- Google Imagen API
- DALL-E API
- Stable Diffusion API
- Or another image generation service

The code in `lib/gemini.ts` includes placeholder logic that you'll need to update based on your chosen image generation service.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Netlify

1. Push your code to GitHub

2. Connect your repository to Netlify:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Select your repository

3. Configure environment variables:
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add all the variables from your `.env.local`

4. Deploy!
   - Netlify will automatically build and deploy your site
   - The `netlify.toml` file is already configured

## Project Structure

```
wonderMoments/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── generate/     # Image generation endpoint
│   │   └── quota/        # Quota checking endpoint
│   ├── auth/             # Authentication page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── GeneratorPage.tsx # Main generation interface
│   ├── ImageUpload.tsx   # Image upload component
│   ├── TemplateCard.tsx  # Template card component
│   └── TemplateCollection.tsx
├── lib/                   # Utility functions
│   ├── gemini.ts         # Gemini API integration
│   ├── quota.ts          # Rate limiting logic
│   ├── storage.ts        # Supabase storage utilities
│   ├── templates.ts      # Template fetching functions
│   └── supabase/         # Supabase client configuration
├── types/                 # TypeScript type definitions
│   └── database.ts       # Database schema types
├── supabase/             # Supabase configuration
│   ├── schema.sql        # Database schema
│   └── README.md         # Setup instructions
└── netlify.toml          # Netlify configuration
```

## Database Schema

- **templates**: Stores image generation templates
- **generations**: Tracks all generation requests and results
- **user_quotas**: Manages rate limiting per user

## Customization

### Adding New Templates

You can add new templates by inserting records into the `templates` table:

```sql
INSERT INTO templates (name, collection, description, prompt_template) VALUES
  ('Your Template', 'your-collection', 'Description', 'Prompt with {subject} placeholder');
```

### Adjusting Rate Limits

Modify the environment variables:
- `GENERATIONS_LIMIT_PER_PERIOD`: Change the number of allowed generations
- `QUOTA_PERIOD_DAYS`: Change the period length

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, please open an issue on GitHub.
