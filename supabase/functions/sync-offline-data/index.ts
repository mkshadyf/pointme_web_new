import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  try {
    const { data: mutations, error } = await supabase
      .from('offline_mutations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at');

    if (error) throw error;

    const results = [];
    for (const mutation of mutations) {
      try {
        // Update status to processing
        await supabase
          .from('offline_mutations')
          .update({ status: 'processing' })
          .eq('id', mutation.id);

        // Process mutation
        let result;
        switch (mutation.operation) {
          case 'INSERT':
            result = await supabase
              .from(mutation.table_name)
              .insert(mutation.data)
              .select()
              .single();
            break;
          case 'UPDATE':
            result = await supabase
              .from(mutation.table_name)
              .update(mutation.data)
              .eq('id', mutation.record_id)
              .select()
              .single();
            break;
          case 'DELETE':
            result = await supabase
              .from(mutation.table_name)
              .delete()
              .eq('id', mutation.record_id);
            break;
        }

        // Mark as completed
        await supabase
          .from('offline_mutations')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
          })
          .eq('id', mutation.id);

        results.push({ id: mutation.id, success: true });
      } catch (error) {
        // Mark as failed
        await supabase
          .from('offline_mutations')
          .update({
            status: 'failed',
            error: error.message,
            processed_at: new Date().toISOString(),
          })
          .eq('id', mutation.id);

        results.push({ id: mutation.id, success: false, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 