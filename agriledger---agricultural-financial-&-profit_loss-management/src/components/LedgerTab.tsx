import React, { useState } from 'react';
import { FinancialItem, LandPlot, FarmSettings, RevenueCategory, ExpenseCategory } from '../types';
import { calculatePL, formatCurrency } from '../utils/calculations';
import { Plus, Search, Filter, Trash2, Edit3, ArrowUpRight, ArrowDownRight, Download, DollarSign } from 'lucide-react';
import { exportLedgerCSV } from '../utils/exportUtils';

interface LedgerTabProps {
  items: FinancialItem[];
  lands: LandPlot[];
  settings: FarmSettings;
  activeYear: number;
  selectedLandId: string | 'all';
  onSelectLandId: (landId: string | 'all') => void;
  onAddItem: (item: FinancialItem) => void;
  onUpdateItem: (item: FinancialItem) => void;
  onDeleteItem: (itemId: string) => void;
}

const REVENUE_CATEGORIES: RevenueCategory[] = [
  'Yield Sales (Cash Grain)',
  'Forward & Futures Contracts',
  'Crop Insurance Settlements',
  'Byproduct & Stover Sales',
  'Government / USDA Grants',
  'Custom Harvesting & Rental',
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Certified Seeds & Treatment',
  'Fertilizer & Soil Amendments',
  'Chemicals & Crop Protection',
  'Diesel Fuel & Machinery Lubricants',
  'Equipment Lease & Depreciation',
  'Field Operators & Seasonal Labor',
  'Irrigation Electricity & Water Rights',
  'Crop Drying & Grain Storage',
  'Agronomy Advisory & Insurance',
];

export const LedgerTab: React.FC<LedgerTabProps> = ({
  items,
  lands,
  settings,
  activeYear,
  selectedLandId,
  onSelectLandId,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);

  // Form states
  const [formType, setFormType] = useState<'revenue' | 'expense'>('revenue');
  const [formLandId, setFormLandId] = useState<string>(lands[0]?.id || 'land-1');
  const [formCategory, setFormCategory] = useState<string>(REVENUE_CATEGORIES[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formQuantity, setFormQuantity] = useState<number | undefined>(undefined);
  const [formUnitPrice, setFormUnitPrice] = useState<number | undefined>(undefined);
  const [formUnit, setFormUnit] = useState<string>('bushels');

  const landMap = new Map(lands.map((l) => [l.id, l.name]));

  // Recalculate P&L for current filtered scope
  const pl = calculatePL(items, lands, activeYear, selectedLandId, settings.reserveFundPercent);

  // Filter items for the data grid
  const filteredItems = items.filter((item) => {
    const matchesYear = item.year === activeYear;
    const matchesLand = selectedLandId === 'all' || item.landId === selectedLandId;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesLand && matchesType && matchesCategory && matchesSearch;
  });

  const openAddModal = (defaultType: 'revenue' | 'expense' = 'revenue') => {
    setEditingItem(null);
    setFormType(defaultType);
    setFormLandId(selectedLandId !== 'all' ? selectedLandId : lands[0]?.id || 'land-1');
    setFormCategory(defaultType === 'revenue' ? REVENUE_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    setFormDescription('');
    setFormAmount(5000);
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormQuantity(undefined);
    setFormUnitPrice(undefined);
    setFormUnit('bushels');
    setIsModalOpen(true);
  };

  const openEditModal = (item: FinancialItem) => {
    setEditingItem(item);
    setFormType(item.type);
    setFormLandId(item.landId);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormAmount(item.amount);
    setFormDate(item.date);
    setFormQuantity(item.quantity);
    setFormUnitPrice(item.unitPrice);
    setFormUnit(item.unit || 'bushels');
    setIsModalOpen(true);
  };

  const handleUnitPriceOrQtyChange = (qty?: number, unitP?: number) => {
    if (qty !== undefined && unitP !== undefined && qty > 0 && unitP > 0) {
      setFormAmount(Math.round(qty * unitP));
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim() || formAmount <= 0) return;

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        type: formType,
        landId: formLandId,
        category: formCategory,
        description: formDescription,
        amount: Number(formAmount),
        date: formDate,
        quantity: formQuantity ? Number(formQuantity) : undefined,
        unitPrice: formUnitPrice ? Number(formUnitPrice) : undefined,
        unit: formUnit,
      });
    } else {
      const newItem: FinancialItem = {
        id: `${formType === 'revenue' ? 'rev' : 'exp'}-${Date.now()}`,
        type: formType,
        landId: formLandId,
        year: activeYear,
        category: formCategory,
        description: formDescription,
        amount: Number(formAmount),
        date: formDate,
        quantity: formQuantity ? Number(formQuantity) : undefined,
        unitPrice: formUnitPrice ? Number(formUnitPrice) : undefined,
        unit: formUnit,
      };
      onAddItem(newItem);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Automated Profit &amp; Loss (P&amp;L) Ledger Engine
          </h2>
          <p className="text-xs text-slate-500">
            Real-time agricultural revenue accounting, production cost tracking, and automatic ROI calculations for {activeYear}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportLedgerCSV(filteredItems, lands, activeYear)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => openAddModal('revenue')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Revenue</span>
          </button>
          <button
            onClick={() => openAddModal('expense')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Expense</span>
          </button>
        </div>
      </div>

      {/* Live Calculated Metric Strip for Scope */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase">Scope Gross Revenue</span>
          <p className="text-lg font-bold font-tabular text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(pl.grossRevenue, settings.currency)}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase">Scope Total Expenses</span>
          <p className="text-lg font-bold font-tabular text-rose-600 dark:text-rose-400 mt-0.5">
            {formatCurrency(pl.totalExpenses, settings.currency)}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase">Net P&amp;L Operating</span>
          <p
            className={`text-lg font-bold font-tabular mt-0.5 ${
              pl.isProfit ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(pl.netProfit, settings.currency)}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase">Profit Margin %</span>
          <p className="text-lg font-bold font-tabular text-slate-900 dark:text-white mt-0.5">
            {pl.profitMarginPercent}%
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase">Net Return / Acre</span>
          <p className="text-lg font-bold font-tabular text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(pl.netProfitPerAcre, settings.currency)}/ac
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by transaction or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          {/* Land Scope Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500">Parcel:</span>
            <select
              value={selectedLandId}
              onChange={(e) => onSelectLandId(e.target.value)}
              className="py-1.5 px-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">All Managed Plots ({lands.length})</option>
              {lands.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code} - {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Segmented Filter */}
          <div className="flex items-center p-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('revenue')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                typeFilter === 'revenue'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {filteredItems.length} entries
        </span>
      </div>

      {/* Ledger Data Table */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Parcel</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Description &amp; Units</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                  No financial transactions recorded for this scope. Click "+ Revenue" or "+ Expense" to record an entry.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-semibold uppercase text-[10px] tracking-wider ${
                        item.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {item.landId === 'all' ? 'All Lands' : landMap.get(item.landId) || item.landId}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {item.category}
                  </td>
                  <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                    <div>{item.description}</div>
                    {item.quantity && item.unitPrice && (
                      <div className="text-[11px] font-mono text-slate-400">
                        {item.quantity.toLocaleString()} {item.unit} @ ${item.unitPrice.toFixed(2)}/{item.unit}
                      </div>
                    )}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                      item.type === 'revenue' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {item.type === 'revenue' ? '+' : '-'}
                    {formatCurrency(item.amount, settings.currency)}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title="Edit Entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this ledger entry?')) {
                            onDeleteItem(item.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Transaction' : 'Record Agricultural Transaction'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Type Switcher */}
              <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setFormType('revenue');
                    setFormCategory(REVENUE_CATEGORIES[0]);
                  }}
                  className={`flex-1 py-1.5 font-semibold rounded-md transition-colors ${
                    formType === 'revenue'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Revenue Entry (Yield &amp; Contracts)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormType('expense');
                    setFormCategory(EXPENSE_CATEGORIES[0]);
                  }}
                  className={`flex-1 py-1.5 font-semibold rounded-md transition-colors ${
                    formType === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Expense Entry (Direct Production Cost)
                </button>
              </div>

              {/* Land Parcel & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Assigned Land Parcel *
                  </label>
                  <select
                    value={formLandId}
                    onChange={(e) => setFormLandId(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {lands.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.code} - {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {(formType === 'revenue' ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Note *
                </label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Corn harvest delivery contract - 20,000 bu"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {/* Optional Volume Units */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Volume &amp; Unit Pricing (Optional)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Quantity</label>
                    <input
                      type="number"
                      step="any"
                      value={formQuantity ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined;
                        setFormQuantity(val);
                        handleUnitPriceOrQtyChange(val, formUnitPrice);
                      }}
                      placeholder="e.g. 10000"
                      className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Unit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formUnitPrice ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined;
                        setFormUnitPrice(val);
                        handleUnitPriceOrQtyChange(formQuantity, val);
                      }}
                      placeholder="e.g. 5.25"
                      className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Unit</label>
                    <input
                      type="text"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      placeholder="bushels, tons, ac"
                      className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Total Amount ($ USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Transaction Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
                  />
                </div>
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
                  className={`px-4 py-2 font-semibold text-white rounded-md shadow-xs ${
                    formType === 'revenue' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {editingItem ? 'Update Transaction' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
