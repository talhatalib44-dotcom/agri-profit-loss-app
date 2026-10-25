import React from 'react';
import { PartnerDistribution, FarmSettings, LandPlot } from '../types';
import { formatCurrency } from '../utils/calculations';
import { X, Printer, CheckCircle2, Building, ShieldCheck } from 'lucide-react';

interface PartnerStatementModalProps {
  distribution: PartnerDistribution | null;
  onClose: () => void;
  settings: FarmSettings;
  activeYear: number;
  lands: LandPlot[];
}

export const PartnerStatementModal: React.FC<PartnerStatementModalProps> = ({
  distribution,
  onClose,
  settings,
  activeYear,
  lands,
}) => {
  if (!distribution) return null;

  const { partner, assignedAcreage, allocatedGrossProfit, retainedReserveContribution, netPayout } = distribution;

  const returnOnCapital = partner.initialCapitalInvested > 0
    ? Number(((netPayout / partner.initialCapitalInvested) * 100).toFixed(1))
    : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 no-print">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Partner Equity Distribution Statement
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900">
          {/* Statement Header */}
          <div className="border-b-2 border-slate-900 dark:border-white pb-4 flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">
                Official Equity P&amp;L Distribution Schedule
              </p>
              <h1 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                {settings.farmName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {settings.legalEntity} · Fiscal Operational Cycle: {activeYear}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Document Reference</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                DIS-{activeYear}-{partner.id.toUpperCase()}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Issued: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </span>
            </div>
          </div>

          {/* Partner Metadata Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Beneficiary Partner</span>
              <strong className="text-sm text-slate-900 dark:text-white block mt-0.5">{partner.name}</strong>
              <span className="text-slate-500">{partner.role}</span>
              <div className="text-slate-500 mt-1">{partner.email}</div>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Equity &amp; Capital Position</span>
              <div className="mt-0.5 space-y-0.5">
                <div>
                  Declared Equity Share: <strong className="font-mono text-emerald-600">{partner.sharePercent}%</strong>
                </div>
                <div>
                  Initial Capital Invested: <span className="font-mono font-bold">{formatCurrency(partner.initialCapitalInvested, settings.currency)}</span>
                </div>
                <div>
                  Payout Method: <span className="font-medium text-slate-700 dark:text-slate-300">{partner.payoutPreference}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Distribution Calculation Summary
            </h3>
            <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 text-xs">
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <td className="py-2.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Allocated Gross Net Operating Profit ({partner.sharePercent}%)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(allocatedGrossProfit, settings.currency)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                    Less: Mandatory Farm Operating Reserve Contribution ({settings.reserveFundPercent}%)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-amber-600 dark:text-amber-400">
                    -{formatCurrency(retainedReserveContribution, settings.currency)}
                  </td>
                </tr>
                <tr className="bg-emerald-50/70 dark:bg-emerald-950/40">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    Net Cash Payout Disbursable
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-base font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(netPayout, settings.currency)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                    Annual Return on Initial Invested Capital (ROC %)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {returnOnCapital}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Allocation Scope & Governance */}
          <div className="text-xs text-slate-500 space-y-2 pt-2">
            <p>
              <strong>Allocation Scope:</strong> {partner.assignedLandIds.length === 0 ? 'Full Farm Operations (Global Equity across all managed plots)' : `${partner.assignedLandIds.length} Dedicated Parcel(s)`}.
            </p>
            <p className="italic text-[11px]">
              This statement reflects net agricultural operational results prepared under cash-accrual farm accounting principles. Retained reserves remain held in the partnership liquidity escrow for machinery replacement and pre-season crop input purchases.
            </p>
          </div>

          {/* Signature Block */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="border-b border-slate-300 dark:border-slate-700 pb-8" />
              <p className="font-semibold text-slate-900 dark:text-white mt-1">Authorized Managing Partner</p>
              <p className="text-[11px] text-slate-500">Prairie Horizon Agricultural Holdings</p>
            </div>
            <div>
              <div className="border-b border-slate-300 dark:border-slate-700 pb-8" />
              <p className="font-semibold text-slate-900 dark:text-white mt-1">Partner Signature / Acknowledgement</p>
              <p className="text-[11px] text-slate-500">{partner.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
