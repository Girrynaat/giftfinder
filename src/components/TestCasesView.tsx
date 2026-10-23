import React, { useState } from 'react';
import { TestCase, TestCaseExecutionResult } from '../types';
import { OFFICIAL_TEST_CASES, runSingleTestCase } from '../services/testRunner';
import { INITIAL_MOCK_PRODUCTS } from '../data/mockStores';
import { CheckCircle2, XCircle, Play, RefreshCw, Layers, ShieldCheck, HelpCircle } from 'lucide-react';

interface TestCasesViewProps {
  testResults: Record<string, TestCaseExecutionResult>;
  onSaveTestResult: (result: TestCaseExecutionResult) => void;
}

export const TestCasesView: React.FC<TestCasesViewProps> = ({
  testResults,
  onSaveTestResult,
}) => {
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);

  const handleRunSingle = async (tc: TestCase) => {
    setRunningTestId(tc.id);
    try {
      const res = await runSingleTestCase(tc, INITIAL_MOCK_PRODUCTS);
      onSaveTestResult(res);
    } catch (err) {
      console.error(`Failed running test ${tc.id}:`, err);
    } finally {
      setRunningTestId(null);
    }
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    for (const tc of OFFICIAL_TEST_CASES) {
      setRunningTestId(tc.id);
      try {
        const res = await runSingleTestCase(tc, INITIAL_MOCK_PRODUCTS);
        onSaveTestResult(res);
        await new Promise((r) => setTimeout(r, 300));
      } catch (err) {
        console.error(`Error executing ${tc.id}:`, err);
      }
    }
    setRunningTestId(null);
    setIsRunningAll(false);
  };

  const totalCompleted = Object.keys(testResults).length;
  const totalPassed = Object.values(testResults).filter((r) => r.passed).length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Official Test Cases Suite</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Agentic AI Hackathon 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Deterministic evaluation harness for the 4 mandatory hackathon scenarios. Demonstrates budget compliance, verbatim engraving readback, late delivery exclusion, and non-returnable policy disclosures.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right text-xs">
            <span className="block text-slate-400 font-medium">Pass Rate:</span>
            <span className="text-sm font-bold font-mono text-slate-800">
              {totalPassed} / 4 Passed
            </span>
          </div>

          <button
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {isRunningAll ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Running Test Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                <span>Run All 4 Official Test Cases</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of the 4 Test Cases */}
      <div className="grid grid-cols-1 gap-5">
        {OFFICIAL_TEST_CASES.map((tc) => {
          const result = testResults[tc.id];
          const isRunningThis = runningTestId === tc.id;

          return (
            <div
              key={tc.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all shadow-xs ${
                result
                  ? result.passed
                    ? 'border-emerald-200'
                    : 'border-rose-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Top Row */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-slate-900 text-white rounded text-xs font-mono font-bold">
                    {tc.id}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{tc.title}</h3>
                    <p className="text-xs text-slate-500">{tc.objective}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {result && (
                    <div
                      className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 ${
                        result.passed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {result.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{result.passed ? 'PASSED' : 'FAILED'}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleRunSingle(tc)}
                    disabled={isRunningThis || isRunningAll}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {isRunningThis ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3 fill-current text-slate-500" />
                    )}
                    <span>Run Test {tc.id}</span>
                  </button>
                </div>
              </div>

              {/* Details & Comparison */}
              <div className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Test Input Summary */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-semibold block text-slate-700 mb-1.5">
                      Configured Test Input:
                    </span>
                    <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                      <li><strong className="font-sans text-slate-500">Interests:</strong> {tc.input.recipientInterests}</li>
                      <li><strong className="font-sans text-slate-500">Occasion:</strong> {tc.input.occasion}</li>
                      <li><strong className="font-sans text-slate-500">Budget:</strong> ₹{tc.input.maxBudget}</li>
                      <li><strong className="font-sans text-slate-500">Required Deadline:</strong> {tc.input.requiredDeliveryDate}</li>
                      <li><strong className="font-sans text-slate-500">PIN Code:</strong> {tc.input.deliveryPinCode}</li>
                      {tc.input.engravingText && (
                        <li><strong className="font-sans text-cyan-800">Engraving:</strong> "{tc.input.engravingText}"</li>
                      )}
                    </ul>
                  </div>

                  {/* Expected Outcome */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-semibold block text-slate-700 mb-1.5">
                      Expected Official Result:
                    </span>
                    <p className="text-slate-600 leading-relaxed text-[12px]">
                      {tc.expectedOutcome}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <strong>Audit Benchmark:</strong> {tc.explanationText}
                    </div>
                  </div>
                </div>

                {/* Actual Result & Supporting Evidence (If executed) */}
                {result ? (
                  <div className={`p-4 rounded-lg border ${
                    result.passed ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">Actual Observed Outcome:</span>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                        <span>Evidence ID: <strong className="text-slate-800">{result.supportingEvidenceId}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(result.executedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed ${
                      result.passed ? 'text-emerald-900' : 'text-rose-900'
                    }`}>
                      {result.actual}
                    </p>

                    {result.approvalAction && (
                      <div className="mt-2.5 pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800 flex items-center justify-between">
                        <span>Human Approval Action Recorded: {result.approvalAction.id}</span>
                        {result.approvalAction.engravingText && (
                          <span className="font-mono font-bold">Verbatim Text: "{result.approvalAction.engravingText}"</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                    Test has not been executed in this session. Click "Run Test {tc.id}" or "Run All 4 Official Test Cases" above to verify.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
