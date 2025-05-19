/*
  # Initial Schema Setup

  1. New Tables
    - profiles
      - id (uuid, references auth.users)
      - full_name (text)
      - company_name (text)
      - subscription_status (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - chatbots
      - id (uuid)
      - user_id (uuid, references profiles)
      - name (text)
      - description (text)
      - website_url (text)
      - status (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - chat_history
      - id (uuid)
      - chatbot_id (uuid, references chatbots)
      - user_message (text)
      - bot_response (text)
      - metadata (jsonb)
      - created_at (timestamptz)
    
    - training_sources
      - id (uuid)
      - chatbot_id (uuid, references chatbots)
      - source_type (text)
      - source_url (text)
      - status (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  company_name text,
  subscription_status text DEFAULT 'inactive',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Create chatbots table
CREATE TABLE chatbots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  website_url text,
  status text DEFAULT 'inactive',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own chatbots" 
  ON chatbots FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create chat_history table
CREATE TABLE chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES chatbots(id) ON DELETE CASCADE,
  user_message text NOT NULL,
  bot_response text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chatbot history" 
  ON chat_history FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM chatbots 
      WHERE chatbots.id = chat_history.chatbot_id 
      AND chatbots.user_id = auth.uid()
    )
  );

-- Create training_sources table
CREATE TABLE training_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES chatbots(id) ON DELETE CASCADE,
  source_type text NOT NULL,
  source_url text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE training_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own training sources" 
  ON training_sources FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM chatbots 
      WHERE chatbots.id = training_sources.chatbot_id 
      AND chatbots.user_id = auth.uid()
    )
  );

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbots_updated_at
    BEFORE UPDATE ON chatbots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_sources_updated_at
    BEFORE UPDATE ON training_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();