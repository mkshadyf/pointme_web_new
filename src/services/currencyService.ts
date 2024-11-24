import { supabase } from '../lib/supabase';

interface ExchangeRate {
  code: string;
  rate: number;
  lastUpdated: Date;
}

export class CurrencyService {
  private rates: Map<string, ExchangeRate>;
  private updateInterval: number = 3600000; // 1 hour

  constructor() {
    this.rates = new Map();
    this.initializeRates();
    this.startUpdateInterval();
  }

  private async initializeRates() {
    const { data, error } = await supabase
      .from('supported_currencies')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    data.forEach(currency => {
      this.rates.set(currency.code, {
        code: currency.code,
        rate: currency.exchange_rate,
        lastUpdated: new Date(currency.last_updated),
      });
    });
  }

  private startUpdateInterval() {
    setInterval(() => this.updateRates(), this.updateInterval);
  }

  private async updateRates() {
    // Implement your preferred exchange rate API here
    // For example, using Open Exchange Rates or similar
    const { data, error } = await supabase
      .from('supported_currencies')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    data.forEach(currency => {
      this.rates.set(currency.code, {
        code: currency.code,
        rate: currency.exchange_rate,
        lastUpdated: new Date(currency.last_updated),
      });
    });
  }

  public convert(amount: number, fromCurrency: string, toCurrency: string): number {
    const fromRate = this.rates.get(fromCurrency)?.rate || 1;
    const toRate = this.rates.get(toCurrency)?.rate || 1;
    return (amount / fromRate) * toRate;
  }

  public formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  public getSupportedCurrencies(): string[] {
    return Array.from(this.rates.keys());
  }

  public getExchangeRate(fromCurrency: string, toCurrency: string): number {
    const fromRate = this.rates.get(fromCurrency)?.rate || 1;
    const toRate = this.rates.get(toCurrency)?.rate || 1;
    return toRate / fromRate;
  }
}

export const currencyService = new CurrencyService(); 