import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PaymentAnalytics, PaymentMetrics } from '../types/analytics';
import { formatCurrency } from './utils';

export async function generatePaymentReport(
  businessId: string,
  analytics: PaymentAnalytics[],
  metrics: PaymentMetrics[],
  dateRange: { start: Date; end: Date }
) {
  const doc = new jsPDF();
  const startDate = format(dateRange.start, 'MMM d, yyyy');
  const endDate = format(dateRange.end, 'MMM d, yyyy');

  // Add title
  doc.setFontSize(20);
  doc.text('Payment Analytics Report', 14, 20);
  doc.setFontSize(12);
  doc.text(`${startDate} - ${endDate}`, 14, 30);

  // Add summary metrics
  const totalRevenue = metrics.reduce((sum, m) => sum + m.total_amount, 0);
  const totalPayments = metrics.reduce((sum, m) => sum + m.total_payments, 0);
  const successfulPayments = metrics.reduce((sum, m) => sum + m.successful_payments, 0);
  const failedPayments = metrics.reduce((sum, m) => sum + m.failed_payments, 0);

  doc.text('Summary', 14, 45);
  doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 20, 55);
  doc.text(`Total Payments: ${totalPayments}`, 20, 62);
  doc.text(`Successful Payments: ${successfulPayments}`, 20, 69);
  doc.text(`Failed Payments: ${failedPayments}`, 20, 76);

  // Add daily metrics table
  autoTable(doc, {
    startY: 90,
    head: [['Date', 'Revenue', 'Payments', 'Success Rate', 'Avg Amount']],
    body: metrics.map(m => [
      format(new Date(m.date), 'MMM d, yyyy'),
      formatCurrency(m.total_amount),
      m.total_payments,
      `${((m.successful_payments / m.total_payments) * 100).toFixed(1)}%`,
      formatCurrency(m.average_amount),
    ]),
  });

  // Add payment method distribution
  const paymentMethods = analytics.reduce((acc, curr) => {
    acc[curr.payment_method_type] = (acc[curr.payment_method_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  doc.addPage();
  doc.text('Payment Method Distribution', 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [['Payment Method', 'Count', 'Percentage']],
    body: Object.entries(paymentMethods).map(([method, count]) => [
      method,
      count,
      `${((count / analytics.length) * 100).toFixed(1)}%`,
    ]),
  });

  return doc;
}

export async function scheduleAutomatedReport(businessId: string, schedule: {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
}) {
  const { error } = await supabase.from('report_schedules').insert({
    business_id: businessId,
    frequency: schedule.frequency,
    time: schedule.time,
    recipients: schedule.recipients,
    report_type: 'payment_analytics',
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
} 