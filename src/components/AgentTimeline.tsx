import React from 'react';
import { AgentStep } from '../types';
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Cpu } from 'lucide-react';

interface AgentTimelineProps {
  steps: AgentStep[];
  plan: string[];
  runId?: string;
  isExecuting: boolean;
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({
  steps,
  plan,
  runId,
  isExecuting,
}) => {
  const [showPlanDetails, setShowPlanDetails] = React.useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Step-by-Step Agent Execution Workflow</h3>
        </div>
        {runId && (
          <div className="text-xs text-slate-500 font-mono">
            Run ID: <span className="font-semibold text-slate-800">{runId}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {[
          { num: 1, label: '1. Understand', desc: 'Parse budget & deadline' },
          { num: 2, label: '2. Plan', desc: '8-step strategy' },
          { num: 3, label: '3. Retrieve', desc: 'Mock store evidence' },
          { num: 4, label: '4. Decision Rules', desc: 'Deterministic filter' },
          { num: 5, label: '5. Shortlist', desc: 'Rank & rationale' },
        ].map((s) => {
          const stepData = steps.find((item) => item.stepNumber === s.num);
          const isDone = stepData?.status === 'completed';
          const isRunning = stepData?.status === 'running' || (isExecuting && !stepData && s.num === 1);

          return (
            <div
              key={s.num}
              className={`p-3 rounded-lg border transition-all ${
                isDone
                  ? 'bg-slate-50 border-slate-200 text-slate-900'
                  : isRunning
                  ? 'bg-cyan-50/60 border-cyan-300 text-cyan-900 ring-1 ring-cyan-200'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">{s.label}</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isRunning ? (
                  <Clock className="w-4 h-4 text-cyan-600 animate-spin" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300" />
                )}
              </div>
              <p className="text-[11px] leading-tight text-slate-500 truncate">
                {stepData?.summary || s.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Plan Accordion toggle */}
      {plan && plan.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowPlanDetails(!showPlanDetails)}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 focus:outline-none"
          >
            <span>View 8-Step Deterministic Execution Plan</span>
            {showPlanDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showPlanDetails && (
            <ol className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
              {plan.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-cyan-700 font-bold shrink-0">
                    {idx + 1}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
};
