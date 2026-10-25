import { LandPlot, FinancialItem, Partner, PLSummary, PartnerDistribution } from '../types';

export function calculatePL(
  items: FinancialItem[],
  lands: LandPlot[],
  filterYear?: number | 'all',
  filterLandId?: string | 'all',
  reservePercent: number = 10
): PLSummary {
  // Filter items
  const filteredItems = items.filter((item) => {
    const matchYear = filterYear === 'all' || !filterYear || item.year === filterYear;
    const matchLand = filterLandId === 'all' || !filterLandId || item.landId === filterLandId;
    return matchYear && matchLand;
  });

  // Calculate acreage in scope
  let totalAcreage = 0;
  if (!filterLandId || filterLandId === 'all') {
    totalAcreage = lands.reduce((sum, land) => sum + land.totalAcreage, 0);
  } else {
    const target = lands.find((l) => l.id === filterLandId);
    totalAcreage = target ? target.totalAcreage : 0;
  }
  if (totalAcreage <= 0) totalAcreage = 1; // avoid division by zero

  let grossRevenue = 0;
  let totalExpenses = 0;
  const revenueByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  filteredItems.forEach((item) => {
    if (item.type === 'revenue') {
      grossRevenue += item.amount;
      revenueByCategory[item.category] = (revenueByCategory[item.category] || 0) + item.amount;
    } else {
      totalExpenses += item.amount;
      expenseByCategory[item.category] = (expenseByCategory[item.category] || 0) + item.amount;
    }
  });

  const netProfit = grossRevenue - totalExpenses;
  const isProfit = netProfit >= 0;
  const profitMarginPercent = grossRevenue > 0 ? Number(((netProfit / grossRevenue) * 100).toFixed(2)) : 0;
  const roiPercent = totalExpenses > 0 ? Number(((netProfit / totalExpenses) * 100).toFixed(2)) : 0;

  const revenuePerAcre = Number((grossRevenue / totalAcreage).toFixed(2));
  const expensePerAcre = Number((totalExpenses / totalAcreage).toFixed(2));
  const netProfitPerAcre = Number((netProfit / totalAcreage).toFixed(2));

  const retainedReserve = isProfit ? Math.round(netProfit * (reservePercent / 100)) : 0;
  const distributableProfit = isProfit ? netProfit - retainedReserve : netProfit;

  return {
    grossRevenue,
    totalExpenses,
    netProfit,
    isProfit,
    profitMarginPercent,
    roiPercent,
    totalAcreage,
    revenuePerAcre,
    expensePerAcre,
    netProfitPerAcre,
    revenueByCategory,
    expenseByCategory,
    retainedReserve,
    distributableProfit,
  };
}

export function calculatePartnerDistributions(
  partners: Partner[],
  overallPL: PLSummary,
  lands: LandPlot[],
  items: FinancialItem[],
  year: number
): PartnerDistribution[] {
  // Normalize partner shares if needed
  const totalShareDeclared = partners.reduce((sum, p) => sum + p.sharePercent, 0) || 100;

  return partners.map((partner) => {
    // If partner is assigned to specific lands only, calculate that specific sub-P&L
    let targetDistributable = overallPL.distributableProfit;
    let targetReserve = overallPL.retainedReserve;
    let assignedAcreage = lands.reduce((s, l) => s + l.totalAcreage, 0);

    if (partner.assignedLandIds && partner.assignedLandIds.length > 0) {
      const partnerLands = lands.filter((l) => partner.assignedLandIds.includes(l.id));
      assignedAcreage = partnerLands.reduce((s, l) => s + l.totalAcreage, 0);
      const partnerItems = items.filter((it) => it.year === year && partner.assignedLandIds.includes(it.landId));
      const subPL = calculatePL(partnerItems, partnerLands, year, 'all');
      targetDistributable = subPL.distributableProfit;
      targetReserve = subPL.retainedReserve;
    }

    const effectiveSharePercent = Number(((partner.sharePercent / totalShareDeclared) * 100).toFixed(2));
    const factor = partner.sharePercent / 100;

    const allocatedGrossProfit = Math.round(overallPL.netProfit * factor);
    const retainedReserveContribution = Math.round(targetReserve * factor);
    const netPayout = Math.round(targetDistributable * factor);

    return {
      partner,
      assignedAcreage,
      allocatedGrossProfit,
      retainedReserveContribution,
      netPayout,
      effectiveSharePercent,
    };
  });
}

export interface CrossLandMetric {
  land: LandPlot;
  grossRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  roiPercent: number;
  revenuePerAcre: number;
  expensePerAcre: number;
  netProfitPerAcre: number;
  yieldEfficiencyScore: number; // e.g. rev / target yield
}

export function calculateCrossLandMatrix(
  lands: LandPlot[],
  items: FinancialItem[],
  year: number
): CrossLandMetric[] {
  return lands.map((land) => {
    const landItems = items.filter((it) => it.year === year && it.landId === land.id);
    const pl = calculatePL(landItems, [land], year, land.id);

    const yieldEfficiencyScore = land.targetYieldPerAcre > 0 
      ? Number(((pl.grossRevenue / land.totalAcreage) / land.targetYieldPerAcre).toFixed(2)) 
      : 1;

    return {
      land,
      grossRevenue: pl.grossRevenue,
      totalExpenses: pl.totalExpenses,
      netProfit: pl.netProfit,
      profitMarginPercent: pl.profitMarginPercent,
      roiPercent: pl.roiPercent,
      revenuePerAcre: pl.revenuePerAcre,
      expensePerAcre: pl.expensePerAcre,
      netProfitPerAcre: pl.netProfitPerAcre,
      yieldEfficiencyScore,
    };
  });
}

export interface YoYDataPoint {
  year: number;
  grossRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  revenueGrowthPercent: number;
  expenseChangePercent: number;
}

export function calculateYoYComparison(
  lands: LandPlot[],
  items: FinancialItem[],
  years: number[] = [2024, 2025, 2026]
): YoYDataPoint[] {
  const sortedYears = [...years].sort((a, b) => a - b);
  const results: YoYDataPoint[] = [];

  sortedYears.forEach((year, index) => {
    const pl = calculatePL(items, lands, year, 'all');
    let revenueGrowthPercent = 0;
    let expenseChangePercent = 0;

    if (index > 0) {
      const prev = results[index - 1];
      if (prev.grossRevenue > 0) {
        revenueGrowthPercent = Number((((pl.grossRevenue - prev.grossRevenue) / prev.grossRevenue) * 100).toFixed(1));
      }
      if (prev.totalExpenses > 0) {
        expenseChangePercent = Number((((pl.totalExpenses - prev.totalExpenses) / prev.totalExpenses) * 100).toFixed(1));
      }
    }

    results.push({
      year,
      grossRevenue: pl.grossRevenue,
      totalExpenses: pl.totalExpenses,
      netProfit: pl.netProfit,
      profitMarginPercent: pl.profitMarginPercent,
      revenueGrowthPercent,
      expenseChangePercent,
    });
  });

  return results;
}

export function formatCurrency(amount: number, currency = '$'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${isNegative ? '-' : ''}${currency}${formatted}`;
}

export function formatNumber(val: number): string {
  return val.toLocaleString('en-US');
}
