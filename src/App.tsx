import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HackathonHero } from './components/HackathonHero';
import { GiftSearchForm } from './components/GiftSearchForm';
import { AgentTimeline } from './components/AgentTimeline';
import { ProductShortlist } from './components/ProductShortlist';
import { HumanApprovalModal } from './components/HumanApprovalModal';
import { MockCartDrawer } from './components/MockCartDrawer';
import { IndependentVerificationView } from './components/IndependentVerificationView';
import { TestCasesView } from './components/TestCasesView';
import { MockStoresCatalog } from './components/MockStoresCatalog';
import { AuditTrailView } from './components/AuditTrailView';
import { VercelDeploymentModal } from './components/VercelDeploymentModal';

import {
  AgentDecision,
  AgentStep,
  AuditRecord,
  CartItem,
  TestCaseExecutionResult,
  UserInput,
  VerificationResult,
} from './types';
import { INITIAL_MOCK_PRODUCTS, getOffsetDateString } from './data/mockStores';
import { runAgentWorkflow } from './services/agentEngine';
import { runIndependentVerification } from './services/verificationEngine';
import { OFFICIAL_TEST_CASES, runSingleTestCase } from './services/testRunner';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'studio' | 'testcases' | 'stores' | 'cart' | 'audit'>('studio');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Form & Workflow Execution State
  const [userInput, setUserInput] = useState<UserInput>({
    runId: 'RUN-INIT-101',
    recipientInterests: 'Reading, Books, Fiction, Philosophy',
    occasion: 'Birthday',
    maxBudget: 1500,
    requiredDeliveryDate: getOffsetDateString(4),
    deliveryPinCode: '560001',
    category: 'all',
    personalisationRequired: false,
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [plan, setPlan] = useState<string[]>([]);
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [activeEngine, setActiveEngine] = useState<string>('Deterministic Rule-Based Reasoner');

  // Approval Modal State
  const [selectedDecisionForApproval, setSelectedDecisionForApproval] = useState<AgentDecision | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Persistence State (Loaded from localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gift_finder_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [verifications, setVerifications] = useState<VerificationResult[]>(() => {
    try {
      const saved = localStorage.getItem('gift_finder_verifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(() => {
    try {
      const saved = localStorage.getItem('gift_finder_audits');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [testResults, setTestResults] = useState<Record<string, TestCaseExecutionResult>>(() => {
    try {
      const saved = localStorage.getItem('gift_finder_test_results');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('gift_finder_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('gift_finder_verifications', JSON.stringify(verifications));
  }, [verifications]);

  useEffect(() => {
    localStorage.setItem('gift_finder_audits', JSON.stringify(auditRecords));
  }, [auditRecords]);

  useEffect(() => {
    localStorage.setItem('gift_finder_test_results', JSON.stringify(testResults));
  }, [testResults]);

  // Initial Check for Server-Side Gemini capability
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data?.geminiConfigured) {
          setActiveEngine('Gemini 3.8 Flash (Server-Side)');
        } else {
          setActiveEngine('Deterministic Rule-Based Reasoner (Zero-Key Mode)');
        }
      })
      .catch(() => {
        setActiveEngine('Deterministic Rule-Based Reasoner (Zero-Key Mode)');
      });

    // Run initial search on mount to populate shortlist immediately
    handleRunAgent(userInput);
  }, []);

  // Execute Agent Workflow
  const handleRunAgent = async (inputToRun: UserInput) => {
    setUserInput(inputToRun);
    setIsExecuting(true);
    setSteps([]);

    try {
      const result = await runAgentWorkflow(INITIAL_MOCK_PRODUCTS, inputToRun, (step) => {
        setSteps((prev) => {
          const filtered = prev.filter((s) => s.stepNumber !== step.stepNumber);
          return [...filtered, step].sort((a, b) => a.stepNumber - b.stepNumber);
        });
      });

      setPlan(result.plan);
      setDecisions(result.allEvaluations);
      setActiveEngine(result.reasoningEngine);

      // Record in Audit Trail
      const newAudit: AuditRecord = {
        runId: result.runId,
        timestamp: new Date().toISOString(),
        input: inputToRun,
        plan: result.plan,
        candidatesRetrieved: INITIAL_MOCK_PRODUCTS.length,
        shortlistCount: result.eligibleShortlist.length,
        excludedCount: result.excludedList.length,
        decisions: result.allEvaluations,
        cartActions: [],
        verificationResults: [],
        reasoningEngine: result.reasoningEngine,
      };

      setAuditRecords((prev) => [newAudit, ...prev.slice(0, 19)]); // Keep last 20 runs
    } catch (err) {
      console.error('Agent workflow execution failed:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Preset Loader for the 4 Official Test Cases
  const handleLoadPreset = (presetId: 'TC1' | 'TC2' | 'TC3' | 'TC4') => {
    const foundTestCase = OFFICIAL_TEST_CASES.find((tc) => tc.id === presetId);
    if (foundTestCase) {
      const input: UserInput = {
        ...foundTestCase.input,
        runId: `RUN-${presetId}-${Date.now().toString(36).toUpperCase()}`,
      };
      setUserInput(input);
      handleRunAgent(input);
      setActiveTab('studio');
      showNotification(`Loaded Official Scenario ${presetId}: ${foundTestCase.title}`);
    }
  };

  // Notification helper
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  // Handle Human Approval
  const handleConfirmApproval = (newCartItem: CartItem) => {
    // Duplicate-action prevention check: Ensure item isn't added twice for this run
    const isDuplicate = cartItems.some(
      (c) => c.productId === newCartItem.productId && c.runId === newCartItem.runId
    );
    if (isDuplicate) {
      showNotification(`Item ${newCartItem.productName} is already added for Run ID ${newCartItem.runId}`);
      return;
    }

    setCartItems((prev) => [newCartItem, ...prev]);

    // Automatically trigger Independent Verification against mock-store data
    const verification = runIndependentVerification(newCartItem, userInput, INITIAL_MOCK_PRODUCTS);
    setVerifications((prev) => [verification, ...prev]);

    // Update Audit Trail record with this cart action
    setAuditRecords((prev) =>
      prev.map((rec) => {
        if (rec.runId === newCartItem.runId) {
          return {
            ...rec,
            cartActions: [...rec.cartActions, newCartItem],
            verificationResults: [...rec.verificationResults, verification],
          };
        }
        return rec;
      })
    );

    showNotification(
      `✓ Human Approval Recorded! "${newCartItem.productName}" added to mock cart and independently verified.`
    );
  };

  // Explicit Independent Verification Trigger from Cart
  const handleRunExplicitVerification = (cartItem: CartItem) => {
    const freshVerification = runIndependentVerification(cartItem, userInput, INITIAL_MOCK_PRODUCTS);
    setVerifications((prev) => [
      freshVerification,
      ...prev.filter((v) => v.cartItemId !== cartItem.id),
    ]);
    showNotification(
      `Verification Complete for ${cartItem.productName}: Status is ${freshVerification.overallStatus}`
    );
  };

  // Remove item from cart
  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    setVerifications((prev) => prev.filter((v) => v.cartItemId !== cartItemId));
  };

  // Reset all synthetic demo data
  const handleResetAllData = () => {
    if (window.confirm('Reset all synthetic demo cart items, test results, and audit history?')) {
      localStorage.removeItem('gift_finder_cart');
      localStorage.removeItem('gift_finder_verifications');
      localStorage.removeItem('gift_finder_audits');
      localStorage.removeItem('gift_finder_test_results');
      setCartItems([]);
      setVerifications([]);
      setAuditRecords([]);
      setTestResults({});
      showNotification('Synthetic demo data and audit ledger successfully reset.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.length}
        openCartDrawer={() => setIsCartOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
      />

      {/* Hackathon Hero Banner with Preset Pickers */}
      <HackathonHero
        onLoadPreset={handleLoadPreset}
        activeEngine={activeEngine}
      />

      {/* Floating Status Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium leading-snug">{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tab Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: Agent Studio */}
        {activeTab === 'studio' && (
          <div className="space-y-8">
            {/* Input Configuration Form */}
            <GiftSearchForm
              initialInput={userInput}
              onSubmit={handleRunAgent}
              isLoading={isExecuting}
            />

            {/* Step-by-Step Agent Timeline */}
            <AgentTimeline
              steps={steps}
              plan={plan}
              runId={userInput.runId}
              isExecuting={isExecuting}
            />

            {/* Product Shortlist & Rejection Explanations */}
            <ProductShortlist
              decisions={decisions}
              userInput={userInput}
              onInitiateApproval={(dec) => setSelectedDecisionForApproval(dec)}
              alreadyApprovedProductIds={cartItems.map((c) => c.productId)}
            />
          </div>
        )}

        {/* TAB 2: Official Test Cases (4/4 Suite) */}
        {activeTab === 'testcases' && (
          <TestCasesView
            testResults={testResults}
            onSaveTestResult={(res) => {
              setTestResults((prev) => ({ ...prev, [res.testId]: res }));
              if (res.approvalAction) {
                setCartItems((prev) => {
                  const exists = prev.some((c) => c.id === res.approvalAction!.id);
                  return exists ? prev : [res.approvalAction!, ...prev];
                });
              }
              if (res.verification) {
                setVerifications((prev) => [res.verification!, ...prev]);
              }
            }}
          />
        )}

        {/* TAB 3: Mock Stores Catalog */}
        {activeTab === 'stores' && <MockStoresCatalog />}

        {/* TAB 4: Simulated Cart & Independent Verification Audit */}
        {activeTab === 'cart' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cart Items &amp; Independent Verification Status
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every cart addition requires prior human approval and undergoes immediate independent cross-checking against store records.
                </p>
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Cart Drawer ({cartItems.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <IndependentVerificationView
              verifications={verifications}
              onReverify={(cartItemId) => {
                const item = cartItems.find((c) => c.id === cartItemId);
                if (item) handleRunExplicitVerification(item);
              }}
            />
          </div>
        )}

        {/* TAB 5: Audit Trail & Evidence Ledger */}
        {activeTab === 'audit' && (
          <AuditTrailView
            auditRecords={auditRecords}
            testResults={testResults}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Human Approval Modal (Mandatory Human-in-the-Loop Gate) */}
      {selectedDecisionForApproval && (
        <HumanApprovalModal
          isOpen={!!selectedDecisionForApproval}
          decision={selectedDecisionForApproval}
          userInput={userInput}
          onClose={() => setSelectedDecisionForApproval(null)}
          onConfirmApproval={handleConfirmApproval}
          isAlreadyInCart={cartItems.some(
            (c) =>
              c.productId === selectedDecisionForApproval.productId &&
              c.runId === userInput.runId
          )}
        />
      )}

      {/* Simulated Mock Cart Drawer */}
      <MockCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onRunVerification={handleRunExplicitVerification}
        verifications={verifications}
        onNavigateToVerificationTab={() => setActiveTab('cart')}
      />

      {/* Vercel Deployment Instructions Modal */}
      <VercelDeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>GiftSync AI</strong> · Built for Agentic AI Hackathon 2026 – Powered by Ziro.Digital
          </div>
          <div className="flex items-center gap-3">
            <span>Deterministic Rule Verification</span>
            <span aria-hidden="true">·</span>
            <span>Zero Paid API Dependency</span>
            <span aria-hidden="true">·</span>
            <span>Vercel Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
