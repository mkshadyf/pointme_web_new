import { supabase } from '../lib/supabase';

interface TaxRate {
  id: string;
  country: string;
  state: string | null;
  rate: number;
  tax_type: string;
}

interface Location {
  country: string;
  state?: string;
  postal_code?: string;
}

interface TaxCalculation {
  subtotal: number;
  tax: number;
  total: number;
  breakdown: {
    tax_type: string;
    rate: number;
    amount: number;
  }[];
}

export class TaxCalculator {
  private taxRates: Map<string, TaxRate[]> = new Map();

  constructor() {
    this.loadTaxRates();
  }

  private async loadTaxRates() {
    const { data, error } = await supabase
      .from('tax_rates')
      .select('*')
      .eq('is_active', true);

    if (!error && data) {
      // Group tax rates by country
      data.forEach(rate => {
        const country = rate.country;
        if (!this.taxRates.has(country)) {
          this.taxRates.set(country, []);
        }
        this.taxRates.get(country)?.push(rate);
      });
    }
  }

  public async calculateTax(
    amount: number,
    location: Location,
    currency: string
  ): Promise<TaxCalculation> {
    const applicableRates = this.getApplicableRates(location);
    const breakdown = [];
    let totalTax = 0;

    for (const rate of applicableRates) {
      const taxAmount = amount * (rate.rate / 100);
      totalTax += taxAmount;
      breakdown.push({
        tax_type: rate.tax_type,
        rate: rate.rate,
        amount: taxAmount,
      });
    }

    return {
      subtotal: amount,
      tax: totalTax,
      total: amount + totalTax,
      breakdown,
    };
  }

  private getApplicableRates(location: Location): TaxRate[] {
    const countryRates = this.taxRates.get(location.country) || [];
    return countryRates.filter(rate =>
      !rate.state || rate.state === location.state
    );
  }

  public async validateTaxNumber(number: string, country: string): Promise<boolean> {
    // Implementation for tax number validation
    return true;
  }
}

export const taxCalculator = new TaxCalculator(); 