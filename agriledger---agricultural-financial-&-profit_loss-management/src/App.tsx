import React, { useState, useEffect, useMemo } from 'react';
import {
  LandPlot,
  FinancialItem,
  Partner,
  FarmSettings,
  PLSummary,
} from './types';
import {
  INITIAL_SETTINGS,
  INITIAL_LANDS,
  INITIAL_PARTNERS,
  INITIAL_FINANCIAL_ITEMS,
} from './data/initialData';
import { calculatePL, calculatePartnerDistributions } from './utils/calculations';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { LandsTab } from './components/LandsTab';
import { LedgerTab } from './components/LedgerTab';
import { EquityTab } from './components/EquityTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { MoneyFlowTab } from './components/MoneyFlowTab';
import { ForecastingTab } from './components/ForecastingTab';
import { ThemeModal } from './components/ThemeModal';
import { ExportModal } from './components/ExportModal';

const STORAGE_KEY_SETTINGS = 'agriledger_settings_v1';
const STORAGE_KEY_LANDS = 'agriledger_lands_v1';
const STORAGE_KEY_PARTNERS = 'agriledger_partners_v1';
const STORAGE_KEY_ITEMS = 'agriledger_items_v1';

export default function App() {
  // Load from local storage with fallback
  const [settings, setSettings] = useState<FarmSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [lands, setLands] = useState<LandPlot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANDS);
      return saved ? JSON.parse(saved) : INITIAL_LANDS;
    } catch {
      return INITIAL_LANDS;
    }
  });

  const [partners, setPartners] = useState<Partner[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTNERS);
      return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
    } catch {
      return INITIAL_PARTNERS;
    }
  });

  const [items, setItems] = useState<FinancialItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_ITEMS;
    } catch {
      return INITIAL_FINANCIAL_ITEMS;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeYear, setActiveYear] = useState<number>(settings.activeYear || 2026);
  const [selectedLandIdForLedger, setSelectedLandIdForLedger] = useState<string | 'all'>('all');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANDS, JSON.stringify(lands));
  }, [lands]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PARTNERS, JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  // Apply dark mode class to html document if theme is dark
  useEffect(() => {
    if (settings.theme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme.isDark]);

  // Calculate distinct available years from transactions
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>(items.map((i) => i.year));
    yearsSet.add(2026);
    yearsSet.add(2025);
    yearsSet.add(2024);
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [items]);

  // Real-time calculated overall P&L for activeYear
  const plSummary = useMemo<PLSummary>(() => {
    return calculatePL(items, lands, activeYear, 'all', settings.reserveFundPercent);
  }, [items, lands, activeYear, settings.reserveFundPercent]);

  // Real-time calculated Partner Distributions
  const distributions = useMemo(() => {
    return calculatePartnerDistributions(partners, plSummary, lands, items, activeYear);
  }, [partners, plSummary, lands, items, activeYear]);

  // Land Handlers
  const handleAddLand = (newLand: LandPlot) => {
    setLands((prev) => [...prev, newLand]);
  };

  const handleUpdateLand = (updatedLand: LandPlot) => {
    setLands((prev) => prev.map((l) => (l.id === updatedLand.id ? updatedLand : l)));
  };

  const handleDeleteLand = (landId: string) => {
    setLands((prev) => prev.filter((l) => l.id !== landId));
  };

  // Transaction Handlers
  const handleAddItem = (newItem: FinancialItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  const handleUpdateItem = (updatedItem: FinancialItem) => {
    setItems((prev) => prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)));
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Partner Handlers
  const handleAddPartner = (newPartner: Partner) => {
    setPartners((prev) => [...prev, newPartner]);
  };

  const handleUpdatePartner = (updatedPartner: Partner) => {
    setPartners((prev) => prev.map((p) => (p.id === updatedPartner.id ? updatedPartner : p)));
  };

  const handleDeletePartner = (partnerId: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== partnerId));
  };

  // Reset to Sample Data
  const handleResetSampleData = () => {
    setSettings(INITIAL_SETTINGS);
    setLands(INITIAL_LANDS);
    setPartners(INITIAL_PARTNERS);
    setItems(INITIAL_FINANCIAL_ITEMS);
    setActiveYear(2026);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_LANDS);
    localStorage.removeItem(STORAGE_KEY_PARTNERS);
    localStorage.removeItem(STORAGE_KEY_ITEMS);
  };

  // Restore Backup
  const handleRestoreBackup = (backup: any) => {
    if (backup.settings) setSettings(backup.settings);
    if (backup.lands) setLands(backup.lands);
    if (backup.partners) setPartners(backup.partners);
    if (backup.financialItems) setItems(backup.financialItems);
  };

  const handleSelectLandForLedger = (landId: string) => {
    setSelectedLandIdForLedger(landId);
    setActiveTab('ledger');
  };

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Navigation */}
      <Navbar
        settings={settings}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        activeYear={activeYear}
        onSelectYear={setActiveYear}
        availableYears={availableYears}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            settings={settings}
            pl={plSummary}
            lands={lands}
            distributions={distributions}
            items={items}
            activeYear={activeYear}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'lands' && (
          <LandsTab
            lands={lands}
            items={items}
            settings={settings}
            activeYear={activeYear}
            onAddLand={handleAddLand}
            onUpdateLand={handleUpdateLand}
            onDeleteLand={handleDeleteLand}
            onSelectLandForLedger={handleSelectLandForLedger}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerTab
            items={items}
            lands={lands}
            settings={settings}
            activeYear={activeYear}
            selectedLandId={selectedLandIdForLedger}
            onSelectLandId={setSelectedLandIdForLedger}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === 'equity' && (
          <EquityTab
            partners={partners}
            distributions={distributions}
            lands={lands}
            settings={settings}
            activeYear={activeYear}
            pl={plSummary}
            onAddPartner={handleAddPartner}
            onUpdatePartner={handleUpdatePartner}
            onDeletePartner={handleDeletePartner}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            lands={lands}
            items={items}
            settings={settings}
            activeYear={activeYear}
          />
        )}

        {activeTab === 'flow' && (
          <MoneyFlowTab
            settings={settings}
            pl={plSummary}
            lands={lands}
            distributions={distributions}
            items={items}
            activeYear={activeYear}
          />
        )}

        {activeTab === 'forecasting' && (
          <ForecastingTab
            settings={settings}
            pl={plSummary}
            lands={lands}
            items={items}
            activeYear={activeYear}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 py-4 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-300">
              {settings.farmName}
            </span>
            <span>·</span>
            <span>{settings.legalEntity}</span>
            <span>·</span>
            <span>Accrual Agricultural P&amp;L Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Active Season: {activeYear}</span>
            <span>Managed Acreage: {plSummary.totalAcreage.toLocaleString()} ac</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Export / Backup
            </button>
          </div>
        </div>
      </footer>

      {/* Theme & Layout Customization Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />

      {/* Export & Backup Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        settings={settings}
        pl={plSummary}
        lands={lands}
        distributions={distributions}
        items={items}
        partners={partners}
        activeYear={activeYear}
        onRestoreBackup={handleRestoreBackup}
        onResetSampleData={handleResetSampleData}
      />
    </div>
  );
}
