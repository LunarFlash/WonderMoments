-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Templates table to store different image generation templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  collection TEXT NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generations table to track all image generations
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  input_image_url TEXT NOT NULL,
  generated_image_url TEXT,
  user_inputs JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User quotas table for rate limiting
CREATE TABLE IF NOT EXISTS user_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  generations_used INTEGER DEFAULT 0,
  generations_limit INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);
CREATE INDEX IF NOT EXISTS idx_user_quotas_user_id ON user_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_collection ON templates(collection);
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generations_updated_at BEFORE UPDATE ON generations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_quotas_updated_at BEFORE UPDATE ON user_quotas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default templates
INSERT INTO templates (name, collection, description, prompt_template) VALUES
  ('Superman', 'superheroes', 'Transform into the Man of Steel', 'A professional photo of {subject} as Superman, wearing the iconic red cape and blue suit with S symbol, heroic pose, cinematic lighting, high quality'),
  ('Wonder Woman', 'superheroes', 'Become the Amazonian warrior', 'A professional photo of {subject} as Wonder Woman, wearing golden tiara and armor, powerful stance, cinematic lighting, high quality'),
  ('Batman', 'superheroes', 'Transform into the Dark Knight', 'A professional photo of {subject} as Batman, wearing black cowl and cape, dramatic shadows, gotham city background, cinematic lighting, high quality'),
  ('Spider-Man', 'superheroes', 'Swing into action as Spider-Man', 'A professional photo of {subject} as Spider-Man, wearing red and blue costume with web pattern, dynamic action pose, city background, cinematic lighting, high quality');

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates (read-only for all authenticated users)
CREATE POLICY "Templates are viewable by everyone" ON templates
  FOR SELECT USING (is_active = true);

-- RLS Policies for generations (users can only see their own)
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations" ON generations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_quotas (users can only see their own)
CREATE POLICY "Users can view own quotas" ON user_quotas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quotas" ON user_quotas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotas" ON user_quotas
  FOR UPDATE USING (auth.uid() = user_id);
