import React from 'react';
import { ShoppingBag, Sparkles, CheckCircle2, ShieldCheck, Database, FileText } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'testcases' | 'stores' | 'cart' | 'audit';
  setActiveTab: (tab: 'studio' | 'testcases' | 'stores' | 'cart' | 'audit') => void;
  cartCount: number;
  openCartDrawer: () => void;
  onOpenDeployModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  openCartDrawer,
  onOpenDeployModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('studio')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                  GiftSync AI
                </span>
                <span className="text-xs text-slate-500 block leading-tight">
                  Agentic Gift Shopping Assistant
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-line controls) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('studio')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'studio' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              Agent Studio
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'testcases' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Official Test Cases
              <span className="text-xs text-slate-500 font-normal">· 4 Tests</span>
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'stores' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              <Database className="w-4 h-4 text-slate-500" />
              Mock Stores
              <span className="text-xs text-slate-500 font-normal">· 18 Items</span>
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'cart' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              Cart & Verification
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'audit' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              <FileText className="w-4 h-4 text-slate-500" />
              Audit Trail
            </button>
          </nav>

          {/* Zone 3: Primary Action & Cart Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenDeployModal}
              className="hidden lg:inline-flex px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              Vercel Deployment Guide
            </button>
            <button
              onClick={openCartDrawer}
              className="relative p-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
              title="Open Mock Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="bg-slate-900 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs font-medium text-slate-600 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('studio')}
            className={`whitespace-nowrap px-2 py-1 ${activeTab === 'studio' ? 'text-slate-900 font-bold' : ''}`}
          >
            Studio
          </button>
          <button
            onClick={() => setActiveTab('testcases')}
            className={`whitespace-nowrap px-2 py-1 ${activeTab === 'testcases' ? 'text-slate-900 font-bold' : ''}`}
          >
            Test Cases (4)
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`whitespace-nowrap px-2 py-1 ${activeTab === 'stores' ? 'text-slate-900 font-bold' : ''}`}
          >
            Stores (18)
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`whitespace-nowrap px-2 py-1 ${activeTab === 'cart' ? 'text-slate-900 font-bold' : ''}`}
          >
            Cart ({cartCount})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`whitespace-nowrap px-2 py-1 ${activeTab === 'audit' ? 'text-slate-900 font-bold' : ''}`}
          >
            Audit Log
          </button>
        </div>
      </div>
    </header>
  );
};
