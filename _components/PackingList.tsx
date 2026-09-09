'use client';

import { useState } from 'react';
import { Loader2, ChevronDown, ChevronUp, Backpack, CheckCircle, Circle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface PackingCategory {
  name: string;
  emoji: string;
  items: string[];
}

interface PackingListData {
  categories: PackingCategory[];
}

interface PackingListProps {
  destination: string;
  duration: string;
  budget: string;
  group_size: string;
  itinerary: any[];
}

export default function PackingList({ destination, duration, budget, group_size, itinerary }: PackingListProps) {
  const [packingList, setPackingList] = useState<PackingListData | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const generateList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, duration, budget, group_size, itinerary }),
      });

      const data = await res.json();
      if (data.success) {
        setPackingList(data.packingList);
        // Expand all categories by default
        setExpanded(new Set(data.packingList.categories.map((c: PackingCategory) => c.name)));
        setIsOpen(true);
        toast.success('Packing list generated!');
      } else {
        toast.error('Failed to generate packing list');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleCategory = (name: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const totalItems = packingList?.categories.reduce((sum, c) => sum + c.items.length, 0) || 0;
  const packedItems = checked.size;
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 overflow-hidden shadow-lg">
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => packingList && setIsOpen(prev => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md">
            <Backpack className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Smart Packing List</h3>
            {packingList && (
              <p className="text-sm text-emerald-700 font-medium">
                {packedItems}/{totalItems} packed · {progress}% ready
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {packingList && (
            <button
              onClick={e => { e.stopPropagation(); generateList(); }}
              className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
              title="Regenerate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {!packingList ? (
            <button
              onClick={generateList}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>✨ Generate List</>
              )}
            </button>
          ) : (
            isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {packingList && (
        <div className="px-5 pb-3">
          <div className="w-full bg-emerald-200 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Categories */}
      {isOpen && packingList && (
        <div className="px-4 pb-5 space-y-3">
          {packingList.categories.map((category) => {
            const isExpanded = expanded.has(category.name);
            const categoryChecked = category.items.filter(item =>
              checked.has(`${category.name}-${item}`)
            ).length;

            return (
              <div key={category.name} className="bg-white rounded-xl border border-emerald-100 overflow-hidden shadow-sm">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.emoji}</span>
                    <span className="font-semibold text-gray-800">{category.name}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      {categoryChecked}/{category.items.length}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {/* Items */}
                {isExpanded && (
                  <div className="px-4 pb-3 space-y-2 border-t border-gray-100">
                    {category.items.map((item) => {
                      const key = `${category.name}-${item}`;
                      const isChecked = checked.has(key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleItem(key)}
                          className={`w-full flex items-center gap-3 py-2 px-2 rounded-lg transition-all text-left ${
                            isChecked ? 'bg-emerald-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          {isChecked ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Completion Message */}
          {progress === 100 && (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-bold text-emerald-700 text-lg">All packed! Have an amazing trip!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
