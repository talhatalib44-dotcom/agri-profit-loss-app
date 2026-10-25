import React from 'react';
import { FarmSettings } from '../types';
import { Sliders, Download, Sparkles, Layers } from 'lucide-react';

interface NavbarProps {
  settings: FarmSettings;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenThemeModal: () => void;
  onOpenExportModal: () => void;
  activeYear: number;
  onSelectYear: (year: number) => void;
  availableYears: number[];
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeTab,
  onSelectTab,
  onOpenThemeModal,
  onOpenExportModal,
  activeYear,
  onSelectYear,
  availableYears,
}) => {
  const visibleTabs = settings.tabsOrder.filter((t) => t.enabled);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs"
              style={{ backgroundColor: settings.theme.primaryColor || '#059669' }}
            >
              AL
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                AgriLedger
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: settings.theme.primaryColor || '#059669' }
                      : undefined
                  }
                >
                  {tab.name}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Year Selector */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Operational Year Picker */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => onSelectYear(yr)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all whitespace-nowrap ${
                    activeYear === yr
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Customize Theme & Layout */}
            <button
              type="button"
              onClick={onOpenThemeModal}
              title="Configure Theme & Layout"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Primary Action Button: Export */}
            <button
              type="button"
              onClick={onOpenExportModal}
              className="px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-opacity hover:opacity-90 flex items-center gap-1.5 whitespace-nowrap shrink-0"
              style={{ backgroundColor: settings.theme.secondaryColor || '#064e3b' }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export P&amp;L</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Tab Strip */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/80 -mx-4 px-4 scrollbar-none">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={
                  isActive
                    ? { backgroundColor: settings.theme.primaryColor || '#059669' }
                    : undefined
                }
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
