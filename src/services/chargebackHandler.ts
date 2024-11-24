import { sendEmail } from '../lib/emails';
import { stripe } from '../lib/stripe';
import { supabase } from '../lib/supabase';

interface Chargeback {
  id: string;
  payment_intent_id: string;
  booking_id: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'needs_response' | 'under_review' | 'won' | 'lost';
  evidence?: any;
  due_date: string;
}

export class ChargebackHandler {
  public async handleDispute(stripeEvent: any) {
    const dispute = stripeEvent.data.object;

    // Create chargeback record
    const { data: chargeback, error } = await supabase
      .from('chargebacks')
      .insert({
        payment_intent_id: dispute.payment_intent,
        booking_id: dispute.metadata.booking_id,
        amount: dispute.amount,
        currency: dispute.currency,
        reason: dispute.reason,
        status: 'needs_response',
        due_date: new Date(dispute.evidence_details.due_by * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Notify business
    await this.notifyBusiness(chargeback);

    // Automatically gather evidence
    await this.gatherEvidence(chargeback);

    return chargeback;
  }

  public async submitEvidence(chargebackId: string, evidence: any) {
    const { data: chargeback } = await supabase
      .from('chargebacks')
      .select('*')
      .eq('id', chargebackId)
      .single();

    if (!chargeback) throw new Error('Chargeback not found');

    // Submit evidence to Stripe
    await stripe.disputes.update(chargeback.stripe_dispute_id, {
      evidence: evidence,
    });

    // Update chargeback status
    await supabase
      .from('chargebacks')
      .update({
        status: 'under_review',
        evidence: evidence,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chargebackId);
  }

  private async notifyBusiness(chargeback: Chargeback) {
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        business:businesses(
          *,
          owner:profiles(*)
        )
      `)
      .eq('id', chargeback.booking_id)
      .single();

    if (!booking) return;

    await sendEmail({
      to: booking.business.owner.email,
      subject: 'New Chargeback Dispute',
      html: `
        <h1>New Chargeback Dispute</h1>
        <p>A chargeback has been initiated for booking #${booking.id}</p>
        <p>Amount: ${chargeback.amount} ${chargeback.currency}</p>
        <p>Reason: ${chargeback.reason}</p>
        <p>Evidence due by: ${new Date(chargeback.due_date).toLocaleDateString()}</p>
        <p>Please submit evidence as soon as possible to dispute this chargeback.</p>
      `,
    });
  }

  private async gatherEvidence(chargeback: Chargeback) {
    // Implementation for automatic evidence gathering
  }
}

export const chargebackHandler = new ChargebackHandler(); 