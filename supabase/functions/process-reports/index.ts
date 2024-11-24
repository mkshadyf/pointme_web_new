import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { zonedTimeToUtc } from 'https://esm.sh/date-fns-tz@2.0.0';
import { format, isWithinInterval } from 'https://esm.sh/date-fns@2.30.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async () => {
  try {
    // Get all active schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from('report_schedules')
      .select('*')
      .eq('is_active', true);

    if (schedulesError) throw schedulesError;

    const now = new Date();
    const processedSchedules = [];

    for (const schedule of schedules) {
      try {
        const config = schedule.schedule_config;
        const scheduleTime = new Date(`${format(now, 'yyyy-MM-dd')}T${schedule.time}`);
        const scheduleTimeUtc = zonedTimeToUtc(scheduleTime, config.timezone || 'UTC');

        // Check if schedule should run
        const shouldRun = checkSchedule(now, schedule);
        if (!shouldRun) continue;

        // Process report
        const startTime = new Date();
        const result = await supabase.functions.invoke('generate-report', {
          body: { scheduleId: schedule.id },
        });

        // Log schedule execution
        await supabase.from('report_schedule_history').insert({
          schedule_id: schedule.id,
          status: result.error ? 'failed' : 'success',
          run_at: startTime.toISOString(),
          duration: new Date().getTime() - startTime.getTime(),
          error: result.error,
          metadata: {
            config: schedule.schedule_config,
            result: result.data,
          },
        });

        processedSchedules.push({
          id: schedule.id,
          status: result.error ? 'failed' : 'success',
        });
      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ processed: processedSchedules }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing reports:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function checkSchedule(now: Date, schedule: any): boolean {
  const config = schedule.schedule_config;
  const currentDay = format(now, 'EEEE').toLowerCase();

  // Check if current day is included in schedule
  if (config.days && !config.days.includes(currentDay)) {
    return false;
  }

  // Check repeat interval
  if (config.repeat_interval > 1) {
    const lastRun = schedule.last_run ? new Date(schedule.last_run) : null;
    if (lastRun) {
      const daysSinceLastRun = Math.floor((now.getTime() - lastRun.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastRun < config.repeat_interval) {
        return false;
      }
    }
  }

  // Check time window (within 5 minutes of scheduled time)
  const scheduleTime = new Date(`${format(now, 'yyyy-MM-dd')}T${schedule.time}`);
  const scheduleTimeUtc = zonedTimeToUtc(scheduleTime, config.timezone || 'UTC');
  const timeWindow = {
    start: new Date(scheduleTimeUtc.getTime() - 5 * 60 * 1000),
    end: new Date(scheduleTimeUtc.getTime() + 5 * 60 * 1000),
  };

  return isWithinInterval(now, timeWindow);
} 