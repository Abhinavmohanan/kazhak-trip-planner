'use client';

import React, { useState } from 'react';
import { X, Trash2, Check, Clock, MapPin, DollarSign, Tag, Info, AlertTriangle, Coffee } from 'lucide-react';

export interface Activity {
  time: string;
  place: string;
  whatToDo: string;
  mustTry: string;
  lookOutFor: string;
  kztExpense: number;
  category: 'sightseeing' | 'food' | 'transit' | 'hotel';
}

interface ActivityEditModalProps {
  isOpen: boolean;
  activity: Activity;
  dayNumber: number;
  activityIndex?: number;
  isNew?: boolean;
  onSave: (updatedActivity: Activity, activityIndex?: number) => void;
  onDelete?: (activityIndex: number) => void;
  onClose: () => void;
}

export default function ActivityEditModal({
  isOpen,
  activity,
  dayNumber,
  activityIndex,
  isNew = false,
  onSave,
  onDelete,
  onClose,
}: ActivityEditModalProps) {
  const [formData, setFormData] = useState<Activity>({ ...activity });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, activityIndex);
  };

  const categories: { id: Activity['category']; label: string; icon: string }[] = [
    { id: 'sightseeing', label: 'Sightseeing', icon: '🏔️' },
    { id: 'food', label: 'Food & Dining', icon: '🍽️' },
    { id: 'transit', label: 'Transit / Drive', icon: '🚗' },
    { id: 'hotel', label: 'Hotel / Stay', icon: '🏠' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="neu-flat rounded-[32px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-none space-y-5 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neu-muted/20">
          <div>
            <div className="text-[10px] font-display font-extrabold uppercase tracking-wider text-[var(--neu-accent)]">
              Day {dayNumber} Schedule
            </div>
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-neu-text mt-0.5">
              {isNew ? '➕ Add New Activity' : '✏️ Edit Activity'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="neu-btn p-2 rounded-xl text-neu-muted hover:text-neu-text transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Time & Place Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neu-muted mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--neu-accent)]" /> Time Slot
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 09:00 - 11:30"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="w-full neu-inset-deep rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-neu-text outline-none focus:ring-2 focus:ring-[var(--neu-accent)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neu-muted mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[var(--neu-amber)]" /> Cost (KZT/person)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="0"
                value={formData.kztExpense}
                onChange={e => setFormData({ ...formData, kztExpense: Number(e.target.value) })}
                className="w-full neu-inset-deep rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-neu-text outline-none focus:ring-2 focus:ring-[var(--neu-accent)]"
              />
            </div>
          </div>

          {/* Location / Name */}
          <div>
            <label className="text-xs font-bold text-neu-muted mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--neu-teal)]" /> Activity / Place Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shymbulak Cable Car"
              value={formData.place}
              onChange={e => setFormData({ ...formData, place: e.target.value })}
              className="w-full neu-inset-deep rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-neu-text outline-none focus:ring-2 focus:ring-[var(--neu-accent)]"
            />
          </div>

          {/* Category Selector Pills */}
          <div>
            <label className="text-xs font-bold text-neu-muted mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[var(--neu-accent)]" /> Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map(cat => {
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'neu-inset-deep text-[var(--neu-accent)] font-bold ring-1 ring-[var(--neu-accent)]'
                        : 'neu-btn text-neu-muted hover:text-neu-text'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* What to Do */}
          <div>
            <label className="text-xs font-bold text-neu-muted mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[var(--neu-teal)]" /> What to Do & Details
            </label>
            <textarea
              rows={2}
              required
              placeholder="Describe the plan, directions, tickets, or schedule..."
              value={formData.whatToDo}
              onChange={e => setFormData({ ...formData, whatToDo: e.target.value })}
              className="w-full neu-inset-deep rounded-2xl p-3 text-xs text-neu-text outline-none focus:ring-2 focus:ring-[var(--neu-accent)] leading-relaxed resize-none"
            />
          </div>

          {/* Must Try */}
          <div>
            <label className="text-xs font-bold text-neu-muted mb-1 flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-[var(--neu-teal)]" /> Must Try
            </label>
            <input
              type="text"
              placeholder="e.g. Syrniki pancakes or panoramic viewpoint photo"
              value={formData.mustTry}
              onChange={e => setFormData({ ...formData, mustTry: e.target.value })}
              className="w-full neu-inset-deep rounded-2xl px-3.5 py-2.5 text-xs text-neu-text outline-none focus:ring-2 focus:ring-[var(--neu-accent)]"
            />
          </div>

          {/* Look Out For */}
          <div>
            <label className="text-xs font-bold text-neu-muted mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--neu-amber)]" /> Look Out For / Warnings
            </label>
            <input
              type="text"
              placeholder="e.g. Carry original passports; cash only"
              value={formData.lookOutFor}
              onChange={e => setFormData({ ...formData, lookOutFor: e.target.value })}
              className="w-full neu-inset-deep rounded-2xl px-3.5 py-2.5 text-xs text-neu-text outline-none focus:ring-2 focus:ring-[var(--neu-accent)]"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-neu-muted/20 gap-3">
            {!isNew && onDelete && activityIndex !== undefined ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${formData.place}" from Day ${dayNumber}?`)) {
                    onDelete(activityIndex);
                  }
                }}
                className="neu-btn px-4 py-2.5 rounded-2xl text-xs font-bold text-[var(--neu-rose)] hover:text-rose-600 flex items-center gap-1.5 active:neu-inset"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="neu-btn px-4 py-2.5 rounded-2xl text-xs font-bold text-neu-muted hover:text-neu-text active:neu-inset"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="neu-btn-primary px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
