import React, { useState } from 'react';
import { FarmSettings, ThemeConfig, ThemeId } from '../types';
import { PRESET_THEMES } from '../utils/themes';
import { X, Check, RotateCcw, Palette, Sliders, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FarmSettings;
  onSaveSettings: (settings: FarmSettings) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  if (!isOpen) return null;

  const [activeSubTab, setActiveSubTab] = useState<'theme' | 'tabs' | 'farm'>('theme');
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(settings.theme);
  const [farmName, setFarmName] = useState(settings.farmName);
  const [legalEntity, setLegalEntity] = useState(settings.legalEntity);
  const [reserveFundPercent, setReserveFundPercent] = useState(settings.reserveFundPercent);
  const [tabs, setTabs] = useState(settings.tabsOrder);
  const [customPrimary, setCustomPrimary] = useState(settings.theme.primaryColor || '#059669');
  const [customSecondary, setCustomSecondary] = useState(settings.theme.secondaryColor || '#064e3b');

  const handleSelectPreset = (themeId: ThemeId) => {
    const preset = PRESET_THEMES[themeId];
    if (preset) {
      setCurrentTheme(preset);
      setCustomPrimary(preset.primaryColor);
      setCustomSecondary(preset.secondaryColor);
    }
  };

  const handleApplyCustomColors = () => {
    const customConfig: ThemeConfig = {
      id: 'custom',
      name: 'Custom Palette',
      primaryColor: customPrimary,
      secondaryColor: customSecondary,
      accentColor: customPrimary,
      isDark: false,
    };
    setCurrentTheme(customConfig);
  };

  const handleMoveTab = (index: number, direction: 'up' | 'down') => {
    const newTabs = [...tabs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newTabs.length) return;
    const temp = newTabs[index];
    newTabs[index] = newTabs[targetIndex];
    newTabs[targetIndex] = temp;
    setTabs(newTabs);
  };

  const handleToggleTab = (id: string) => {
    setTabs(
      tabs.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      theme: currentTheme,
      farmName,
      legalEntity,
      reserveFundPercent,
      tabsOrder: tabs,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Workspace &amp; Theme Settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure visual aesthetic, dashboard tab layout, and farm operating parameters</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <button
            onClick={() => setActiveSubTab('theme')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'theme'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Theme &amp; Colors
          </button>
          <button
            onClick={() => setActiveSubTab('tabs')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'tabs'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Tab Order &amp; Layout
          </button>
          <button
            onClick={() => setActiveSubTab('farm')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'farm'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Farm Entity &amp; Reserves
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeSubTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                  Predefined Aesthetic Themes
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.values(PRESET_THEMES).map((preset) => {
                    const isSelected = currentTheme.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.id as ThemeId)}
                        className={`p-3 rounded-lg border text-left transition-all relative ${
                          isSelected
                            ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
                            style={{ backgroundColor: preset.primaryColor }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
                            style={{ backgroundColor: preset.secondaryColor }}
                          />
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{preset.name}</p>
                        {isSelected && (
                          <span className="absolute top-2 right-2 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Custom Color Palette</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Primary Brand Accent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customPrimary}
                        onChange={(e) => setCustomPrimary(e.target.value)}
                        className="w-9 h-9 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={customPrimary}
                        onChange={(e) => setCustomPrimary(e.target.value)}
                        className="text-xs font-mono px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md flex-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Secondary Tone</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customSecondary}
                        onChange={(e) => setCustomSecondary(e.target.value)}
                        className="w-9 h-9 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={customSecondary}
                        onChange={(e) => setCustomSecondary(e.target.value)}
                        className="text-xs font-mono px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md flex-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyCustomColors}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Apply Custom Colors
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'tabs' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Reorder or toggle visibility of navigation modules. Disabled modules will be hidden from the main menu.
              </p>

              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                {tabs.map((tab, idx) => (
                  <div
                    key={tab.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400 w-4">{idx + 1}</span>
                      <span className={`text-xs font-medium ${tab.enabled ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through'}`}>
                        {tab.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleTab(tab.id)}
                        title={tab.enabled ? 'Hide tab' : 'Show tab'}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {tab.enabled ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTab(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTab(idx, 'down')}
                        disabled={idx === tabs.length - 1}
                        title="Move Down"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'farm' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Farm Operating Brand Name
                </label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Legal Operating Entity
                </label>
                <input
                  type="text"
                  value={legalEntity}
                  onChange={(e) => setLegalEntity(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Farm Retained Operating Reserve (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={reserveFundPercent}
                    onChange={(e) => setReserveFundPercent(Number(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white w-12 text-right">
                    {reserveFundPercent}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Portion of net positive earnings retained in farm operating liquidity before partner equity distributions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
