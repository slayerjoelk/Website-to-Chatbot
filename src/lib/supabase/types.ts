export type Profile = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  subscription_status: string;
  created_at: string;
  updated_at: string;
};

export type Chatbot = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ChatHistory = {
  id: string;
  chatbot_id: string;
  user_message: string;
  bot_response: string;
  metadata: Record<string, any>;
  created_at: string;
};

export type TrainingSource = {
  id: string;
  chatbot_id: string;
  source_type: string;
  source_url: string;
  status: string;
  created_at: string;
  updated_at: string;
};