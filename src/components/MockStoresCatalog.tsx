import React, { useState } from 'react';
import { Product } from '../types';
import { INITIAL_MOCK_PRODUCTS, getOffsetDateString, REFERENCE_DATE } from '../data/mockStores';
import { Database, Search, Filter, Calendar, MapPin, Tag, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

export const MockStoresCatalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pinFilter, setPinFilter] = useState('');

  const filteredProducts = INITIAL_MOCK_PRODUCTS.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.interests.some((i) => i.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || prod.category === selectedCategory;

    const matchesPin =
      !pinFilter.trim() || prod.supportedPinCodes.includes(pinFilter.trim());

    return matchesSearch && matchesCategory && matchesPin;
  });

  return (
    <div className="space-y-6">
      {/* Header & Transparency Notice */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900">Synthetic Mock Stores Catalog</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Transparent repository of {INITIAL_MOCK_PRODUCTS.length} synthetic gift products across 8 realistic categories with stable product IDs, inventory counts, and deterministic logistics estimates.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold shrink-0">
            Reference Anchor: {REFERENCE_DATE}
          </div>
        </div>

        {/* Anti-Hallucination Disclaimer */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
          <span>
            <strong>Synthetic Data Label:</strong> All 18 products below are simulated organizer-style mock store data. The agent accesses this deterministic dataset directly and does not access external live retail websites or invent fictitious live-shopping telemetry.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name, interest, or keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All 8 Categories</option>
            <option value="Books">Books</option>
            <option value="Personalised gifts">Personalised gifts</option>
            <option value="Desk accessories">Desk accessories</option>
            <option value="Mugs">Mugs</option>
            <option value="Home décor">Home décor</option>
            <option value="Accessories">Accessories</option>
            <option value="Hobby-related gifts">Hobby-related gifts</option>
            <option value="Gift sets">Gift sets</option>
          </select>

          <input
            type="text"
            maxLength={6}
            value={pinFilter}
            onChange={(e) => setPinFilter(e.target.value.replace(/\D/g, ''))}
            placeholder="Filter PIN (e.g. 560001)"
            className="w-36 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
          />
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Stable ID &amp; Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (INR)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Est. Delivery</th>
                <th className="py-3 px-4">Return Policy</th>
                <th className="py-3 px-4">Store &amp; Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => {
                const deliveryDate = getOffsetDateString(prod.deliveryDays);

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-cyan-700 font-bold mb-0.5">
                        {prod.id}
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{prod.name}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 max-w-sm mt-0.5">
                        {prod.description}
                      </p>
                      {prod.personalisationAvailable && (
                        <span className="inline-block mt-1 text-[10px] text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded font-medium">
                          Personalisation: {prod.customisationRequirements || 'Supported'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {prod.category}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold font-mono text-slate-900 tabular-nums text-sm">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {prod.inStock && prod.stockCount > 0 ? (
                        <span className="text-emerald-700 font-semibold text-xs">
                          In Stock ({prod.stockCount})
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold text-xs">
                          Out of Stock (0)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-800 tabular-nums">
                        {deliveryDate}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {prod.deliveryDays} transit days
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <span className={`text-[11px] leading-snug block ${
                        prod.isReturnable ? 'text-slate-600' : 'text-amber-800 font-medium'
                      }`}>
                        {!prod.isReturnable && '⚠️ '}
                        {prod.returnPolicy}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      <div className="font-semibold text-slate-800">{prod.mockStoreName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{prod.sourceRecordId}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-500">
            No synthetic products match your search or filter.
          </div>
        )}
      </div>
    </div>
  );
};
