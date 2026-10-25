import React, { useState } from 'react';
import { LandPlot, FinancialItem, FarmSettings, IrrigationType } from '../types';
import { calculatePL, formatCurrency } from '../utils/calculations';
import { Plus, Edit2, Trash2, MapPin, Droplets, Sprout, Filter, Search, Grid, List, AlertCircle } from 'lucide-react';

interface LandsTabProps {
  lands: LandPlot[];
  items: FinancialItem[];
  settings: FarmSettings;
  activeYear: number;
  onAddLand: (land: LandPlot) => void;
  onUpdateLand: (land: LandPlot) => void;
  onDeleteLand: (landId: string) => void;
  onSelectLandForLedger: (landId: string) => void;
}

const IRRIGATION_OPTIONS: IrrigationType[] = [
  'Center Pivot Sprinkler',
  'Drip / Micro-Irrigation',
  'Dryland Rainfed',
  'Flood / Furrow',
  'Sub-Surface Irrigation',
];

export const LandsTab: React.FC<LandsTabProps> = ({
  lands,
  items,
  settings,
  activeYear,
  onAddLand,
  onUpdateLand,
  onDeleteLand,
  onSelectLandForLedger,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLand, setEditingLand] = useState<LandPlot | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCrop, setFormCrop] = useState('');
  const [formAcreage, setFormAcreage] = useState(100);
  const [formLocation, setFormLocation] = useState('');
  const [formSoil, setFormSoil] = useState('');
  const [formIrrigation, setFormIrrigation] = useState<IrrigationType>('Center Pivot Sprinkler');
  const [formTargetYield, setFormTargetYield] = useState(180);
  const [formYieldUnit, setFormYieldUnit] = useState('bushels');
  const [formNotes, setFormNotes] = useState('');

  const openAddModal = () => {
    setEditingLand(null);
    setFormName('');
    setFormCode(`P-${lands.length + 1}`);
    setFormCrop('Corn (Field Dent)');
    setFormAcreage(150);
    setFormLocation('Field Section West');
    setFormSoil('Silt Loam');
    setFormIrrigation('Center Pivot Sprinkler');
    setFormTargetYield(190);
    setFormYieldUnit('bushels');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (land: LandPlot) => {
    setEditingLand(land);
    setFormName(land.name);
    setFormCode(land.code);
    setFormCrop(land.crop);
    setFormAcreage(land.totalAcreage);
    setFormLocation(land.locationTag);
    setFormSoil(land.soilType);
    setFormIrrigation(land.irrigationType);
    setFormTargetYield(land.targetYieldPerAcre);
    setFormYieldUnit(land.yieldUnit);
    setFormNotes(land.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveLand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingLand) {
      onUpdateLand({
        ...editingLand,
        name: formName,
        code: formCode,
        crop: formCrop,
        totalAcreage: Number(formAcreage),
        locationTag: formLocation,
        soilType: formSoil,
        irrigationType: formIrrigation,
        targetYieldPerAcre: Number(formTargetYield),
        yieldUnit: formYieldUnit,
        notes: formNotes,
      });
    } else {
      const newLand: LandPlot = {
        id: `land-${Date.now()}`,
        name: formName,
        code: formCode,
        crop: formCrop,
        totalAcreage: Number(formAcreage),
        locationTag: formLocation,
        soilType: formSoil,
        irrigationType: formIrrigation,
        operationalYear: activeYear,
        targetYieldPerAcre: Number(formTargetYield),
        yieldUnit: formYieldUnit,
        notes: formNotes,
      };
      onAddLand(newLand);
    }
    setIsModalOpen(false);
  };

  const filteredLands = lands.filter((land) => {
    const matchesSearch =
      land.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      land.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      land.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      land.locationTag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCrop = cropFilter === 'all' || land.crop === cropFilter;
    return matchesSearch && matchesCrop;
  });

  const uniqueCrops = Array.from(new Set(lands.map((l) => l.crop)));

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Agricultural Land Units &amp; Plots
          </h2>
          <p className="text-xs text-slate-500">
            Manage field parcels, assigned crops, soil types, acreage, and per-plot financial performance for {activeYear}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-opacity hover:opacity-90 flex items-center gap-1.5 self-start sm:self-auto"
          style={{ backgroundColor: settings.theme.primaryColor || '#059669' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Land Parcel</span>
        </button>
      </div>

      {/* Filter & View Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search parcels by name, crop, soil, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Crop Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 shrink-0">Crop:</span>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">All Crops ({lands.length})</option>
              {uniqueCrops.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 self-end sm:self-auto p-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded text-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Grid View"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1 rounded text-xs transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Table View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredLands.map((land) => {
            const landItems = items.filter((it) => it.year === activeYear && it.landId === land.id);
            const pl = calculatePL(landItems, [land], activeYear, land.id);

            return (
              <div
                key={land.id}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top line: Code, Name, Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {land.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {land.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{land.crop}</span>
                        <span>·</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {land.totalAcreage.toLocaleString()} Managed Acres
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(land)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="Edit Land Parcel"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete parcel "${land.name}"? Transactions assigned to this land will remain unassigned.`)) {
                            onDeleteLand(land.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
                        title="Delete Land Parcel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Parcel Tags & Details */}
                  <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{land.locationTag}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Droplets className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{land.irrigationType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Sprout className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Target: {land.targetYieldPerAcre} {land.yieldUnit}/ac</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] font-bold">S</span>
                      <span className="truncate">{land.soilType}</span>
                    </div>
                  </div>

                  {land.notes && (
                    <p className="text-xs text-slate-500 italic mb-3">
                      "{land.notes}"
                    </p>
                  )}
                </div>

                {/* Financial Performance Mini-Matrix */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Revenue</p>
                      <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        {formatCurrency(pl.grossRevenue, settings.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Expenses</p>
                      <p className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                        {formatCurrency(pl.totalExpenses, settings.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Net Profit</p>
                      <p
                        className={`text-xs font-mono font-bold mt-0.5 ${
                          pl.isProfit ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(pl.netProfit, settings.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Profit / Ac</p>
                      <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        {formatCurrency(pl.netProfitPerAcre, settings.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-500">
                      Margin: <strong className="text-slate-900 dark:text-white">{pl.profitMarginPercent}%</strong>
                    </span>
                    <button
                      onClick={() => onSelectLandForLedger(land.id)}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      View Parcel Transactions &rarr;
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 px-3">Parcel</th>
                <th className="py-2.5 px-3">Crop</th>
                <th className="py-2.5 px-3 text-right">Acreage</th>
                <th className="py-2.5 px-3 text-right">Revenue</th>
                <th className="py-2.5 px-3 text-right">Expenses</th>
                <th className="py-2.5 px-3 text-right">Net Profit</th>
                <th className="py-2.5 px-3 text-right">Margin</th>
                <th className="py-2.5 px-3 text-right">Net/Acre</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredLands.map((land) => {
                const landItems = items.filter((it) => it.year === activeYear && it.landId === land.id);
                const pl = calculatePL(landItems, [land], activeYear, land.id);

                return (
                  <tr key={land.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <span className="font-mono text-slate-400 mr-1.5">{land.code}</span>
                      <strong className="text-slate-900 dark:text-white">{land.name}</strong>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{land.crop}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {land.totalAcreage.toLocaleString()} ac
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-white">
                      {formatCurrency(pl.grossRevenue, settings.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                      {formatCurrency(pl.totalExpenses, settings.currency)}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold ${
                        pl.isProfit ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(pl.netProfit, settings.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-white">
                      {pl.profitMarginPercent}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrency(pl.netProfitPerAcre, settings.currency)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(land)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete parcel "${land.name}"?`)) {
                              onDeleteLand(land.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Land Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingLand ? 'Edit Land Parcel' : 'Add New Agricultural Land Parcel'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLand} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Parcel Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Green Acres Plot A"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Plot Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. GA-01"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Crop Assigned *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCrop}
                    onChange={(e) => setFormCrop(e.target.value)}
                    placeholder="e.g. Corn (Yellow Dent #2)"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Total Acreage (Acres) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    required
                    value={formAcreage}
                    onChange={(e) => setFormAcreage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Location / Zone Tag
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. River Basin Silt Loam"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Soil Classification
                  </label>
                  <input
                    type="text"
                    value={formSoil}
                    onChange={(e) => setFormSoil(e.target.value)}
                    placeholder="e.g. Deep Silt Loam"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Irrigation System
                  </label>
                  <select
                    value={formIrrigation}
                    onChange={(e) => setFormIrrigation(e.target.value as IrrigationType)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {IRRIGATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Yield / Acre
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formTargetYield}
                    onChange={(e) => setFormTargetYield(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Yield Unit
                  </label>
                  <input
                    type="text"
                    value={formYieldUnit}
                    onChange={(e) => setFormYieldUnit(e.target.value)}
                    placeholder="bushels, tons, etc."
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Agronomic Notes &amp; Soil Prescriptions
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Variable rate nitrogen applied, high organic matter..."
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs"
                >
                  {editingLand ? 'Update Parcel' : 'Add Parcel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
