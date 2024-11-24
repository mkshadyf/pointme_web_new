-- Function to handle OAuth provider linking
CREATE OR REPLACE FUNCTION auth.link_provider()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user identities
  UPDATE auth.users
  SET raw_app_meta_data = 
    raw_app_meta_data || 
    jsonb_build_object(
      'providers',
      COALESCE(
        raw_app_meta_data->'providers',
        '[]'::jsonb
      ) || jsonb_build_array(NEW.provider)
    )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate analytics
CREATE OR REPLACE FUNCTION analytics.generate_user_metrics(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  metric_type TEXT,
  metric_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'bookings_count'::TEXT as metric_type,
    COUNT(*)::NUMERIC as metric_value
  FROM bookings
  WHERE client_id = p_user_id
  AND created_at BETWEEN p_start_date AND p_end_date
  
  UNION ALL
  
  SELECT
    'total_spent'::TEXT,
    COALESCE(SUM(total_amount), 0)::NUMERIC
  FROM bookings
  WHERE client_id = p_user_id
  AND status = 'completed'
  AND created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user verification
CREATE OR REPLACE FUNCTION auth.verify_user(
  p_user_id UUID,
  p_code TEXT,
  p_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_verification verification_codes%ROWTYPE;
BEGIN
  SELECT *
  INTO v_verification
  FROM verification_codes
  WHERE user_id = p_user_id
  AND code = p_code
  AND type = p_type
  AND verified_at IS NULL
  AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_verification.id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE verification_codes
  SET verified_at = NOW()
  WHERE id = v_verification.id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle communication preferences
CREATE OR REPLACE FUNCTION users.update_communication_preferences(
  p_user_id UUID,
  p_preferences JSONB
)
RETURNS void AS $$
BEGIN
  INSERT INTO communication_preferences (
    user_id,
    email_marketing,
    email_bookings,
    email_reminders,
    sms_enabled,
    sms_bookings,
    sms_reminders,
    push_enabled,
    push_bookings,
    push_reminders,
    quiet_hours_start,
    quiet_hours_end,
    timezone
  )
  VALUES (
    p_user_id,
    COALESCE((p_preferences->>'email_marketing')::BOOLEAN, true),
    COALESCE((p_preferences->>'email_bookings')::BOOLEAN, true),
    COALESCE((p_preferences->>'email_reminders')::BOOLEAN, true),
    COALESCE((p_preferences->>'sms_enabled')::BOOLEAN, false),
    COALESCE((p_preferences->>'sms_bookings')::BOOLEAN, true),
    COALESCE((p_preferences->>'sms_reminders')::BOOLEAN, true),
    COALESCE((p_preferences->>'push_enabled')::BOOLEAN, false),
    COALESCE((p_preferences->>'push_bookings')::BOOLEAN, true),
    COALESCE((p_preferences->>'push_reminders')::BOOLEAN, true),
    (p_preferences->>'quiet_hours_start')::TIME,
    (p_preferences->>'quiet_hours_end')::TIME,
    COALESCE(p_preferences->>'timezone', 'UTC')
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    email_marketing = EXCLUDED.email_marketing,
    email_bookings = EXCLUDED.email_bookings,
    email_reminders = EXCLUDED.email_reminders,
    sms_enabled = EXCLUDED.sms_enabled,
    sms_bookings = EXCLUDED.sms_bookings,
    sms_reminders = EXCLUDED.sms_reminders,
    push_enabled = EXCLUDED.push_enabled,
    push_bookings = EXCLUDED.push_bookings,
    push_reminders = EXCLUDED.push_reminders,
    quiet_hours_start = EXCLUDED.quiet_hours_start,
    quiet_hours_end = EXCLUDED.quiet_hours_end,
    timezone = EXCLUDED.timezone,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 