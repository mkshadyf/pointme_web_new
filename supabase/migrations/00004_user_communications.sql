-- Create communication preferences table
CREATE TABLE communication_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email_marketing BOOLEAN DEFAULT true,
  email_bookings BOOLEAN DEFAULT true,
  email_reminders BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  sms_bookings BOOLEAN DEFAULT true,
  sms_reminders BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  push_bookings BOOLEAN DEFAULT true,
  push_reminders BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create communication templates table
CREATE TABLE communication_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create communication logs table
CREATE TABLE communication_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  template_id UUID REFERENCES communication_templates(id),
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_comm_prefs_user ON communication_preferences(user_id);
CREATE INDEX idx_comm_logs_user ON communication_logs(user_id);
CREATE INDEX idx_comm_logs_status ON communication_logs(status);
CREATE INDEX idx_comm_logs_sent ON communication_logs(sent_at);

-- Enable RLS
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can manage their communication preferences"
  ON communication_preferences FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage templates"
  ON communication_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

CREATE POLICY "Users can view their communication logs"
  ON communication_logs FOR SELECT
  USING (auth.uid() = user_id); 