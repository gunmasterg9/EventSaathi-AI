import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle,
  Download,
  Trash2,
  Edit2,
  Info,
  X,
  PieChart,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEvent } from '../context/EventContext';
import { BudgetSummary, BudgetItem } from '../types';
import { api } from '../services/api';

export const BudgetPlanner: React.FC = () => {
  const { t } = useLanguage();
  const { currentEvent, refreshCurrentEvent } = useEvent();

  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Add / Edit Item Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemForm, setItemForm] = useState({
    category: 'Catering',
    item_name: '',
    estimated_amount: 0,
    actual_amount: 0,
    notes: '',
    is_paid: false,
  });

  const fetchBudget = useCallback(async () => {
    if (!currentEvent?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBudget(currentEvent.id);
      setBudget(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load budget';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentEvent?.id]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemForm({
      category: 'Catering',
      item_name: '',
      estimated_amount: 0,
      actual_amount: 0,
      notes: '',
      is_paid: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setItemForm({
      category: item.category,
      item_name: item.item_name,
      estimated_amount: item.estimated_amount,
      actual_amount: item.actual_amount,
      notes: item.notes || '',
      is_paid: item.is_paid,
    });
    setModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent?.id) return;

    if (!itemForm.item_name.trim()) {
      alert('Please enter an expense item name');
      return;
    }
    if (itemForm.estimated_amount < 0 || itemForm.actual_amount < 0) {
      alert('Amounts must be zero or positive');
      return;
    }

    try {
      if (editingItem) {
        await api.updateBudgetItem(editingItem.id, currentEvent.id, itemForm);
      } else {
        await api.addBudgetItem(currentEvent.id, itemForm);
      }
      setModalOpen(false);
      await fetchBudget();
      refreshCurrentEvent();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving expense item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!currentEvent?.id) return;
    if (!window.confirm(t.confirmDelete)) return;

    try {
      await api.deleteBudgetItem(itemId, currentEvent.id);
      await fetchBudget();
      refreshCurrentEvent();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting item');
    }
  };

  const handleTogglePaid = async (item: BudgetItem) => {
    if (!currentEvent?.id) return;
    try {
      await api.updateBudgetItem(item.id, currentEvent.id, { is_paid: !item.is_paid });
      await fetchBudget();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating payment status');
    }
  };

  const handleExportCsv = () => {
    if (!currentEvent?.id) return;
    const url = api.getBudgetExportCsvUrl(currentEvent.id);
    window.open(url, '_blank');
  };

  if (!currentEvent) return null;

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header and Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.budgetTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.budgetSubtitle} ({currentEvent.currency})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{t.exportCsvBtn}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-brand-700 hover:from-rose-700 hover:to-brand-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.addExpenseBtn}</span>
          </button>
        </div>
      </div>

      {/* Illustrative Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Transparency Notice:</strong> All initial allocations are illustrative baseline projections. Adjust estimates as you negotiate quotes with vendors.
        </span>
      </div>

      {/* Summary KPI Cards */}
      {budget && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {t.statTotalBudget}
            </span>
            <span className="text-2xl font-black text-slate-900">
              {budget.currency} {budget.total_budget.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block">Baseline budget</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Estimated Total
            </span>
            <span className="text-2xl font-black text-brand-900">
              {budget.currency} {budget.total_estimated.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block">Projected allocations</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {t.statSpent}
            </span>
            <span className="text-2xl font-black text-rose-700">
              {budget.currency} {budget.total_actual.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block">Confirmed expenses</span>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm space-y-1 ${
            budget.is_over_budget ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              {t.statRemaining}
            </span>
            <span className={`text-2xl font-black ${
              budget.is_over_budget ? 'text-rose-700' : 'text-emerald-700'
            }`}>
              {budget.currency} {budget.remaining_budget.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 block">
              {budget.is_over_budget ? 'Over Target Budget!' : 'Available to allocate'}
            </span>
          </div>
        </div>
      )}

      {/* Category Allocation Progress Breakdown */}
      {budget && budget.categories.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
            <PieChart className="w-5 h-5 text-brand-600" />
            <h3>{t.categoryBreakdown}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budget.categories.map((cat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 truncate">{cat.category}</span>
                  <span className="font-semibold text-brand-700 shrink-0">{cat.percentage_of_budget}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, cat.percentage_of_budget)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Est: {budget.currency} {cat.estimated_total.toLocaleString()}</span>
                  <span>Act: {budget.currency} {cat.actual_total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Expense Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Detailed Expense Items ({budget?.items.length || 0})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">{t.loading}</div>
        ) : budget?.items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-2">
            <p>No expense items yet.</p>
            <button
              onClick={handleOpenAdd}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              + Add First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/60 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">{t.thCategory}</th>
                  <th className="py-3 px-4">{t.thItem}</th>
                  <th className="py-3 px-4 text-right">{t.thEstimated}</th>
                  <th className="py-3 px-4 text-right">{t.thActual}</th>
                  <th className="py-3 px-4 text-right">{t.thVariance}</th>
                  <th className="py-3 px-4 text-center">{t.thPaid}</th>
                  <th className="py-3 px-4 text-right">{t.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budget?.items.map((item) => {
                  const est = item.estimated_amount;
                  const act = item.actual_amount;
                  const variance = est - act;
                  return (
                    <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.item_name}</div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-400 italic max-w-xs truncate">
                            {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 whitespace-nowrap">
                        {budget.currency} {est.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {budget.currency} {act.toLocaleString()}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${
                        variance < 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {variance > 0 ? `+${variance.toLocaleString()}` : variance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleTogglePaid(item)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                            item.is_paid
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {item.is_paid ? t.paidYes : t.paidNo}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            aria-label="Edit item"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            aria-label="Delete item"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
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
      </div>

      {/* Add / Edit Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingItem ? 'Edit Expense Item' : t.addExpenseBtn}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                  placeholder="e.g. Venue, Catering, Decoration, Photography"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Expense Item Name
                </label>
                <input
                  type="text"
                  required
                  value={itemForm.item_name}
                  onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })}
                  placeholder="e.g. Banquet Lawn Booking, Stage Arch Florals"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Estimated ({currentEvent.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={itemForm.estimated_amount}
                    onChange={(e) => setItemForm({ ...itemForm, estimated_amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actual Spent ({currentEvent.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={itemForm.actual_amount}
                    onChange={(e) => setItemForm({ ...itemForm, actual_amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Notes or Quotation Ref
                </label>
                <input
                  type="text"
                  value={itemForm.notes}
                  onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                  placeholder="e.g. Quoted by Royal Events, includes 10% tax"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-is-paid"
                  checked={itemForm.is_paid}
                  onChange={(e) => setItemForm({ ...itemForm, is_paid: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <label htmlFor="modal-is-paid" className="text-xs font-semibold text-slate-700">
                  Mark as Paid / Settled
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-brand-700 hover:from-rose-700 hover:to-brand-800 text-white text-xs font-bold shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
