import React, { useRef } from 'react';
import { FarmSettings, PLSummary, LandPlot, PartnerDistribution, FinancialItem, Partner } from '../types';
import { exportLedgerCSV, exportPartnersCSV, generateAgriculturalPDF, downloadBackupJSON } from '../utils/exportUtils';
import { X, FileText, Table, Database, Upload, RotateCcw, CheckCircle2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FarmSettings;
  pl: PLSummary;
  lands: LandPlot[];
  distributions: PartnerDistribution[];
  items: FinancialItem[];
  partners: Partner[];
  activeYear: number;
  onRestoreBackup: (backup: any) => void;
  onResetSampleData: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  settings,
  pl,
  lands,
  distributions,
  items,
  partners,
  activeYear,
  onRestoreBackup,
  onResetSampleData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    generateAgriculturalPDF(settings, pl, lands, distributions, activeYear);
  };

  const handleDownloadLedgerCSV = () => {
    exportLedgerCSV(items.filter((it) => it.year === activeYear), lands, activeYear);
  };

  const handleDownloadPartnerCSV = () => {
    exportPartnersCSV(distributions, activeYear);
  };

  const handleDownloadJSON = () => {
    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      lands,
      partners,
      financialItems: items,
    };
    downloadBackupJSON(fullBackup);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.lands && parsed.partners && parsed.financialItems) {
          onRestoreBackup(parsed);
          onClose();
        } else {
          alert('Invalid backup file format. Expected lands, partners, and financialItems.');
        }
      } catch (err: any) {
        alert('Failed to read JSON backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Data Export &amp; Backup</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Generate compliance statements, spreadsheets, or archive data</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* PDF Section */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Annual Financial P&amp;L Statement (PDF)</p>
                <p className="text-xs text-slate-500">Includes Executive KPI matrix, land parcel overview &amp; partner distributions</p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shrink-0"
            >
              Export PDF
            </button>
          </div>

          {/* CSV Section */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
                <Table className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Ledger Transactions &amp; Payouts (CSV)</p>
                <p className="text-xs text-slate-500">Full raw revenue and expense ledger for operational year {activeYear}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadLedgerCSV}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors"
              >
                P&amp;L CSV
              </button>
              <button
                onClick={handleDownloadPartnerCSV}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors"
              >
                Partners CSV
              </button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Database Backup &amp; Recovery</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadJSON}
                className="flex-1 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 transition-colors"
              >
                Download JSON Backup
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Restore JSON
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to restore the default sample farm dataset?')) {
                    onResetSampleData();
                    onClose();
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to Sample Dataset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
