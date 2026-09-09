'use client';

import { useState } from 'react';
import { Loader2, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface BudgetBreakdownData {
  currency: string;
  currency_symbol: string;
  per_person: boolean;
  flights_estimate: number;
  hotels_total: number;
  activities_total: number;
  food_total: number;
  transport_local: number;
  misc_buffer: number;
  grand_total: number;
  note: string;
}

interface BudgetBreakdownProps {
  destination: string;
  duration: string;
  budget: string;
  group_size: string;
  hotels: any[];
  itinerary: any[];
}

const CATEGORIES = [
  { key: 'flights_estimate', label: 'Flights', emoji: '✈️', color: '#6366f1' },
  { key: 'hotels_total', label: 'Hotels', emoji: '🏨', color: '#f59e0b' },
  { key: 'activities_total', label: 'Activities', emoji: '🎡', color: '#10b981' },
  { key: 'food_total', label: 'Food & Dining', emoji: '🍽️', color: '#ef4444' },
  { key: 'transport_local', label: 'Local Transport', emoji: '🚌', color: '#8b5cf6' },
  { key: 'misc_buffer', label: 'Misc / Buffer', emoji: '🎁', color: '#06b6d4' },
];

export default function BudgetBreakdown({
  destination, duration, budget, group_size, hotels, itinerary
}: BudgetBreakdownProps) {
  const [breakdown, setBreakdown] = useState<BudgetBreakdownData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/budget-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, duration, budget, group_size, hotels, itinerary }),
      });
      const data = await res.json();
      if (data.success) {
        setBreakdown(data.breakdown);
        setIsOpen(true);
        toast.success('Budget breakdown ready!');
      } else {
        toast.error('Failed to generate breakdown');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => {
    if (!breakdown) return '';
    return `${breakdown.currency_symbol}${n.toLocaleString()}`;
  };

  // Calculate percentage for donut ring segments
  const getPercentage = (value: number) =>
    breakdown ? Math.round((value / breakdown.grand_total) * 100) : 0;

  // Build CSS conic gradient for donut chart
  const buildDonut = () => {
    if (!breakdown) return '';
    let angle = 0;
    const parts = CATEGORIES.map(cat => {
      const val = breakdown[cat.key as keyof BudgetBreakdownData] as number;
      const pct = (val / breakdown.grand_total) * 100;
      const segment = `${cat.color} ${angle}% ${angle + pct}%`;
      angle += pct;
      return segment;
    });
    return `conic-gradient(${parts.join(', ')})`;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-200 overflow-hidden shadow-lg">
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => breakdown && setIsOpen(prev => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Budget Breakdown</h3>
            {breakdown && (
              <p className="text-sm text-indigo-700 font-medium">
                Est. total: {fmt(breakdown.grand_total)} {breakdown.per_person ? 'per person' : 'total'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {breakdown && (
            <button
              onClick={e => { e.stopPropagation(); generate(); }}
              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
              title="Recalculate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {!breakdown ? (
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition shadow-md disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Calculating…</>
              ) : (
                <><DollarSign className="w-4 h-4" />Estimate Cost</>
              )}
            </button>
          ) : null}
        </div>
      </div>

      {/* Breakdown Content */}
      {isOpen && breakdown && (
        <div className="px-5 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Donut Chart */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div
                className="w-40 h-40 rounded-full shadow-xl relative"
                style={{ background: buildDonut() }}
              >
                {/* Center hole */}
                <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                  <span className="text-xs text-gray-500 font-medium">Total</span>
                  <span className="text-base font-bold text-gray-800">{fmt(breakdown.grand_total)}</span>
                  {breakdown.per_person && (
                    <span className="text-[10px] text-gray-400">/person</span>
                  )}
                </div>
              </div>
            </div>

            {/* Category Bars */}
            <div className="flex-1 w-full space-y-3">
              {CATEGORIES.map(cat => {
                const value = breakdown[cat.key as keyof BudgetBreakdownData] as number;
                const pct = getPercentage(value);
                return (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <span>{cat.emoji}</span>
                        {cat.label}
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {fmt(value)}
                        <span className="ml-1 text-xs text-gray-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note */}
          {breakdown.note && (
            <p className="mt-4 text-xs text-gray-500 italic bg-white/60 rounded-xl px-4 py-2.5 border border-gray-100">
              ℹ️ {breakdown.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
