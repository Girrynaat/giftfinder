import React, { useState } from 'react';
import { AgentDecision, UserInput } from '../types';
import { Check, X, AlertTriangle, ShieldAlert, Sparkles, ExternalLink, Calendar, PackageCheck, HelpCircle } from 'lucide-react';

interface ProductShortlistProps {
  decisions: AgentDecision[];
  userInput: UserInput;
  onInitiateApproval: (decision: AgentDecision) => void;
  alreadyApprovedProductIds: string[];
}

export const ProductShortlist: React.FC<ProductShortlistProps> = ({
  decisions,
  userInput,
  onInitiateApproval,
  alreadyApprovedProductIds,
}) => {
  const [filter, setFilter] = useState<'all' | 'eligible' | 'excluded'>('eligible');

  const eligibleItems = decisions.filter((d) => d.status === 'eligible');
  const excludedItems = decisions.filter((d) => d.status === 'excluded');
  const uncertainItems = decisions.filter((d) => d.status === 'uncertain');

  const displayedItems =
    filter === 'eligible'
      ? eligibleItems
      : filter === 'excluded'
      ? excludedItems
      : decisions;

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Agent Product Evaluations &amp; Shortlist
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>{decisions.length} Evaluated</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">{eligibleItems.length} Eligible</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-700 font-medium">{excludedItems.length} Excluded</span>
            {uncertainItems.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700 font-medium">{uncertainItems.length} Needs Verification</span>
              </>
            )}
          </div>
        </div>

        {/* Functional Segmented Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setFilter('eligible')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'eligible'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Eligible Shortlist ({eligibleItems.length})
          </button>
          <button
            onClick={() => setFilter('excluded')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'excluded'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Excluded ({excludedItems.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Evaluated ({decisions.length})
          </button>
        </div>
      </div>

      {/* Grid of Product Cards */}
      {displayedItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No products match this view</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your budget cap or delivery deadline parameters to widen candidate eligibility.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map((decision) => {
            const { product, status, rejectionReasons, recommendationReason, estimatedDeliveryDate } = decision;
            const isApproved = alreadyApprovedProductIds.includes(product.id);
            const isEligible = status === 'eligible';

            return (
              <div
                key={product.id}
                className={`bg-white rounded-xl border flex flex-col justify-between overflow-hidden transition-shadow hover:shadow-md ${
                  isEligible
                    ? 'border-slate-200 ring-1 ring-slate-100'
                    : 'border-slate-200 bg-slate-50/50 opacity-90'
                }`}
              >
                <div>
                  {/* Visual Header / Image Slot with Zero-Broken-Image Fallback */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Resilient fallback to styled container
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600">
                        <PackageCheck className="w-10 h-10 text-slate-400 mb-2" />
                        <span className="text-xs font-semibold text-slate-700">{product.category}</span>
                        <span className="text-[11px] text-slate-400">{product.mockStoreName}</span>
                      </div>
                    )}

                    {/* Status Ribbon (Unboxed text with crisp contrast) */}
                    <div className="absolute top-3 left-3">
                      {isEligible ? (
                        <div className="bg-emerald-900/90 text-emerald-100 backdrop-blur-xs text-[11px] font-bold px-2.5 py-1 rounded shadow-xs flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Eligible Gift</span>
                        </div>
                      ) : status === 'excluded' ? (
                        <div className="bg-rose-900/90 text-rose-100 backdrop-blur-xs text-[11px] font-bold px-2.5 py-1 rounded shadow-xs flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5 text-rose-400" />
                          <span>Excluded</span>
                        </div>
                      ) : (
                        <div className="bg-amber-900/90 text-amber-100 backdrop-blur-xs text-[11px] font-bold px-2.5 py-1 rounded shadow-xs flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Needs Verification</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 sm:p-5">
                    {/* Clean unboxed metadata row */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
                      <span>{product.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{product.mockStoreName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px] text-slate-400">{product.sourceRecordId}</span>
                    </div>

                    {/* Product Title */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Price & Stock Row */}
                    <div className="mt-2.5 flex items-baseline justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold text-slate-900 font-mono tabular-nums">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-400">INR</span>
                      </div>
                      <div className="text-xs font-semibold">
                        {product.inStock && product.stockCount > 0 ? (
                          <span className="text-emerald-700">In Stock ({product.stockCount} left)</span>
                        ) : (
                          <span className="text-rose-600">Out of Stock</span>
                        )}
                      </div>
                    </div>

                    {/* Delivery & Logistics Row */}
                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Est. Delivery:
                        </span>
                        <span className={`font-mono font-semibold tabular-nums ${
                          estimatedDeliveryDate <= userInput.requiredDeliveryDate
                            ? 'text-emerald-800'
                            : 'text-rose-700'
                        }`}>
                          {estimatedDeliveryDate} ({product.deliveryDays}d transit)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Required Deadline:</span>
                        <span className="font-mono text-slate-600 tabular-nums">
                          {userInput.requiredDeliveryDate}
                        </span>
                      </div>
                    </div>

                    {/* Return Policy Notice */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
                      <span className="text-[11px] font-semibold block text-slate-500 mb-0.5">Return Policy:</span>
                      <p className={`text-xs ${!product.isReturnable ? 'text-amber-800 font-medium' : 'text-slate-600'}`}>
                        {!product.isReturnable && (
                          <strong className="text-amber-900 font-bold block mb-0.5">
                            ⚠️ Non-Returnable / Final Sale:
                          </strong>
                        )}
                        {product.returnPolicy}
                      </p>
                    </div>

                    {/* Customisation/Personalisation Notice */}
                    {product.personalisationAvailable && (
                      <div className="mt-2.5 text-xs text-cyan-900 bg-cyan-50/70 p-2 rounded border border-cyan-100">
                        <span className="font-semibold block text-[11px] text-cyan-950">Personalisation Supported:</span>
                        <p className="text-[11px] text-cyan-800">{product.customisationRequirements}</p>
                      </div>
                    )}

                    {/* Agent Recommendation Rationale or Rejection Reason */}
                    {isEligible && recommendationReason && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700">
                        <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                          Agent Reasoning Rationale
                        </span>
                        <p className="text-slate-600 leading-relaxed text-[12px]">{recommendationReason}</p>
                      </div>
                    )}

                    {/* Rejection Explanations (Mandatory for excluded items) */}
                    {!isEligible && rejectionReasons.length > 0 && (
                      <div className="mt-3 p-3 bg-rose-50/80 rounded-lg border border-rose-200 text-xs text-rose-900">
                        <span className="text-[11px] font-bold text-rose-950 block mb-1">
                          Deterministic Exclusion Reasons:
                        </span>
                        <ul className="space-y-1 text-[11px] list-disc list-inside">
                          {rejectionReasons.map((reason, idx) => (
                            <li key={idx} className="leading-tight">{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Retrieved: {new Date(decision.retrievalTimestamp).toLocaleTimeString()}
                    </span>

                    {isEligible && (
                      <button
                        type="button"
                        onClick={() => onInitiateApproval(decision)}
                        disabled={isApproved}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 ${
                          isApproved
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs'
                        }`}
                      >
                        {isApproved ? 'Approved in Cart' : 'Review & Approve Action'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
