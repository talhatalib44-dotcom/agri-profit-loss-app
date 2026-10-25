import React, { useState } from 'react';
import { FarmSettings, PLSummary, LandPlot, PartnerDistribution, FinancialItem } from '../types';
import { formatCurrency } from '../utils/calculations';
import { TrendingUp, TrendingDown, DollarSign, Sprout, PieChart, BarChart3, Users, ArrowUpRight, ArrowDownRight, Layers, Sparkles } from 'lucide-react';

interface OverviewTabProps {
  settings: FarmSettings;
  pl: PLSummary;
  lands: LandPlot[];
  distributions: PartnerDistribution[];
  items: FinancialItem[];
  activeYear: number;
  onNavigateTab: (tabId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  settings,
  pl,
  lands,
  distributions,
  items,
  activeYear,
  onNavigateTab,
}) => {
  const [selectedExpenseCat, setSelectedExpenseCat] = useState<string | null>(null);

  // Categorical Expenses list sorted by amount
  const sortedExpenseCategories = Object.entries(pl.expenseByCategory)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percent: pl.totalExpenses > 0 ? Number(((amt / pl.totalExpenses) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Categorical Revenue list
  const sortedRevenueCategories = Object.entries(pl.revenueByCategory)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percent: pl.grossRevenue > 0 ? Number(((amt / pl.grossRevenue) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Mock quarterly aggregation for visual bar chart
  const quarters = [
    { name: 'Q1 (Prep & Inputs)', rev: Math.round(pl.grossRevenue * 0.08), exp: Math.round(pl.totalExpenses * 0.42) },
    { name: 'Q2 (Planting & Sowing)', rev: Math.round(pl.grossRevenue * 0.14), exp: Math.round(pl.totalExpenses * 0.28) },
    { name: 'Q3 (Contracts & Hay)', rev: Math.round(pl.grossRevenue * 0.32), exp: Math.round(pl.totalExpenses * 0.16) },
    { name: 'Q4 (Grain Harvest)', rev: Math.round(pl.grossRevenue * 0.46), exp: Math.round(pl.totalExpenses * 0.14) },
  ];

  const maxQuarterVal = Math.max(...quarters.map((q) => Math.max(q.rev, q.exp)), 1);

  return (
    <div className="space-y-6">
      {/* Top Banner / Farm Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Operational Cycle</span>
            <span>·</span>
            <span className="text-slate-900 dark:text-white font-bold">{activeYear} Fiscal Season</span>
            <span>·</span>
            <span>{lands.length} Active Parcels</span>
            <span>·</span>
            <span>{pl.totalAcreage.toLocaleString()} Total Managed Acres</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {settings.farmName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('ledger')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            + Add Transaction
          </button>
          <button
            onClick={() => onNavigateTab('forecasting')}
            className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5"
            style={{ backgroundColor: settings.theme.primaryColor || '#059669' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Season Forecast
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid (60-30-10 palette, subtle 1px border, tabular figures) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Gross Revenue */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-shadow">
          <p className="text-xs font-medium text-slate-500">Gross Revenue</p>
          <p className="text-xl font-bold font-tabular text-slate-900 dark:text-white mt-1">
            {formatCurrency(pl.grossRevenue, settings.currency)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Yield &amp; contracts</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-shadow">
          <p className="text-xs font-medium text-slate-500">Total Production Cost</p>
          <p className="text-xl font-bold font-tabular text-slate-900 dark:text-white mt-1">
            {formatCurrency(pl.totalExpenses, settings.currency)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span>Inputs &amp; machinery</span>
          </div>
        </div>

        {/* Net Profit / Loss */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-shadow">
          <p className="text-xs font-medium text-slate-500">Net Operating Profit</p>
          <p
            className={`text-xl font-bold font-tabular mt-1 ${
              pl.isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(pl.netProfit, settings.currency)}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium mt-1">
            {pl.isProfit ? (
              <span className="text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                Profitable
              </span>
            ) : (
              <span className="text-rose-600 flex items-center">
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                Operating Loss
              </span>
            )}
          </div>
        </div>

        {/* Operating Margin % */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-shadow">
          <p className="text-xs font-medium text-slate-500">Profit Margin</p>
          <p className="text-xl font-bold font-tabular text-slate-900 dark:text-white mt-1">
            {pl.profitMarginPercent}%
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span>Net / Gross rev</span>
          </div>
        </div>

        {/* Net Profit Per Acre */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-shadow">
          <p className="text-xs font-medium text-slate-500">Net Return / Acre</p>
          <p className="text-xl font-bold font-tabular text-slate-900 dark:text-white mt-1">
            {formatCurrency(pl.netProfitPerAcre, settings.currency)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span>ROI: {pl.roiPercent}%</span>
          </div>
        </div>

        {/* Partner Payout Pool */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-shadow">
          <p className="text-xs font-medium text-slate-500">Distributable Payout</p>
          <p className="text-xl font-bold font-tabular text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(pl.distributableProfit, settings.currency)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span>{settings.reserveFundPercent}% retained in fund</span>
          </div>
        </div>
      </div>

      {/* Visual Waterfall Flow Preview Strip */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Fiscal Flow Breakdown
          </span>
          <button
            onClick={() => onNavigateTab('flow')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1"
          >
            <span>Open Interactive Process Diagram</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center">
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">1. Total Revenue</span>
            <p className="text-sm font-bold font-tabular text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(pl.grossRevenue, settings.currency)}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">2. Production Costs</span>
            <p className="text-sm font-bold font-tabular text-rose-600 dark:text-rose-400 mt-0.5">
              -{formatCurrency(pl.totalExpenses, settings.currency)}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">3. Net Operating</span>
            <p className="text-sm font-bold font-tabular text-slate-900 dark:text-white mt-0.5">
              ={formatCurrency(pl.netProfit, settings.currency)}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">4. Farm Reserve ({settings.reserveFundPercent}%)</span>
            <p className="text-sm font-bold font-tabular text-amber-600 dark:text-amber-400 mt-0.5">
              -{formatCurrency(pl.retainedReserve, settings.currency)}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold">5. Partner Payouts</span>
            <p className="text-sm font-bold font-tabular text-emerald-700 dark:text-emerald-300 mt-0.5">
              {formatCurrency(pl.distributableProfit, settings.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Quarterly Progression & Categorical Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Quarterly Revenue vs Expense Bar Progression */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quarterly Operating Progression</h3>
              <p className="text-xs text-slate-500">Seasonal cash deployment vs harvest revenue realization</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
                <span className="text-slate-600 dark:text-slate-300">Revenue</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-300">Expenses</span>
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {quarters.map((q) => {
              const revPercent = (q.rev / maxQuarterVal) * 100;
              const expPercent = (q.exp / maxQuarterVal) * 100;
              const netQuarter = q.rev - q.exp;

              return (
                <div key={q.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{q.name}</span>
                    <span
                      className={`font-mono font-medium ${
                        netQuarter >= 0 ? 'text-emerald-600' : 'text-slate-500'
                      }`}
                    >
                      Net: {formatCurrency(netQuarter, settings.currency)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Revenue Bar */}
                    <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden relative flex items-center px-2">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-emerald-600/90 rounded-md transition-all duration-500"
                        style={{ width: `${Math.max(revPercent, 3)}%` }}
                      />
                      <span className="relative z-10 text-[11px] font-mono font-bold text-slate-900 dark:text-white drop-shadow-xs">
                        {formatCurrency(q.rev, settings.currency)}
                      </span>
                    </div>

                    {/* Expense Bar */}
                    <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden relative flex items-center px-2">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-rose-500/90 rounded-md transition-all duration-500"
                        style={{ width: `${Math.max(expPercent, 3)}%` }}
                      />
                      <span className="relative z-10 text-[11px] font-mono font-bold text-slate-900 dark:text-white drop-shadow-xs">
                        {formatCurrency(q.exp, settings.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Categorical Expense Breakdown */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Direct Production Cost Share</h3>
              <p className="text-xs text-slate-500">Major input categories and expenditure share</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {sortedExpenseCategories.length} Categories
            </span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {sortedExpenseCategories.map((item, idx) => (
              <div
                key={item.category}
                onClick={() => setSelectedExpenseCat(selectedExpenseCat === item.category ? null : item.category)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  selectedExpenseCat === item.category
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="text-slate-500">{item.percent}%</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount, settings.currency)}
                    </span>
                  </div>
                </div>

                {/* Micro Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Land Parcels Quick Snapshot Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Multi-Land Parcel Performance</h3>
            <p className="text-xs text-slate-500">Summary across active agricultural plots for {activeYear}</p>
          </div>
          <button
            onClick={() => onNavigateTab('lands')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Manage All Lands</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 px-3">Parcel</th>
                <th className="py-2.5 px-3">Crop Type</th>
                <th className="py-2.5 px-3 text-right">Acreage</th>
                <th className="py-2.5 px-3">Irrigation System</th>
                <th className="py-2.5 px-3 text-right">Target Yield</th>
                <th className="py-2.5 px-3">Soil / Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {lands.map((land) => (
                <tr key={land.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] text-slate-400 mr-2">{land.code}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{land.name}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                    {land.crop}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {land.totalAcreage.toLocaleString()} ac
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {land.irrigationType}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {land.targetYieldPerAcre} {land.yieldUnit}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {land.locationTag}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
