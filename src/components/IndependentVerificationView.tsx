import React from 'react';
import { VerificationResult, VerificationCheck } from '../types';
import { ShieldCheck, AlertCircle, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface IndependentVerificationViewProps {
  verifications: VerificationResult[];
  onReverify?: (cartItemId: string) => void;
}

export const IndependentVerificationView: React.FC<IndependentVerificationViewProps> = ({
  verifications,
  onReverify,
}) => {
  if (verifications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-700">No Cart Items Verified Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Once you explicitly approve and add a shortlisted gift to the mock cart, the independent verification engine runs automated checks against live mock-store records.
        </p>
      </div>
    );
  }

  const renderCheckRow = (check: VerificationCheck) => {
    return (
      <tr className="border-b border-slate-100 last:border-b-0 text-xs">
        <td className="py-2.5 px-3 font-medium text-slate-900">{check.label}</td>
        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{String(check.intended)}</td>
        <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-800">
          {String(check.observed)}
        </td>
        <td className="py-2.5 px-3">
          <div className="flex items-center gap-1.5">
            {check.passed ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Passed
              </span>
            ) : (
              <span className="text-rose-700 font-semibold flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Failed
              </span>
            )}
          </div>
        </td>
        <td className="py-2.5 px-3 text-slate-500 text-[11px] leading-snug">{check.message}</td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            Independent Post-Cart Verification Audit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Performs autonomous re-validation against live mock-store inventory, logistics deadlines, price caps, and policy disclosures.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Total Audited: <span className="font-bold text-slate-800">{verifications.length}</span>
        </div>
      </div>

      <div className="space-y-5">
        {verifications.map((v) => {
          const isVerified = v.overallStatus === 'Verified';
          const isFailed = v.overallStatus === 'Failed';
          const isReview = v.overallStatus === 'Needs manual review';

          return (
            <div
              key={v.id}
              className={`bg-white rounded-xl border overflow-hidden shadow-xs ${
                isVerified
                  ? 'border-emerald-200'
                  : isFailed
                  ? 'border-rose-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Header Bar */}
              <div
                className={`px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b ${
                  isVerified
                    ? 'bg-emerald-50/50 border-emerald-100'
                    : isFailed
                    ? 'bg-rose-50/50 border-rose-100'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 ${
                      isVerified
                        ? 'bg-emerald-700 text-white'
                        : isFailed
                        ? 'bg-rose-700 text-white'
                        : 'bg-amber-700 text-white'
                    }`}
                  >
                    {isVerified ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span>Status: {v.overallStatus}</span>
                  </div>

                  <span className="text-xs font-mono font-semibold text-slate-700">
                    Product ID: {v.productId}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>Run: {v.runId}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(v.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Side-by-Side Verification Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2 px-3">Rule Check</th>
                      <th className="py-2 px-3">Intended Action State</th>
                      <th className="py-2 px-3">Actual Observed State</th>
                      <th className="py-2 px-3">Verdict</th>
                      <th className="py-2 px-3">Verification Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderCheckRow(v.stockCheck)}
                    {renderCheckRow(v.deliveryCheck)}
                    {renderCheckRow(v.priceCheck)}
                    {renderCheckRow(v.returnPolicyCheck)}
                  </tbody>
                </table>
              </div>

              {/* Diagnostic Notes Footer */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-mono text-[11px] text-slate-500">
                  Verification Audit Token: {v.id}
                </span>
                <span className="font-medium text-slate-700">
                  Notes: {v.diagnosticNotes}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
