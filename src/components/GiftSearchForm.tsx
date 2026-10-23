import React, { useState } from 'react';
import { UserInput, ProductCategory } from '../types';
import { COMMON_PIN_CODES, getOffsetDateString, REFERENCE_DATE } from '../data/mockStores';
import { Calendar, Search, DollarSign, MapPin, Tag, Type, AlertCircle, RefreshCw } from 'lucide-react';

interface GiftSearchFormProps {
  initialInput?: Partial<UserInput>;
  onSubmit: (input: UserInput) => void;
  isLoading: boolean;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'Books', value: 'Books' },
  { label: 'Personalised gifts', value: 'Personalised gifts' },
  { label: 'Desk accessories', value: 'Desk accessories' },
  { label: 'Mugs', value: 'Mugs' },
  { label: 'Home décor', value: 'Home décor' },
  { label: 'Accessories', value: 'Accessories' },
  { label: 'Hobby-related gifts', value: 'Hobby-related gifts' },
  { label: 'Gift sets', value: 'Gift sets' },
];

const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Graduation',
  'Promotion',
  'Housewarming',
  'Festive / Diwali',
  'Thank You',
  'Just Because',
];

export const GiftSearchForm: React.FC<GiftSearchFormProps> = ({
  initialInput,
  onSubmit,
  isLoading,
}) => {
  const [recipientInterests, setRecipientInterests] = useState(
    initialInput?.recipientInterests || 'Reading, Books, Fiction, Philosophy'
  );
  const [occasion, setOccasion] = useState(initialInput?.occasion || 'Birthday');
  const [maxBudget, setMaxBudget] = useState<number>(initialInput?.maxBudget ?? 1500);
  const [requiredDeliveryDate, setRequiredDeliveryDate] = useState(
    initialInput?.requiredDeliveryDate || getOffsetDateString(4)
  );
  const [deliveryPinCode, setDeliveryPinCode] = useState(
    initialInput?.deliveryPinCode || '560001'
  );
  const [category, setCategory] = useState(initialInput?.category || 'all');
  const [personalisationRequired, setPersonalisationRequired] = useState(
    initialInput?.personalisationRequired || false
  );
  const [engravingText, setEngravingText] = useState(
    initialInput?.engravingText || ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync when initialInput changes (e.g. when user clicks a preset)
  React.useEffect(() => {
    if (initialInput) {
      if (initialInput.recipientInterests !== undefined) setRecipientInterests(initialInput.recipientInterests);
      if (initialInput.occasion !== undefined) setOccasion(initialInput.occasion);
      if (initialInput.maxBudget !== undefined) setMaxBudget(initialInput.maxBudget);
      if (initialInput.requiredDeliveryDate !== undefined) setRequiredDeliveryDate(initialInput.requiredDeliveryDate);
      if (initialInput.deliveryPinCode !== undefined) setDeliveryPinCode(initialInput.deliveryPinCode);
      if (initialInput.category !== undefined) setCategory(initialInput.category);
      if (initialInput.personalisationRequired !== undefined) setPersonalisationRequired(initialInput.personalisationRequired);
      if (initialInput.engravingText !== undefined) setEngravingText(initialInput.engravingText);
      setErrors({});
    }
  }, [initialInput]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!recipientInterests.trim()) {
      errs.recipientInterests = 'Please enter at least one recipient interest or hobby.';
    }
    if (!occasion) {
      errs.occasion = 'Please select an occasion.';
    }
    if (!maxBudget || maxBudget <= 0) {
      errs.maxBudget = 'Budget must be greater than ₹0.';
    }
    if (!requiredDeliveryDate) {
      errs.requiredDeliveryDate = 'Delivery deadline date is mandatory.';
    }
    if (!deliveryPinCode || deliveryPinCode.trim().length !== 6) {
      errs.deliveryPinCode = 'Enter a valid 6-digit Indian PIN code (e.g., 560001).';
    }
    if (personalisationRequired && !engravingText.trim()) {
      errs.engravingText = 'Enter custom engraving or personalization text.';
    } else if (personalisationRequired && engravingText.length > 32) {
      errs.engravingText = 'Engraving text cannot exceed 32 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const runId = `RUN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
    const input: UserInput = {
      runId,
      recipientInterests: recipientInterests.trim(),
      occasion,
      maxBudget: Number(maxBudget),
      requiredDeliveryDate,
      deliveryPinCode: deliveryPinCode.trim(),
      category: category === 'all' ? undefined : category,
      personalisationRequired,
      engravingText: personalisationRequired ? engravingText : undefined,
    };

    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Configure Gift Search Parameters</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            The agent parses these constraints and enforces deterministic stock and deadline eligibility rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Recipient Interests */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Recipient Interests &amp; Hobbies <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={recipientInterests}
            onChange={(e) => setRecipientInterests(e.target.value)}
            placeholder="e.g. Reading, Books, Astronomy, Coffee, Minimalism, Woodworking"
            className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all ${
              errors.recipientInterests ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
            }`}
          />
          {errors.recipientInterests && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.recipientInterests}
            </p>
          )}
          {/* Quick Suggestions */}
          <div className="mt-1.5 flex flex-wrap gap-1.5 items-center text-xs text-slate-500">
            <span className="text-[11px] text-slate-400 font-medium">Quick ideas:</span>
            {['Reading & Books', 'Coffee & Tea', 'Desk & Productivity', 'Gardening & Plants', 'Home Cozy Candles'].map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setRecipientInterests(idea)}
                className="text-xs text-slate-600 hover:text-slate-900 hover:underline px-1 py-0.5"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>

        {/* Occasion */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Occasion <span className="text-rose-500">*</span>
          </label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
          >
            {OCCASIONS.map((occ) => (
              <option key={occ} value={occ}>
                {occ}
              </option>
            ))}
          </select>
        </div>

        {/* Maximum Budget */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Maximum Budget (INR) <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
              ₹{maxBudget.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="200"
              max="5000"
              step="50"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white ${
                errors.maxBudget ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400">Presets:</span>
            {[750, 1000, 1200, 1500].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setMaxBudget(val)}
                className={`px-2 py-0.5 text-xs font-mono tabular-nums rounded transition-colors ${
                  maxBudget === val ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ₹{val}
              </button>
            ))}
          </div>
          {errors.maxBudget && (
            <p className="mt-1 text-xs text-rose-600">{errors.maxBudget}</p>
          )}
        </div>

        {/* Required Delivery Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Required Delivery Deadline <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={requiredDeliveryDate}
              onChange={(e) => setRequiredDeliveryDate(e.target.value)}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white ${
                errors.requiredDeliveryDate ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400">Quick offsets:</span>
            {[
              { label: '+2 Days (Tight)', days: 2 },
              { label: '+4 Days (Standard)', days: 4 },
              { label: '+7 Days (Safe)', days: 7 },
            ].map(({ label, days }) => {
              const target = getOffsetDateString(days);
              const isActive = requiredDeliveryDate === target;
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => setRequiredDeliveryDate(target)}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {errors.requiredDeliveryDate && (
            <p className="mt-1 text-xs text-rose-600">{errors.requiredDeliveryDate}</p>
          )}
        </div>

        {/* Delivery PIN Code */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Delivery PIN Code (India) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            maxLength={6}
            value={deliveryPinCode}
            onChange={(e) => setDeliveryPinCode(e.target.value.replace(/\D/g, ''))}
            placeholder="560001"
            className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white ${
              errors.deliveryPinCode ? 'border-rose-400' : 'border-slate-300'
            }`}
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400">Metro PINs:</span>
            {[
              { code: '560001', city: 'BLR' },
              { code: '110001', city: 'DEL' },
              { code: '400001', city: 'BOM' },
              { code: '600001', city: 'MAA' },
            ].map(({ code, city }) => (
              <button
                key={code}
                type="button"
                onClick={() => setDeliveryPinCode(code)}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                  deliveryPinCode === code ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {code} ({city})
              </button>
            ))}
          </div>
          {errors.deliveryPinCode && (
            <p className="mt-1 text-xs text-rose-600">{errors.deliveryPinCode}</p>
          )}
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Category Filter (Optional)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Personalisation Option */}
        <div className="flex flex-col justify-center">
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={personalisationRequired}
              onChange={(e) => setPersonalisationRequired(e.target.checked)}
              className="w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
            />
            <span className="text-xs font-semibold text-slate-800">
              Personalisation / Custom Engraving Required
            </span>
          </label>
          <span className="text-[11px] text-slate-500 mt-1 pl-6">
            When enabled, only gifts supporting custom text are shortlisted, and non-returnable policies are flagged.
          </span>
        </div>

        {/* Engraving Text (Conditional) */}
        {personalisationRequired && (
          <div className="md:col-span-2 p-3.5 bg-cyan-50/50 border border-cyan-200 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-cyan-900 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-cyan-700" />
                Custom Engraving Text <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-cyan-700 tabular-nums">
                {engravingText.length} / 32 chars
              </span>
            </div>
            <input
              type="text"
              maxLength={32}
              value={engravingText}
              onChange={(e) => setEngravingText(e.target.value)}
              placeholder="e.g. Happy Birthday, Anu"
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium ${
                errors.engravingText ? 'border-rose-400' : 'border-cyan-300'
              }`}
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-cyan-800">
              <span>Notice: Spelling, punctuation, and capitalization will be verified verbatim before cart addition.</span>
              <button
                type="button"
                onClick={() => setEngravingText('Happy Birthday, Anu')}
                className="text-cyan-700 underline font-semibold hover:text-cyan-900"
              >
                Set "Happy Birthday, Anu" (TC2)
              </button>
            </div>
            {errors.engravingText && (
              <p className="mt-1 text-xs text-rose-600">{errors.engravingText}</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Executing Agent Workflow...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Run Gift Shopping Agent</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
