'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, MapPin, Luggage, Type } from 'lucide-react';
import { DayData } from './KazakhstanApp';

interface DayEditModalProps {
  isOpen: boolean;
  dayData: DayData;
  onSave: (updatedDay: Partial<DayData>) => void;
  onClose: () => void;
}

export default function DayEditModal({
  isOpen,
  dayData,
  onSave,
  onClose,
}: DayEditModalProps) {
  const [title, setTitle] = useState(dayData?.title || '');
  const [location, setLocation] = useState(dayData?.location || '');
  const [overnight, setOvernight] = useState(dayData?.overnight || '');

  useEffect(() => {
    if (isOpen && dayData) {
      setTitle(dayData.title || '');
      setLocation(dayData.location || '');
      setOvernight(dayData.overnight || '');
    }
  }, [dayData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, location, overnight });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="neu-flat rounded-[32px] p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neu-muted/20">
          <div>
            <div className="text-[10px] font-display font-extrabold uppercase tracking-wider text-[var(--neu-accent)]">
              Day {dayData.day} • {dayData.date}
            </div>
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-neu-text mt-0.5">
              ✏️ Edit Day Overview
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
          <div>
            <label className="text-xs font-bold text-neu-muted mb-1 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[var(--neu-accent)]" /> Day Title / Theme
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full neu-inset-deep rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-neu-text outline-none focus:ring-2 focus:ring-[var(--neu-accent)]"
              placeholder="e.g. Arrival & Almaty City Culture"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neu-muted mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--neu-teal)]" /> Location / Region
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full neu-inset-deep rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-neu-text outline-none focus:ring-2 focus:ring-[var(--neu-teal)]"
              placeholder="e.g. Almaty City"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neu-muted mb-1 flex items-center gap-1.5">
              <Luggage className="w-3.5 h-3.5 text-amber-500" /> Overnight Stay / Hotel / Guesthouse
            </label>
            <input
              type="text"
              required
              value={overnight}
              onChange={e => setOvernight(e.target.value)}
              className="w-full neu-inset-deep rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-neu-text outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. Almaty City Hotel (Base 1)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neu-muted/20">
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
              <Check className="w-4 h-4 stroke-[3]" /> Save Day Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
