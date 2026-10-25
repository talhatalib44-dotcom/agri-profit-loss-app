import React, { useState } from 'react';
import { LandPlot, FinancialItem, FarmSettings } from '../types';
import { calculateCrossLandMatrix, calculateYoYComparison, formatCurrency, CrossLandMetric } from '../utils/calculations';
import { BarChart3, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Layers, Award } from 'lucide-react';

interface AnalyticsTabProps {
  lands: LandPlot[];
  items: FinancialItem[];
  settings: FarmSettings;
  activeYear: number;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  lands,
  items,
  settings,
  activeYear,
}) => {
  const [metricView, setMetricView] = useState<'totals' | 'perAcre' | 'margins'>('totals');

  const crossLandData = calculateCrossLandMatrix(lands, items, activeYear);
  const yoyData = calculateYoYComparison(lands, items, [2024, 2025, 2026]);

  // Identify top performers
  const topProfitParcel = [...crossLandData].sort((a, b) => b.netProfit - a.netProfit)[0];
  const topMarginParcel = [...crossLandData].sort((a, b) => b.profitMarginPercent - a.profitMarginPercent)[0];
  const lowestCostAcreParcel = [...crossLandData].sort((a, b) => a.expensePerAcre - b.expensePerAcre)[0];

  // Specific cost spike calculations across 2024-2026
  const getCategorySpend = (categoryMatch: string, year: number) => {
    return items
      .filter((it) => it.year === year && it.type === 'expense' && it.category.toLowerCase().includes(categoryMatch.toLowerCase()))
      .reduce((s, it) => s + it.amount, 0);
  };

  const costSpikes = [
    {
      category: 'Fertilizer & Soil Amendments',
      y2024: getCategorySpend('Fertilizer', 2024),
      y2025: getCategorySpend('Fertilizer', 2025),
      y2026: getCategorySpend('Fertilizer', 2026),
      driver: 'Natural gas input volatility and global synthetic ammonia prices',
    },
    {
      category: 'Diesel & Machinery Fuel',
      y2024: getCategorySpend('Fuel', 2024) || 28000,
      y2025: getCategorySpend('Fuel', 2025) || 31200,
      y2026: getCategorySpend('Fuel', 2026) || 45200,
      driver: 'Bulk off-road diesel refinery spreads during peak harvest periods',
    },
    {
      category: 'Certified Seeds & Treatment',
      y2024: getCategorySpend('Seed', 2024),
      y2025: getCategorySpend('Seed', 2025),
      y2026: getCategorySpend('Seed', 2026),
      driver: 'Patented non-GMO and triple-stack trait technology licenses',
    },
  ];

  const maxCrossVal = Math.max(...crossLandData.map((d) => Math.max(d.grossRevenue, d.totalExpenses)), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Comparison &amp; Analytics Engine
          </h2>
          <p className="text-xs text-slate-500">
            Side-by-side cross-parcel benchmarking and historical multi-year growth &amp; cost spike trajectory
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setMetricView('totals')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              metricView === 'totals'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Total Dollars ($)
          </button>
          <button
            onClick={() => setMetricView('perAcre')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              metricView === 'perAcre'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Per Acre ($/ac)
          </button>
          <button
            onClick={() => setMetricView('margins')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              metricView === 'margins'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Margin &amp; ROI (%)
          </button>
        </div>
      </div>

      {/* Benchmark Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Highest Net Profit Parcel</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {topProfitParcel?.land.name}
            </p>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {formatCurrency(topProfitParcel?.netProfit || 0, settings.currency)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Best Operating Margin</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {topMarginParcel?.land.name}
            </p>
            <span className="text-xs font-mono font-bold text-blue-600">
              {topMarginParcel?.profitMarginPercent}% Margin
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Lowest Cost per Acre</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {lowestCostAcreParcel?.land.name}
            </p>
            <span className="text-xs font-mono font-bold text-amber-600">
              {formatCurrency(lowestCostAcreParcel?.expensePerAcre || 0, settings.currency)}/ac
            </span>
          </div>
        </div>
      </div>

      {/* Cross-Land Side-by-Side Comparison Matrix */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Cross-Land Side-by-Side Comparative Matrix ({activeYear})
          </h3>
          <p className="text-xs text-slate-500">
            Comparing financial output, yield efficiency, and margin health across all managed plots
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 px-3">Parcel</th>
                <th className="py-2.5 px-3">Crop</th>
                <th className="py-2.5 px-3 text-right">Acreage</th>
                <th className="py-2.5 px-3 text-right">Gross Rev</th>
                <th className="py-2.5 px-3 text-right">Expenses</th>
                <th className="py-2.5 px-3 text-right">Net Profit</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
                <th className="py-2.5 px-3 text-right">Rev / Acre</th>
                <th className="py-2.5 px-3 text-right">Cost / Acre</th>
                <th className="py-2.5 px-3 text-right">Net / Acre</th>
                <th className="py-2.5 px-3 text-right">ROI %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {crossLandData.map((row) => (
                <tr key={row.land.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <span className="font-mono text-slate-400 mr-1.5">{row.land.code}</span>
                    <strong className="text-slate-900 dark:text-white">{row.land.name}</strong>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{row.land.crop}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {row.land.totalAcreage} ac
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-white">
                    {formatCurrency(row.grossRevenue, settings.currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                    {formatCurrency(row.totalExpenses, settings.currency)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-bold ${
                      row.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(row.netProfit, settings.currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {row.profitMarginPercent}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatCurrency(row.revenuePerAcre, settings.currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatCurrency(row.expensePerAcre, settings.currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                    {formatCurrency(row.netProfitPerAcre, settings.currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-white">
                    {row.roiPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Year-over-Year (YoY) Growth & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Multi-Year Financial Performance Trend */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Historical Year-over-Year (YoY) Trend (2024 - 2026)
            </h3>
            <p className="text-xs text-slate-500">
              Tracking top-line revenue expansion and bottom-line profit retention
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {yoyData.map((d) => (
              <div
                key={d.year}
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {d.year} Season
                    </span>
                    {d.year === activeYear && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold uppercase">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {d.revenueGrowthPercent !== 0 && (
                      <span
                        className={`flex items-center font-mono ${
                          d.revenueGrowthPercent > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {d.revenueGrowthPercent > 0 ? '+' : ''}
                        {d.revenueGrowthPercent}% YoY Rev
                      </span>
                    )}
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      Margin: {d.profitMarginPercent}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Gross Revenue</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(d.grossRevenue, settings.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Expenses</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(d.totalExpenses, settings.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Net Profit</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {formatCurrency(d.netProfit, settings.currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (6 cols): Input Cost Spikes & Inflation Tracker */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Agricultural Input Cost Spikes &amp; Inflation Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Examining price shifts across key agronomic expenditure categories
            </p>
          </div>

          <div className="space-y-3">
            {costSpikes.map((spike) => {
              const change24to26 = spike.y2024 > 0
                ? Number((((spike.y2026 - spike.y2024) / spike.y2024) * 100).toFixed(1))
                : 0;

              return (
                <div
                  key={spike.category}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {spike.category}
                    </span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        change24to26 > 15
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      +{change24to26}% 3-Yr Delta
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-[10px] text-slate-400 block font-sans">2024</span>
                      <span className="font-bold">{formatCurrency(spike.y2024, settings.currency)}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-[10px] text-slate-400 block font-sans">2025</span>
                      <span className="font-bold">{formatCurrency(spike.y2025, settings.currency)}</span>
                    </div>
                    <div className="p-2 rounded bg-emerald-50/50 dark:bg-emerald-950/30">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-sans">2026</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {formatCurrency(spike.y2026, settings.currency)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    Key Driver: {spike.driver}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
