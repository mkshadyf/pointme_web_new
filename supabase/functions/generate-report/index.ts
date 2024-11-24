import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Storage } from 'https://esm.sh/@google-cloud/storage@7.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { format } from 'https://esm.sh/date-fns@2.30.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

const storage = new Storage({
  projectId: Deno.env.get('GOOGLE_CLOUD_PROJECT'),
  credentials: JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}'),
});

const bucket = storage.bucket(Deno.env.get('GOOGLE_CLOUD_BUCKET') || '');

serve(async (req) => {
  try {
    const { scheduleId } = await req.json();

    // Get schedule details
    const { data: schedule, error: scheduleError } = await supabase
      .from('report_schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (scheduleError) throw scheduleError;

    // Get analytics data
    const endDate = new Date();
    const startDate = new Date();

    switch (schedule.frequency) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const { data: analytics, error: analyticsError } = await supabase
      .from('payment_analytics')
      .select('*')
      .eq('business_id', schedule.business_id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (analyticsError) throw analyticsError;

    const { data: metrics, error: metricsError } = await supabase
      .from('payment_metrics')
      .select('*')
      .eq('business_id', schedule.business_id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (metricsError) throw metricsError;

    // Generate PDF report
    const pdf = await generateReport(analytics, metrics, { startDate, endDate });

    // Upload to Google Cloud Storage
    const fileName = `reports/${schedule.business_id}/${format(new Date(), 'yyyy-MM-dd')}-${schedule.report_type}.pdf`;
    const file = bucket.file(fileName);
    await file.save(pdf.output(), { contentType: 'application/pdf' });

    // Get public URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log success
    await supabase.from('report_logs').insert({
      schedule_id: scheduleId,
      status: 'success',
      file_url: url,
    });

    // Send email notifications
    await Promise.all(schedule.recipients.map(recipient =>
      supabase.functions.invoke('send-email', {
        body: {
          to: recipient,
          subject: `${schedule.report_type} Report - ${format(new Date(), 'MMM d, yyyy')}`,
          html: `
            <p>Your scheduled report is ready.</p>
            <p><a href="${url}">Download Report</a></p>
            <p>This link will expire in 7 days.</p>
          `,
        },
      })
    ));

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating report:', error);

    // Log error
    await supabase.from('report_logs').insert({
      schedule_id: (await req.json()).scheduleId,
      status: 'failed',
      error: error.message,
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 