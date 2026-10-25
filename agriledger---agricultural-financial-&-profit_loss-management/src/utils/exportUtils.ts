import { jsPDF } from 'jspdf';
import { FinancialItem, LandPlot, Partner, FarmSettings, PLSummary, PartnerDistribution } from '../types';
import { formatCurrency } from './calculations';

// ================= CSV EXPORT =================
export function exportToCSV(filename: string, rows: (string | number)[][]) {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    rows
      .map((row) =>
        row
          .map((field) => {
            const str = String(field ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      )
      .join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLedgerCSV(items: FinancialItem[], lands: LandPlot[], year: number) {
  const landMap = new Map(lands.map((l) => [l.id, l.name]));

  const headers = ['ID', 'Date', 'Year', 'Type', 'Parcel / Land', 'Category', 'Description', 'Quantity', 'Unit', 'Unit Price', 'Amount ($)'];
  const rows = items.map((it) => [
    it.id,
    it.date,
    it.year,
    it.type.toUpperCase(),
    it.landId === 'all' ? 'All Lands' : landMap.get(it.landId) || it.landId,
    it.category,
    it.description,
    it.quantity ?? '',
    it.unit ?? '',
    it.unitPrice ?? '',
    it.amount,
  ]);

  exportToCSV(`AgriLedger_Transactions_${year}`, [headers, ...rows]);
}

export function exportPartnersCSV(distributions: PartnerDistribution[], year: number) {
  const headers = ['Partner Name', 'Role', 'Equity Share (%)', 'Initial Capital ($)', 'Assigned Scope', 'Allocated Gross Profit ($)', 'Retained Reserve ($)', 'Net Payout ($)', 'Payout Method'];
  const rows = distributions.map((d) => [
    d.partner.name,
    d.partner.role,
    `${d.partner.sharePercent}%`,
    d.partner.initialCapitalInvested,
    d.partner.assignedLandIds.length === 0 ? 'All Farm Lands' : `${d.partner.assignedLandIds.length} Assigned Parcels`,
    d.allocatedGrossProfit,
    d.retainedReserveContribution,
    d.netPayout,
    d.partner.payoutPreference,
  ]);

  exportToCSV(`AgriLedger_Partner_Payouts_${year}`, [headers, ...rows]);
}

// ================= PDF EXPORT =================
export function generateAgriculturalPDF(
  settings: FarmSettings,
  pl: PLSummary,
  lands: LandPlot[],
  distributions: PartnerDistribution[],
  activeYear: number
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Header banner
  doc.setFillColor(5, 150, 105); // Emerald-600
  doc.rect(margin, y, pageWidth - margin * 2, 54, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(settings.farmName, margin + 16, y + 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Agricultural Financial Statement & Partner P&L Distribution | Operational Year: ${activeYear}`, margin + 16, y + 42);

  y += 72;

  // Metadata line
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })} | Currency: ${settings.currency} USD | Operating Reserve: ${settings.reserveFundPercent}%`, margin, y);
  y += 18;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Executive P&L Summary Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. EXECUTIVE PROFIT & LOSS SUMMARY', margin, y);
  y += 16;

  const kpis = [
    { label: 'Gross Farm Revenue', val: formatCurrency(pl.grossRevenue, settings.currency) },
    { label: 'Total Direct Expenses', val: formatCurrency(pl.totalExpenses, settings.currency) },
    { label: 'Net Operating Profit', val: formatCurrency(pl.netProfit, settings.currency) },
    { label: 'Operating Profit Margin', val: `${pl.profitMarginPercent}%` },
    { label: 'Net Profit Per Acre', val: `${formatCurrency(pl.netProfitPerAcre, settings.currency)}/ac` },
    { label: 'Retained Farm Reserve', val: formatCurrency(pl.retainedReserve, settings.currency) },
  ];

  const colWidth = (pageWidth - margin * 2) / 3;
  let kpiY = y;
  kpis.forEach((kpi, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const boxX = margin + col * colWidth;
    const boxY = kpiY + row * 44;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(boxX, boxY, colWidth - 8, 38, 4, 4, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(boxX, boxY, colWidth - 8, 38, 4, 4, 'D');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, boxX + 8, boxY + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, boxX + 8, boxY + 28);
  });

  y = kpiY + 2 * 44 + 20;

  // Land Parcels Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. AGRICULTURAL LAND UNITS & CROPS', margin, y);
  y += 14;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text('Parcel Code & Name', margin + 6, y + 14);
  doc.text('Crop Assigned', margin + 170, y + 14);
  doc.text('Acreage', margin + 300, y + 14);
  doc.text('Irrigation Method', margin + 370, y + 14);
  doc.text('Target Yield', margin + 460, y + 14);
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  lands.forEach((land) => {
    doc.text(`${land.code} - ${land.name}`, margin + 6, y);
    doc.text(land.crop, margin + 170, y);
    doc.text(`${land.totalAcreage} acres`, margin + 300, y);
    doc.text(land.irrigationType.split(' ')[0] + ' ' + (land.irrigationType.split(' ')[1] || ''), margin + 370, y);
    doc.text(`${land.targetYieldPerAcre} ${land.yieldUnit}/ac`, margin + 460, y);

    y += 16;
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y - 4, pageWidth - margin, y - 4);
  });

  y += 18;

  // Partner Equity & Payout Distribution
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. MULTI-PARTNER EQUITY DISTRIBUTION & STATEMENTS', margin, y);
  y += 14;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text('Partner Name & Role', margin + 6, y + 14);
  doc.text('Share %', margin + 190, y + 14);
  doc.text('Allocated Profit', margin + 250, y + 14);
  doc.text('Reserve Contribution', margin + 350, y + 14);
  doc.text('Net Cash Payout', margin + 450, y + 14);
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  distributions.forEach((d) => {
    doc.setFont('helvetica', 'bold');
    doc.text(d.partner.name, margin + 6, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(d.partner.role, margin + 6, y + 10);
    doc.setTextColor(30, 41, 59);

    doc.text(`${d.partner.sharePercent}%`, margin + 190, y);
    doc.text(formatCurrency(d.allocatedGrossProfit, settings.currency), margin + 250, y);
    doc.text(formatCurrency(d.retainedReserveContribution, settings.currency), margin + 350, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(formatCurrency(d.netPayout, settings.currency), margin + 450, y);
    doc.setTextColor(30, 41, 59);

    y += 24;
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y - 4, pageWidth - margin, y - 4);
  });

  y += 20;

  // Signoff & Certification
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Certified accurate in accordance with farm operating agreement and agricultural accrual accounting standards. Generated automatically by AgriLedger.',
    margin,
    y
  );

  doc.save(`${settings.farmName.replace(/\s+/g, '_')}_Financial_Statement_${activeYear}.pdf`);
}

// Backup & Restore
export function downloadBackupJSON(data: any) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `agriledger_farm_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
