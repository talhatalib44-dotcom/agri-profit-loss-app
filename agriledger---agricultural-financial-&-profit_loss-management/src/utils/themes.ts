import { ThemeConfig } from '../types';

export const PRESET_THEMES: Record<string, ThemeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Farm',
    primaryColor: '#059669', // emerald-600
    secondaryColor: '#064e3b', // emerald-900
    accentColor: '#10b981', // emerald-500
    isDark: false,
  },
  slate: {
    id: 'slate',
    name: 'Modern Slate',
    primaryColor: '#3b82f6', // blue-500
    secondaryColor: '#1e293b', // slate-800
    accentColor: '#0ea5e9', // sky-500
    isDark: false,
  },
  harvest: {
    id: 'harvest',
    name: 'Golden Harvest',
    primaryColor: '#d97706', // amber-600
    secondaryColor: '#78350f', // amber-900
    accentColor: '#f59e0b', // amber-500
    isDark: false,
  },
  charcoal: {
    id: 'charcoal',
    name: 'Dark Charcoal',
    primaryColor: '#10b981', // emerald-500
    secondaryColor: '#090d16', // deep dark
    accentColor: '#34d399', // emerald-400
    isDark: true,
  },
};

export const DEFAULT_TABS = [
  { id: 'overview', name: 'Overview & KPIs', enabled: true },
  { id: 'lands', name: 'Multi-Land Parcels', enabled: true },
  { id: 'ledger', name: 'P&L Ledger & Engine', enabled: true },
  { id: 'equity', name: 'Partner Equity & Payouts', enabled: true },
  { id: 'analytics', name: 'Cross-Land & YoY Analytics', enabled: true },
  { id: 'flow', name: 'Money Flow Diagram', enabled: true },
  { id: 'forecasting', name: 'AI Predictive Forecast', enabled: true },
];
