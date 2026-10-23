import React, { useState } from 'react';
import { AuditRecord, TestCaseExecutionResult } from '../types';
import { FileText, Download, RotateCcw, Search, ChevronDown, ChevronUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AuditTrailViewProps {
  auditRecords: AuditRecord[];
  testResults: Record<string, TestCaseExecutionResult>;
  onResetAllData: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  auditRecords,
  testResults,
  onResetAllData,
}) => {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = auditRecords.filter((rec) => {
    return (
      rec.runId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.input.recipientInterests.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.reasoningEngine.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleExportJSON = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      platform: 'Gift Finder with Delivery Deadline — Agentic AI Hackathon 2026',
      auditRecords,
      officialTestResults: testResults,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gift-finder-audit-trail-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Immutable Audit Trail &amp; Evidence Ledger</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Complete record of every autonomous run: inputs, retrieved source IDs, eligibility decisions, human approvals, and independent verification results stored in browser localStorage.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-cyan-700" />
            <span>Export Audit Trail (JSON)</span>
          </button>

          <button
            onClick={onResetAllData}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search audit trail by Run ID, recipient interests, or engine..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Audit Log Entries */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-xs text-slate-500">
          No audit records found. Run a gift search in Agent Studio or execute an Official Test Case to generate audit records.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((rec) => {
            const isExpanded = expandedRunId === rec.runId;

            return (
              <div
                key={rec.runId}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
              >
                {/* Entry Header */}
                <div
                  onClick={() => setExpandedRunId(isExpanded ? null : rec.runId)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {rec.runId}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{new Date(rec.timestamp).toLocaleString()}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-cyan-800 font-semibold">{rec.reasoningEngine}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-800 mt-1">
                      Interests: "{rec.input.recipientInterests}" · Budget: ₹{rec.input.maxBudget} · Deadline: {rec.input.requiredDeliveryDate} · PIN: {rec.input.deliveryPinCode}
                    </h4>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-slate-500">
                      <span>Eligible: <strong className="text-emerald-700">{rec.shortlistCount}</strong></span>
                      <span className="mx-1.5">·</span>
                      <span>Excluded: <strong className="text-rose-700">{rec.excludedCount}</strong></span>
                      <span className="mx-1.5">·</span>
                      <span>Approved: <strong className="text-slate-900">{rec.cartActions.length}</strong></span>
                    </div>

                    <button className="text-slate-400 hover:text-slate-700 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
                    {/* Input Dump */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">Preserved User Input Parameters:</span>
                      <pre className="text-[11px] font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(rec.input, null, 2)}
                      </pre>
                    </div>

                    {/* Decisions Summary */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-2">Evaluated Products ({rec.decisions.length}):</span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                              <th className="py-1.5 px-2">Product ID</th>
                              <th className="py-1.5 px-2">Name</th>
                              <th className="py-1.5 px-2">Price</th>
                              <th className="py-1.5 px-2">Status</th>
                              <th className="py-1.5 px-2">Delivery Date</th>
                              <th className="py-1.5 px-2">Reason/Rejection</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rec.decisions.map((d) => (
                              <tr key={d.productId} className="border-b border-slate-100">
                                <td className="py-1.5 px-2 font-mono text-slate-600">{d.productId}</td>
                                <td className="py-1.5 px-2 font-medium text-slate-900">{d.product.name}</td>
                                <td className="py-1.5 px-2 font-mono">₹{d.product.price}</td>
                                <td className="py-1.5 px-2">
                                  <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                    d.status === 'eligible'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {d.status}
                                  </span>
                                </td>
                                <td className="py-1.5 px-2 font-mono">{d.estimatedDeliveryDate}</td>
                                <td className="py-1.5 px-2 text-slate-600 max-w-xs">
                                  {d.rejectionReasons.length > 0
                                    ? d.rejectionReasons.join('; ')
                                    : d.recommendationReason || 'Eligible'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Human Approval and Verification Logs */}
                    {rec.cartActions.length > 0 && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900 block mb-2">Recorded Human Approvals &amp; Cart Actions:</span>
                        <div className="space-y-2">
                          {rec.cartActions.map((ca) => (
                            <div key={ca.id} className="p-2 bg-slate-50 rounded border border-slate-200 flex flex-wrap items-center justify-between text-[11px] gap-2">
                              <div>
                                <span className="font-bold text-slate-900">{ca.productName}</span>
                                <span className="text-slate-500 font-mono"> ({ca.productId})</span>
                                {ca.engravingText && (
                                  <span className="text-cyan-800 font-semibold block">Engraving: "{ca.engravingText}"</span>
                                )}
                              </div>
                              <div className="text-slate-500 font-mono text-right">
                                <div>Approved at {new Date(ca.approvedAt).toLocaleTimeString()}</div>
                                <div className="text-slate-400">Cart Item ID: {ca.id}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
