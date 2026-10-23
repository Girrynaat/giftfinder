import React from 'react';
import { CartItem, Product, VerificationResult } from '../types';
import { ShoppingBag, X, ShieldCheck, Check, Trash2, Calendar, Store, Type, AlertCircle } from 'lucide-react';

interface MockCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onRunVerification: (item: CartItem) => void;
  verifications: VerificationResult[];
  onNavigateToVerificationTab: () => void;
}

export const MockCartDrawer: React.FC<MockCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onRunVerification,
  verifications,
  onNavigateToVerificationTab,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold">Simulated Shopping Cart</h2>
              <span className="text-xs text-slate-300">
                {cartItems.length} {cartItems.length === 1 ? 'Gift Approved' : 'Gifts Approved'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-xs text-cyan-900">
            <strong>Mock Simulation Notice:</strong> This is an agentic shopping simulation for Agentic AI Hackathon 2026. No payment information is collected and no actual order is charged.
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">Mock Cart is Empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Evaluate gifts in the Agent Studio and click "Review &amp; Approve Action" to add items here after human authorization.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => {
                const verification = verifications.find((v) => v.cartItemId === item.id);

                return (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <span>{item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.mockStoreName}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{item.productName}</h4>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove from mock cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                      <span className="text-base font-extrabold text-slate-900 font-mono tabular-nums">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Run: {item.runId}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Expected Delivery:
                        </span>
                        <span className="font-mono font-semibold text-slate-800 tabular-nums">
                          {item.expectedDeliveryDate}
                        </span>
                      </div>

                      {item.engravingText && (
                        <div className="p-1.5 bg-cyan-50/80 rounded border border-cyan-100 text-[11px] text-cyan-900 flex items-center gap-1">
                          <Type className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                          <span>Engraving: <strong>"{item.engravingText}"</strong></span>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500">
                        <span className="font-semibold block text-slate-700">Policy:</span>
                        <span className={item.isReturnable ? 'text-slate-600' : 'text-amber-800 font-medium'}>
                          {item.returnPolicy}
                        </span>
                      </div>
                    </div>

                    {/* Verification Status Badge & Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {verification ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                              verification.overallStatus === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {verification.overallStatus}
                          </span>
                          <button
                            onClick={() => {
                              onClose();
                              onNavigateToVerificationTab();
                            }}
                            className="text-[11px] text-cyan-700 underline font-semibold hover:text-cyan-900"
                          >
                            View Audit
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not verified yet</span>
                      )}

                      <button
                        onClick={() => onRunVerification(item)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Run Independent Check</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Mock Cart Value</span>
            <span className="text-lg font-extrabold text-slate-900 font-mono tabular-nums">
              ₹{subtotal.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              onNavigateToVerificationTab();
            }}
            className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Open Independent Verification Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
