import React, { useState } from 'react';
import { AgentDecision, CartItem, UserInput } from '../types';
import { ShieldCheck, AlertTriangle, X, Check, Calendar, Store, Type } from 'lucide-react';

interface HumanApprovalModalProps {
  decision: AgentDecision;
  userInput: UserInput;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApproval: (cartItem: CartItem) => void;
  isAlreadyInCart: boolean;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  decision,
  userInput,
  isOpen,
  onClose,
  onConfirmApproval,
  isAlreadyInCart,
}) => {
  const [engravingConfirmed, setEngravingConfirmed] = useState(false);
  const [returnPolicyAcknowledged, setReturnPolicyAcknowledged] = useState(false);

  if (!isOpen) return null;

  const { product, estimatedDeliveryDate } = decision;
  const isPersonalised = product.personalisationAvailable && !!userInput.engravingText;
  const isNonReturnable = !product.isReturnable;

  const handleApprove = () => {
    if (isAlreadyInCart) return;

    const cartItem: CartItem = {
      id: `CART-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      runId: userInput.runId,
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
      expectedDeliveryDate: estimatedDeliveryDate,
      returnPolicy: product.returnPolicy,
      isReturnable: product.isReturnable,
      engravingText: isPersonalised ? userInput.engravingText : undefined,
      approvedAt: new Date().toISOString(),
      approvalStatus: 'approved',
      mockStoreName: product.mockStoreName,
      sourceRecordId: product.sourceRecordId,
    };

    onConfirmApproval(cartItem);
    onClose();
  };

  // Condition to enable approval button
  const canApprove =
    !isAlreadyInCart &&
    (!isPersonalised || engravingConfirmed) &&
    (!isNonReturnable || returnPolicyAcknowledged);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold leading-tight">Explicit Human Approval Required</h3>
              <p className="text-xs text-slate-300">Proposed Action: Add selected gift to mock cart</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
            aria-label="Close approval modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Simulated Disclaimer */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
            <strong>Simulation Safety Guard:</strong> The AI Agent is prohibited from adding items to your cart automatically. Your explicit confirmation authorizes this action in the simulated shopping environment.
          </div>

          {/* Product Summary */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 font-medium">{product.category} · {product.mockStoreName}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{product.name}</h4>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-extrabold text-slate-900 font-mono tabular-nums">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="block text-[11px] text-slate-500">Max Budget: ₹{userInput.maxBudget.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Delivery: <strong className="font-mono text-slate-800">{estimatedDeliveryDate}</strong> (Deadline: {userInput.requiredDeliveryDate})
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                Source ID: {product.sourceRecordId}
              </span>
            </div>
          </div>

          {/* TC2: Exact Engraving Readback Guard */}
          {isPersonalised && (
            <div className="p-4 bg-cyan-50/80 border border-cyan-300 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-950">
                <Type className="w-4 h-4 text-cyan-700" />
                <span>Custom Engraving Readback (Verbatim Check)</span>
              </div>
              <div className="p-2.5 bg-white border border-cyan-200 rounded text-center">
                <span className="text-xs text-slate-400 block mb-0.5">Exact Text to be Inscribed:</span>
                <p className="text-base font-extrabold text-slate-900 font-mono tracking-wide selection:bg-cyan-200">
                  "{userInput.engravingText}"
                </p>
              </div>
              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={engravingConfirmed}
                  onChange={(e) => setEngravingConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-cyan-600 border-cyan-300 rounded focus:ring-cyan-500"
                />
                <span className="text-xs text-cyan-900 font-medium">
                  I confirm that the spelling, capitalization, and punctuation of <strong>"{userInput.engravingText}"</strong> are exact and approved for engraving.
                </span>
              </label>
            </div>
          )}

          {/* TC4: Non-Returnable Policy Prominent Disclosure */}
          {isNonReturnable ? (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Mandatory Policy Disclosure: Non-Returnable Item</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {product.returnPolicy}
              </p>
              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={returnPolicyAcknowledged}
                  onChange={(e) => setReturnPolicyAcknowledged(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                />
                <span className="text-xs text-amber-950 font-medium">
                  I understand that this customised product is strictly <strong>non-returnable</strong> and cannot be refunded once dispatched.
                </span>
              </label>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
              <span className="font-semibold block text-slate-900 mb-0.5">Disclosed Return Policy:</span>
              <p className="text-slate-600">{product.returnPolicy}</p>
            </div>
          )}

          {/* Duplicate Action Prevention Banner */}
          {isAlreadyInCart && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Duplicate Prevention:</strong> This product is already in the mock cart for Run ID {userInput.runId}. Repeating the request will not add duplicate actions.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel Action
          </button>

          <button
            type="button"
            onClick={handleApprove}
            disabled={!canApprove}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              canApprove
                ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Approve &amp; Add to Mock Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
