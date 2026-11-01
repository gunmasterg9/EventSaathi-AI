import { DialogPanel } from './DialogPanel';
import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle,
  Phone,
  Mail,
  User,
  CheckCircle,
  Edit2,
  Trash2,
  X,
  Building,
  Filter,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEvent } from '../context/EventContext';
import { VendorRecord, VendorStatus } from '../types';
import { api } from '../services/api';

export const VendorManager: React.FC = () => {
  const { t } = useLanguage();
  const { currentEvent } = useEvent();

  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [totalVendors, setTotalVendors] = useState<number>(0);
  const [bookedVendors, setBookedVendors] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingVendor, setEditingVendor] = useState<VendorRecord | null>(null);
  const [vendorForm, setVendorForm] = useState<{
    category: string;
    name: string;
    contact_person: string;
    phone: string;
    email: string;
    estimated_quote: number;
    actual_quote: number;
    status: VendorStatus;
    notes: string;
    selection_criteria: string;
  }>({
    category: 'Catering',
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    estimated_quote: 0,
    actual_quote: 0,
    status: 'not_contacted',
    notes: '',
    selection_criteria: '',
  });

  const fetchVendors = useCallback(async () => {
    if (!currentEvent?.id) return;
    setLoading(true);
    try {
      const res = await api.getVendors(currentEvent.id, categoryFilter, statusFilter);
      setVendors(res.vendors);
      setTotalVendors(res.total_vendors);
      setBookedVendors(res.booked_vendors);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentEvent?.id, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setVendorForm({
      category: 'Catering',
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      estimated_quote: 0,
      actual_quote: 0,
      status: 'not_contacted',
      notes: '',
      selection_criteria: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (v: VendorRecord) => {
    setEditingVendor(v);
    setVendorForm({
      category: v.category,
      name: v.name,
      contact_person: v.contact_person || '',
      phone: v.phone || '',
      email: v.email || '',
      estimated_quote: v.estimated_quote,
      actual_quote: v.actual_quote,
      status: v.status,
      notes: v.notes || '',
      selection_criteria: v.selection_criteria || '',
    });
    setModalOpen(true);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent?.id) return;

    if (!vendorForm.name.trim()) {
      alert('Please enter a vendor or business name');
      return;
    }

    try {
      if (editingVendor) {
        await api.updateVendor(editingVendor.id, currentEvent.id, vendorForm);
      } else {
        await api.addVendor(currentEvent.id, vendorForm);
      }
      setModalOpen(false);
      await fetchVendors();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving vendor');
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!currentEvent?.id) return;
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await api.deleteVendor(vendorId, currentEvent.id);
      await fetchVendors();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting vendor');
    }
  };

  const handleStatusChange = async (v: VendorRecord, newStatus: VendorStatus) => {
    if (!currentEvent?.id) return;
    try {
      await api.updateVendor(v.id, currentEvent.id, { status: newStatus });
      await fetchVendors();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating vendor status');
    }
  };

  const categories = [
    'Venue',
    'Catering',
    'Decoration',
    'Photography',
    'Entertainment',
    'Transportation',
    'Equipment & Rentals',
    'Custom / Other',
  ];

  if (!currentEvent) return null;

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.vendorsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.vendorsSubtitle}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-brand-700 hover:from-rose-700 hover:to-brand-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addVendorBtn}</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Vendor Roles Tracked
            </span>
            <span className="text-2xl font-black text-slate-900">{totalVendors}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Confirmed / Booked Vendors
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {bookedVendors} / {totalVendors}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filters:</span>
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Statuses</option>
          <option value="not_contacted">{t.statusNotContacted}</option>
          <option value="contacted">{t.statusContacted}</option>
          <option value="quoted">{t.statusQuoted}</option>
          <option value="booked">{t.statusBooked}</option>
          <option value="rejected">{t.statusRejected}</option>
        </select>
      </div>

      {/* Vendors Comparison Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">{t.loading}</div>
      ) : vendors.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200 space-y-2">
          <p>No vendor records found.</p>
          <button
            onClick={handleOpenAdd}
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            + Add a Vendor Quotation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((v) => {
            const isBooked = v.status === 'booked';
            return (
              <div
                key={v.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isBooked
                    ? 'bg-emerald-50/30 border-emerald-200 shadow-sm'
                    : 'bg-white border-slate-200/90 hover:border-brand-200 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {v.category}
                    </span>

                    <select
                      value={v.status}
                      onChange={(e) => handleStatusChange(v, e.target.value as VendorStatus)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                        v.status === 'booked'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : v.status === 'quoted'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : v.status === 'contacted'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <option value="not_contacted">{t.statusNotContacted}</option>
                      <option value="contacted">{t.statusContacted}</option>
                      <option value="quoted">{t.statusQuoted}</option>
                      <option value="booked">{t.statusBooked}</option>
                      <option value="rejected">{t.statusRejected}</option>
                    </select>
                  </div>

                  {/* Vendor Name */}
                  <h3 className="text-base font-bold text-slate-900">
                    {v.name}
                  </h3>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-slate-600">
                    {v.contact_person && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{v.contact_person}</span>
                      </div>
                    )}
                    {v.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`tel:${v.phone}`} className="text-brand-600 hover:underline">
                          {v.phone}
                        </a>
                      </div>
                    )}
                    {v.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${v.email}`} className="text-brand-600 hover:underline truncate">
                          {v.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Quotes Box */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                        {t.quoteEstimated}
                      </span>
                      <span className="font-bold text-slate-700">
                        {currentEvent.currency} {v.estimated_quote.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                        {t.quoteFinal}
                      </span>
                      <span className="font-extrabold text-brand-900">
                        {currentEvent.currency} {v.actual_quote.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Selection Criteria / Checklist */}
                  {v.selection_criteria && (
                    <div className="text-xs text-slate-600 bg-rose-50/40 p-2.5 rounded-lg border border-rose-100/60">
                      <span className="font-bold text-brand-950 block mb-0.5">
                        {t.criteriaLabel}:
                      </span>
                      <span className="italic">{v.selection_criteria}</span>
                    </div>
                  )}

                  {/* General Notes */}
                  {v.notes && (
                    <div className="text-xs text-slate-500 italic">
                      Note: {v.notes}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    aria-label="Edit vendor"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{t.edit}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(v.id)}
                    aria-label="Delete vendor"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.delete}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      {modalOpen && (
        <div className="dialog-overlay fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm">
          <DialogPanel className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95" contentClassName="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingVendor ? 'Edit Vendor Record' : t.addVendorBtn}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={vendorForm.category}
                    onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <datalist id="category-suggestions">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={vendorForm.status}
                    onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value as VendorStatus })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-semibold"
                  >
                    <option value="not_contacted">{t.statusNotContacted}</option>
                    <option value="contacted">{t.statusContacted}</option>
                    <option value="quoted">{t.statusQuoted}</option>
                    <option value="booked">{t.statusBooked}</option>
                    <option value="rejected">{t.statusRejected}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Vendor / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  placeholder="e.g. Royal Caterers, Drishti Photography"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={vendorForm.contact_person}
                    onChange={(e) => setVendorForm({ ...vendorForm, contact_person: e.target.value })}
                    placeholder="e.g. Rahul Patel"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    placeholder="info@..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Est. Quote ({currentEvent.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={vendorForm.estimated_quote}
                    onChange={(e) => setVendorForm({ ...vendorForm, estimated_quote: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Final Quote ({currentEvent.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={vendorForm.actual_quote}
                    onChange={(e) => setVendorForm({ ...vendorForm, actual_quote: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Selection Criteria / Checklist
                </label>
                <input
                  type="text"
                  value={vendorForm.selection_criteria}
                  onChange={(e) => setVendorForm({ ...vendorForm, selection_criteria: e.target.value })}
                  placeholder="e.g. Verified food tasting, sound limit permission verified"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={vendorForm.notes}
                  onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                  placeholder="Package inclusions, payment schedule..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
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
          </DialogPanel>
        </div>
      )}
    </div>
  );
};
