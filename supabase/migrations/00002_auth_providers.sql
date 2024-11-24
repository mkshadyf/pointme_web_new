-- Enable additional authentication providers
ALTER TABLE auth.identities
ADD COLUMN IF NOT EXISTS provider_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS provider_access_token TEXT,
ADD COLUMN IF NOT EXISTS provider_expires_at TIMESTAMPTZ;

-- Create OAuth state table for security
CREATE TABLE IF NOT EXISTS auth.oauth_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  state TEXT NOT NULL UNIQUE,
  redirect_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  user_id UUID REFERENCES auth.users(id)
);

-- Create index for OAuth states cleanup
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON auth.oauth_states(expires_at);

-- Create function to clean up expired OAuth states
CREATE OR REPLACE FUNCTION auth.cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.oauth_states WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 