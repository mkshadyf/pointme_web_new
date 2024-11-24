import { Chart } from 'chart.js';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'payment_analytics' | 'customer_analytics' | 'service_analytics';
  config: {
    sections: ReportSection[];
    charts: ChartConfig[];
    format: 'pdf' | 'csv' | 'excel';
    orientation: 'portrait' | 'landscape';
    pageSize: 'A4' | 'Letter';
    includeHeader: boolean;
    includeFooter: boolean;
    customStyles?: Record<string, any>;
  };
}

interface ReportSection {
  type: 'summary' | 'table' | 'chart' | 'text';
  title?: string;
  data: any;
  options?: Record<string, any>;
}

interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: any;
  options: Record<string, any>;
}

export async function generateReport(template: ReportTemplate, data: any) {
  const doc = new jsPDF({
    orientation: template.config.orientation,
    unit: 'mm',
    format: template.config.pageSize,
  });

  // Add header
  if (template.config.includeHeader) {
    addHeader(doc, template, data);
  }

  // Process each section
  let yPos = template.config.includeHeader ? 40 : 10;
  for (const section of template.config.sections) {
    yPos = await processSection(doc, section, data, yPos);
    yPos += 10; // Add spacing between sections
  }

  // Add footer
  if (template.config.includeFooter) {
    addFooter(doc, template);
  }

  // Generate charts
  for (const chartConfig of template.config.charts) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    const chart = new Chart(ctx, {
      type: chartConfig.type,
      data: chartConfig.data,
      options: chartConfig.options,
    });

    const chartImage = canvas.toDataURL('image/png');
    doc.addImage(chartImage, 'PNG', 10, yPos, 190, 100);
    yPos += 110;

    chart.destroy();
  }

  return doc;
}

function addHeader(doc: jsPDF, template: ReportTemplate, data: any) {
  doc.setFontSize(20);
  doc.text(template.name, 10, 20);
  doc.setFontSize(12);
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 10, 30);
}

function addFooter(doc: jsPDF, template: ReportTemplate) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
}

async function processSection(
  doc: jsPDF,
  section: ReportSection,
  data: any,
  startY: number
): Promise<number> {
  switch (section.type) {
    case 'summary':
      return addSummarySection(doc, section, data, startY);
    case 'table':
      return addTableSection(doc, section, data, startY);
    case 'chart':
      return addChartSection(doc, section, data, startY);
    case 'text':
      return addTextSection(doc, section, data, startY);
    default:
      return startY;
  }
}

function addSummarySection(
  doc: jsPDF,
  section: ReportSection,
  data: any,
  startY: number
): number {
  doc.setFontSize(14);
  doc.text(section.title || 'Summary', 10, startY);

  doc.setFontSize(12);
  let yPos = startY + 10;

  Object.entries(section.data).forEach(([key, value]) => {
    doc.text(`${key}: ${formatValue(value)}`, 15, yPos);
    yPos += 7;
  });

  return yPos;
}

function addTableSection(
  doc: jsPDF,
  section: ReportSection,
  data: any,
  startY: number
): number {
  autoTable(doc, {
    startY,
    head: [section.options?.columns || []],
    body: section.data,
    ...section.options?.tableStyles,
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

function addChartSection(
  doc: jsPDF,
  section: ReportSection,
  data: any,
  startY: number
): number {
  // Implementation depends on chart library
  return startY + 100; // Placeholder
}

function addTextSection(
  doc: jsPDF,
  section: ReportSection,
  data: any,
  startY: number
): number {
  doc.setFontSize(12);
  const lines = doc.splitTextToSize(section.data, 190);
  doc.text(lines, 10, startY);
  return startY + (lines.length * 7);
}

function formatValue(value: any): string {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (value instanceof Date) {
    return format(value, 'PPpp');
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
} 