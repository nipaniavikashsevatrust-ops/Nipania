'use client';

import React, { useState, useEffect, useRef } from 'react';
import IdCardRenderer from '@/components/admin/IdCardRenderer';
import BulkIdCardPrint from '@/components/admin/BulkIdCardPrint';
import { CreditCard, Search, Plus, Printer, ShieldCheck, UserCheck, X, RefreshCw, Upload, Trash2, CheckSquare, Square, Layers } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminIdCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // Bulk Print State
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
  const [checkedCardNumbers, setCheckedCardNumbers] = useState<string[]>([]);

  // New Card Generator Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    fullName: '',
    role: 'Executive Trustee',
    personType: 'STAFF',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    validUntilYears: 3,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  const fetchCards = () => {
    setLoading(true);
    let url = `/api/id-cards`;
    if (search) url += `?search=${encodeURIComponent(search)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.idCards) {
          setCards(data.idCards);
          if (data.idCards.length > 0 && !selectedCard) {
            setSelectedCard(data.idCards[0]);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const issueDate = new Date();
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + Number(formData.validUntilYears));

      const res = await fetch('/api/id-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: formData.cardNumber.trim().toUpperCase(),
          fullName: formData.fullName,
          role: formData.role,
          personType: formData.personType,
          photoUrl: formData.photoUrl,
          issueDate,
          validUntil,
        }),
      });

      const data = await res.json();
      if (res.ok && data.idCard) {
        setIsCreateOpen(false);
        fetchCards();
        setSelectedCard(data.idCard);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-navy-950 font-heading">
            Official ID Card Studio
          </h1>
          <p className="text-xs text-slate-500">
            Generate, preview, print, and verify dual-sided official Trust credentials with QR code validation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bulk Print Button */}
          <button
            onClick={() => setIsBulkPrintOpen(true)}
            disabled={cards.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all active:scale-98 disabled:opacity-50"
            title="Print multiple ID cards on standard A4 sheets"
          >
            <Printer className="w-4 h-4 text-gold-200" />
            <span>Bulk Print (A4 Sheet)</span>
            {checkedCardNumbers.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-amber-950 text-gold-200 text-[10px] font-mono">
                {checkedCardNumbers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setFormData({
                cardNumber: `NVS-STF-${String(cards.length + 1).padStart(6, '0')}`,
                fullName: '',
                role: 'Field Representative',
                personType: 'STAFF',
                photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                validUntilYears: 3,
              });
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-md transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Issue New ID Card</span>
          </button>
        </div>
      </div>

      {/* Main Studio View: Card Selector Left + Live Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Card Registry List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchCards();
              }}
              className="relative"
            >
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search card ID or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gold-500"
              />
            </form>

            {/* Quick Bulk Selection Bar */}
            {cards.length > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-600">
                <button
                  type="button"
                  onClick={() => {
                    if (checkedCardNumbers.length === cards.length) {
                      setCheckedCardNumbers([]);
                    } else {
                      setCheckedCardNumbers(cards.map((c) => c.cardNumber));
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-navy-950 font-semibold"
                >
                  {checkedCardNumbers.length === cards.length ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-gold-600" />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                      <span>Select All for Print ({cards.length})</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-slate-400 font-mono">
                  {checkedCardNumbers.length} selected
                </span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-4 space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-10 text-xs text-slate-400">Loading cards...</div>
            ) : cards.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">No ID cards found.</div>
            ) : (
              cards.map((card) => {
                const isSelected = selectedCard?.id === card.id;
                const isChecked = checkedCardNumbers.includes(card.cardNumber);
                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-gold-500 bg-gold-50/50 shadow-sm ring-1 ring-gold-400'
                        : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          setCheckedCardNumbers((prev) =>
                            prev.includes(card.cardNumber)
                              ? prev.filter((id) => id !== card.cardNumber)
                              : [...prev, card.cardNumber]
                          );
                        }}
                        className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500 cursor-pointer shrink-0"
                        title="Select for bulk A4 print"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-xs font-bold text-navy-950 block truncate">{card.fullName}</span>
                        <span className="text-[11px] text-slate-500 block truncate">{card.role}</span>
                        <span className="text-[10px] font-mono font-bold text-gold-700 block">
                          {card.cardNumber}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase block">
                        {card.status}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Valid: {formatDate(card.validUntil)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Live Single-Sided Studio Preview */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-navy-950 font-heading">
                Live Single-Sided PVC Identity Card Studio
              </h3>
              <p className="text-xs text-slate-500">
                Official single-sided CR80 PVC credential with integrated signature, stamp seal, and QR verification
              </p>
            </div>

            {selectedCard && (
              <a
                href={`/verify/${selectedCard.cardNumber}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-gold-600 hover:underline flex items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Test Online QR Scan</span>
              </a>
            )}
          </div>

          {selectedCard ? (
            <IdCardRenderer card={selectedCard} />
          ) : (
            <div className="text-center py-20 text-xs text-slate-400">
              Select an ID card from the left registry to preview.
            </div>
          )}
        </div>

      </div>

      {/* Create New Card Modal */}
      {isCreateOpen && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/40 my-auto max-h-[92vh] overflow-y-auto admin-modal-scroll animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-navy-950 font-heading">
                  Issue Official ID Card
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Generate authenticated Trust credentials
                </p>
              </div>

              <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">ID Card Number</label>
                <input
                  type="text"
                  required
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 font-mono font-bold uppercase text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full name as per legal records"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role / Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Field Coordinator"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Person Type</label>
                  <select
                    value={formData.personType}
                    onChange={(e) => setFormData({ ...formData, personType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="TRUSTEE">TRUSTEE</option>
                    <option value="VOLUNTEER">VOLUNTEER</option>
                    <option value="MEMBER">MEMBER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Validity (Years)</label>
                <select
                  value={formData.validUntilYears}
                  onChange={(e) => setFormData({ ...formData, validUntilYears: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                >
                  <option value={1}>1 Year</option>
                  <option value={2}>2 Years</option>
                  <option value={3}>3 Years</option>
                  <option value={5}>5 Years (Lifetime)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Photo Upload</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-24 rounded-xl border-2 border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {formData.photoUrl ? (
                      <img
                        src={formData.photoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCheck className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={photoFileInputRef}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        setUploadingPhoto(true);
                        const bodyData = new FormData();
                        bodyData.append('file', file);
                        
                        try {
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            body: bodyData,
                          });
                          const data = await res.json();
                          
                          if (res.ok && data.url) {
                            setFormData({ ...formData, photoUrl: data.url });
                          } else {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setFormData({ ...formData, photoUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        } catch (err) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setFormData({ ...formData, photoUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        } finally {
                          setUploadingPhoto(false);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingPhoto}
                      onClick={() => photoFileInputRef.current?.click()}
                      className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5"
                    >
                      {uploadingPhoto ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                    </button>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photoUrl: '' })}
                        className="w-full text-xs text-rose-600 hover:underline"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-3.5 rounded-full text-sm font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    'Generate & Activate Credential'
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk A4 Print Studio Modal */}
      {isBulkPrintOpen && (
        <BulkIdCardPrint
          cards={
            checkedCardNumbers.length > 0
              ? cards.filter((c) => checkedCardNumbers.includes(c.cardNumber))
              : cards
          }
          isOpen={isBulkPrintOpen}
          onClose={() => setIsBulkPrintOpen(false)}
        />
      )}

    </div>
  );
}
