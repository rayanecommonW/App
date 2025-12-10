-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users extended profile
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  elo_rating INT DEFAULT 1000,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI personas
CREATE TABLE ai_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INT NOT NULL,
  bio TEXT NOT NULL,
  personality_traits JSONB NOT NULL DEFAULT '[]',
  avatar_url TEXT,
  voice_style TEXT
);

-- Chat sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ai_persona_id UUID NOT NULL REFERENCES ai_personas(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INT DEFAULT 0,
  user_guess TEXT CHECK (user_guess IN ('real', 'ai')),
  was_correct BOOLEAN,
  elo_change INT
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_profiles_elo ON profiles(elo_rating DESC);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- AI Personas: Anyone authenticated can read
CREATE POLICY "Authenticated users can view AI personas" 
  ON ai_personas FOR SELECT 
  TO authenticated 
  USING (true);

-- Chat Sessions: Users can manage their own sessions
CREATE POLICY "Users can view own chat sessions" 
  ON chat_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat sessions" 
  ON chat_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" 
  ON chat_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

-- Chat Messages: Users can view/add messages to their sessions
CREATE POLICY "Users can view messages in their sessions" 
  ON chat_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add messages to their sessions" 
  ON chat_messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, gender)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'gender', 'male'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert some sample AI personas
INSERT INTO ai_personas (name, age, bio, personality_traits, avatar_url) VALUES
  ('Emma', 24, 'Graphic designer who loves hiking and coffee. Currently obsessed with minimalist art.', '["creative", "outdoorsy", "slightly sarcastic", "coffee addict"]', NULL),
  ('Sophie', 26, 'Software engineer by day, amateur chef by night. My pasta is legendary (according to me).', '["nerdy", "foodie", "self-deprecating humor", "night owl"]', NULL),
  ('Luna', 23, 'Music teacher who plays 5 instruments badly and 1 decently. Dog mom to a chaotic golden retriever.', '["musical", "chaotic energy", "dog lover", "optimistic"]', NULL),
  ('Mia', 25, 'Nurse working night shifts. I survive on energy drinks and true crime podcasts.', '["caring", "dark humor", "sleep-deprived", "true crime enthusiast"]', NULL),
  ('Ava', 27, 'Marketing manager who escaped corporate to start a plant shop. 47 plants and counting.', '["plant obsessed", "ex-corporate", "chill", "entrepreneurial"]', NULL);

