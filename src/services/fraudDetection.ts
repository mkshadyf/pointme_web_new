import { supabase } from '../lib/supabase';

interface FraudRule {
  id: string;
  name: string;
  conditions: {
    type: 'velocity' | 'amount' | 'location' | 'device' | 'pattern';
    threshold: number;
    timeframe?: number;
    pattern?: string;
  }[];
  action: 'block' | 'flag' | 'review';
}

interface PaymentAttempt {
  amount: number;
  currency: string;
  ip_address: string;
  device_id: string;
  user_id: string;
  payment_method: any;
}

export class FraudDetectionService {
  private rules: FraudRule[] = [];

  constructor() {
    this.loadRules();
  }

  private async loadRules() {
    const { data, error } = await supabase
      .from('fraud_rules')
      .select('*')
      .eq('is_active', true);

    if (!error && data) {
      this.rules = data;
    }
  }

  public async checkPayment(attempt: PaymentAttempt): Promise<{
    isAllowed: boolean;
    risk: 'low' | 'medium' | 'high';
    action: 'allow' | 'block' | 'review';
    reasons: string[];
  }> {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Check velocity
    const recentAttempts = await this.getRecentAttempts(attempt.user_id);
    if (recentAttempts > 5) {
      riskFactors.push('High velocity of attempts');
      riskScore += 30;
    }

    // Check amount patterns
    if (await this.hasUnusualAmount(attempt)) {
      riskFactors.push('Unusual transaction amount');
      riskScore += 20;
    }

    // Check location
    if (await this.isLocationMismatch(attempt)) {
      riskFactors.push('Location mismatch');
      riskScore += 25;
    }

    // Check device reputation
    if (await this.hasDeviceRisk(attempt.device_id)) {
      riskFactors.push('Suspicious device');
      riskScore += 25;
    }

    // Determine risk level and action
    const risk = riskScore < 30 ? 'low' : riskScore < 60 ? 'medium' : 'high';
    const action = risk === 'high' ? 'block' : risk === 'medium' ? 'review' : 'allow';

    return {
      isAllowed: action !== 'block',
      risk,
      action,
      reasons: riskFactors,
    };
  }

  private async getRecentAttempts(userId: string): Promise<number> {
    const { count } = await supabase
      .from('payment_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString());

    return count || 0;
  }

  private async hasUnusualAmount(attempt: PaymentAttempt): Promise<boolean> {
    // Implementation for amount pattern detection
    return false;
  }

  private async isLocationMismatch(attempt: PaymentAttempt): Promise<boolean> {
    // Implementation for location verification
    return false;
  }

  private async hasDeviceRisk(deviceId: string): Promise<boolean> {
    // Implementation for device risk assessment
    return false;
  }
}

export const fraudDetection = new FraudDetectionService(); 