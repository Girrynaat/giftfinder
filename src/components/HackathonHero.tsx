import React from 'react';
import { Sparkles, Calendar, Clock, ShieldCheck, Cpu } from 'lucide-react';
import { REFERENCE_DATE } from '../data/mockStores';

interface HackathonHeroProps {
  onLoadPreset: (presetId: 'TC1' | 'TC2' | 'TC3' | 'TC4') => void;
  activeEngine: string;
}

export const HackathonHero: React.FC<HackathonHeroProps> = ({
  onLoadPreset,
  activeEngine,
}) => {
  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white border-b border-slate-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            {/* Hackathon Header */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-300 font-medium mb-3">
              <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-2.5 py-0.5 rounded text-xs">
                Agentic AI Hackathon 2026
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-300">Powered by Ziro.Digital</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Demo Reference Date: {REFERENCE_DATE}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white text-balance leading-tight">
              Gift Finder with Delivery Deadline
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed text-balance">
              Autonomous gift shopping agent that finds thoughtful gifts under <strong className="text-white font-semibold">₹1,500</strong> tailored to recipient interests, verifies live stock &amp; PIN codes, strictly enforces arrival before your required deadline, and requires human approval before cart addition.
            </p>

            {/* Active Engine Badge */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400 font-normal">Active Reasoning Engine:</span>
                <span className="font-semibold text-cyan-300">{activeEngine}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400 font-normal">Eligibility Engine:</span>
                <span className="font-semibold text-emerald-300">Deterministic Rule Engine (LLM Overrides Prohibited)</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons for the 4 Official Test Cases */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 lg:w-80 shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Load Official Test Scenario
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onLoadPreset('TC1')}
                className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center justify-between border border-slate-600/60"
              >
                <span>TC1: Under Budget &amp; In-Time Book</span>
                <span className="text-emerald-400 font-mono text-[11px]">Pass</span>
              </button>
              <button
                onClick={() => onLoadPreset('TC2')}
                className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center justify-between border border-slate-600/60"
              >
                <span>TC2: Engraving "Happy Birthday, Anu"</span>
                <span className="text-cyan-400 font-mono text-[11px]">Exact</span>
              </button>
              <button
                onClick={() => onLoadPreset('TC3')}
                className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center justify-between border border-slate-600/60"
              >
                <span>TC3: Arrives After Date Exclusion</span>
                <span className="text-rose-400 font-mono text-[11px]">Exclude</span>
              </button>
              <button
                onClick={() => onLoadPreset('TC4')}
                className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center justify-between border border-slate-600/60"
              >
                <span>TC4: Personalised Non-Returnable</span>
                <span className="text-amber-400 font-mono text-[11px]">Disclose</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
