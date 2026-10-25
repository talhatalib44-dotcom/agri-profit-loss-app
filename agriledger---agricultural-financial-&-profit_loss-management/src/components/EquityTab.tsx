import React, { useState } from 'react';
import { Partner, PartnerDistribution, LandPlot, FarmSettings, PLSummary } from '../types';
import { formatCurrency } from '../utils/calculations';
import { Plus, Edit2, Trash2, Users, FileText, CheckCircle, AlertTriangle, Download, ArrowUpRight } from 'lucide-react';
import { PartnerStatementModal } from './PartnerStatementModal';
import { exportPartnersCSV } from '../utils/exportUtils';

interface EquityTabProps {
  partners: Partner[];
  distributions: PartnerDistribution[];
  lands: LandPlot[];
  settings: FarmSettings;
  activeYear: number;
  pl: PLSummary;
  onAddPartner: (partner: Partner) => void;
  onUpdatePartner: (partner: Partner) => void;
  onDeletePartner: (partnerId: string) => void;
}

export const EquityTab: React.FC<EquityTabProps> = ({
  partners,
  distributions,
  lands,
  settings,
  activeYear,
  pl,
  onAddPartner,
  onUpdatePartner,
  onDeletePartner,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [selectedStatement, setSelectedStatement] = useState<PartnerDistribution | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formShare, setFormShare] = useState<number>(30);
  const [formCapital, setFormCapital] = useState<number>(100000);
  const [formAssignedLands, setFormAssignedLands] = useState<string[]>([]);
  const [formPayoutPref, setFormPayoutPref] = useState<'Direct Deposit' | 'Escrow Reinvestment' | 'Quarterly Wire'>('Direct Deposit');
  const [formNotes, setFormNotes] = useState('');

  const totalShareSum = partners.reduce((sum, p) => sum + p.sharePercent, 0);
  const isShareValid = Math.abs(totalShareSum - 100) < 0.01;

  const openAddModal = () => {
    setEditingPartner(null);
    setFormName('');
    setFormRole('Equity Partner');
    setFormEmail('');
    setFormShare(Math.max(0, 100 - totalShareSum));
    setFormCapital(150000);
    setFormAssignedLands([]);
    setFormPayoutPref('Direct Deposit');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setFormName(partner.name);
    setFormRole(partner.role);
    setFormEmail(partner.email);
    setFormShare(partner.sharePercent);
    setFormCapital(partner.initialCapitalInvested);
    setFormAssignedLands(partner.assignedLandIds || []);
    setFormPayoutPref(partner.payoutPreference);
    setFormNotes(partner.notes || '');
    setIsModalOpen(true);
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formShare <= 0) return;

    if (editingPartner) {
      onUpdatePartner({
        ...editingPartner,
        name: formName,
        role: formRole,
        email: formEmail,
        sharePercent: Number(formShare),
        initialCapitalInvested: Number(formCapital),
        assignedLandIds: formAssignedLands,
        payoutPreference: formPayoutPref,
        notes: formNotes,
      });
    } else {
      const newPartner: Partner = {
        id: `partner-${Date.now()}`,
        name: formName,
        role: formRole,
        email: formEmail,
        sharePercent: Number(formShare),
        initialCapitalInvested: Number(formCapital),
        assignedLandIds: formAssignedLands,
        payoutPreference: formPayoutPref,
        notes: formNotes,
      };
      onAddPartner(newPartner);
    }
    setIsModalOpen(false);
  };

  const toggleLandAssignment = (landId: string) => {
    if (formAssignedLands.includes(landId)) {
      setFormAssignedLands(formAssignedLands.filter((id) => id !== landId));
    } else {
      setFormAssignedLands([...formAssignedLands, landId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Multi-Partner Equity &amp; Profit Distribution
          </h2>
          <p className="text-xs text-slate-500">
            Automated equity share allocations, retained reserve deductions, and partner distribution statements for {activeYear}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportPartnersCSV(distributions, activeYear)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-opacity hover:opacity-90 flex items-center gap-1.5"
            style={{ backgroundColor: settings.theme.primaryColor || '#059669' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Partner</span>
          </button>
        </div>
      </div>

      {/* Equity Allocation Integrity Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">Partnership Equity Split</span>
            {isShareValid ? (
              <span className="text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                100% Fully Allocated
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Total allocated: {totalShareSum}% (Must equal 100%)
              </span>
            )}
          </div>
          <span className="font-mono text-slate-500">{partners.length} Active Partners</span>
        </div>

        {/* Visual Share Bar */}
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          {partners.map((p, idx) => {
            const colors = ['#059669', '#3b82f6', '#d97706', '#8b5cf6', '#ec4899'];
            const bg = colors[idx % colors.length];
            return (
              <div
                key={p.id}
                title={`${p.name}: ${p.sharePercent}%`}
                className="h-full transition-all duration-300"
                style={{ width: `${p.sharePercent}%`, backgroundColor: bg }}
              />
            );
          })}
        </div>

        {/* Partner Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {partners.map((p, idx) => {
            const colors = ['#059669', '#3b82f6', '#d97706', '#8b5cf6', '#ec4899'];
            const bg = colors[idx % colors.length];
            return (
              <div key={p.id} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bg }} />
                <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                <span className="font-mono font-bold text-slate-500">({p.sharePercent}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Partner Payout Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {distributions.map((dist, idx) => {
          const { partner, allocatedGrossProfit, retainedReserveContribution, netPayout } = dist;
          const returnOnCapital = partner.initialCapitalInvested > 0
            ? Number(((netPayout / partner.initialCapitalInvested) * 100).toFixed(1))
            : 0;

          return (
            <div
              key={partner.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{partner.name}</h3>
                    <p className="text-xs text-slate-500">{partner.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(partner)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Edit Partner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {partners.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove partner "${partner.name}"?`)) {
                            onDeletePartner(partner.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete Partner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 my-3">
                  <div className="flex justify-between">
                    <span>Equity Ownership:</span>
                    <strong className="font-mono text-emerald-600">{partner.sharePercent}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Initial Capital:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(partner.initialCapitalInvested, settings.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disbursement Method:</span>
                    <span>{partner.payoutPreference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Land:</span>
                    <span>{partner.assignedLandIds.length === 0 ? 'All Parcels' : `${partner.assignedLandIds.length} Plot(s)`}</span>
                  </div>
                </div>
              </div>

              {/* Payout Calculation Box */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold uppercase block">
                    Net Distributable Cash Payout
                  </span>
                  <p className="text-xl font-bold font-tabular text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {formatCurrency(netPayout, settings.currency)}
                  </p>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                    <span>Allocated: {formatCurrency(allocatedGrossProfit, settings.currency)}</span>
                    <span>Reserve: -{formatCurrency(retainedReserveContribution, settings.currency)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">
                    ROC: <strong className="text-slate-900 dark:text-white">{returnOnCapital}%</strong>
                  </span>
                  <button
                    onClick={() => setSelectedStatement(dist)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Official Statement</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingPartner ? 'Edit Partner Details' : 'Add Equity Partner'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Partner Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Role in Operation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Managing Partner"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. partner@prairiehorizon.com"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Equity Ownership Share (%) *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    required
                    value={formShare}
                    onChange={(e) => setFormShare(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Initial Capital Invested ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formCapital}
                    onChange={(e) => setFormCapital(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Payout Disbursement Preference
                </label>
                <select
                  value={formPayoutPref}
                  onChange={(e) => setFormPayoutPref(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="Direct Deposit">Direct Deposit (Automated Clearing House)</option>
                  <option value="Quarterly Wire">Quarterly Wire Transfer</option>
                  <option value="Escrow Reinvestment">Escrow Reinvestment in Machinery Fund</option>
                </select>
              </div>

              {/* Land parcel assignments */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Parcels (Leave empty for farm-wide global equity)
                </label>
                <div className="grid grid-cols-2 gap-2 p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                  {lands.map((l) => (
                    <label key={l.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAssignedLands.includes(l.id)}
                        onChange={() => toggleLandAssignment(l.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="truncate">{l.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Capital equipment contribution details..."
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
                  {editingPartner ? 'Update Partner' : 'Save Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partner Statement Modal */}
      <PartnerStatementModal
        distribution={selectedStatement}
        onClose={() => setSelectedStatement(null)}
        settings={settings}
        activeYear={activeYear}
        lands={lands}
      />
    </div>
  );
};
