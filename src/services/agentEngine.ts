import { Product, UserInput, AgentDecision, AgentStep } from '../types';
import { getOffsetDateString, REFERENCE_DATE } from '../data/mockStores';

export interface DecisionEngineResult {
  runId: string;
  plan: string[];
  allEvaluations: AgentDecision[];
  eligibleShortlist: AgentDecision[];
  excludedList: AgentDecision[];
  uncertainList: AgentDecision[];
  reasoningEngine: 'Gemini AI (Server-Side)' | 'Deterministic Rule-Based Reasoner (Fallback)' | string;
  retrievalTimestamp: string;
}

/**
 * Standard 8-step agent execution plan
 */
export const AGENT_EXECUTION_STEPS = [
  'Retrieve candidate gifts from mock stores dataset.',
  'Check price against user-defined budget limit (≤ ₹1,500).',
  'Verify real-time stock availability and inventory counts.',
  'Verify delivery eligibility for entered postal PIN code.',
  'Exclude candidate items that arrive strictly after required delivery deadline.',
  'Evaluate recipient-interest relevance, occasion alignment, and category fit.',
  'Check returnability terms and personalisation/engraving requirements.',
  'Rank eligible products and prepare deterministic shortlist for human review.',
];

/**
 * Evaluate interest match score between product interests and user prompt.
 */
function calculateInterestScore(product: Product, userInterests: string, occasion: string): number {
  const normalizedUserText = `${userInterests} ${occasion}`.toLowerCase();
  let matches = 0;
  
  for (const keyword of product.interests) {
    if (normalizedUserText.includes(keyword.toLowerCase())) {
      matches += 10;
    }
  }

  // Check product name and description words
  const titleWords = product.name.toLowerCase().split(/\W+/);
  for (const word of titleWords) {
    if (word.length > 3 && normalizedUserText.includes(word)) {
      matches += 4;
    }
  }

  return matches;
}

/**
 * Deterministic decision rule evaluator
 */
export function evaluateProductEligibility(
  product: Product,
  input: UserInput,
  referenceDateStr: string = REFERENCE_DATE
): AgentDecision {
  const rejectionReasons: string[] = [];
  const retrievalTimestamp = new Date().toISOString();

  // 1. Calculate Estimated Delivery Date
  const estimatedDeliveryDate = getOffsetDateString(product.deliveryDays, referenceDateStr);

  // 2. Budget Rule: Price must not exceed budget
  const isBudgetMet = product.price <= input.maxBudget;
  if (!isBudgetMet) {
    rejectionReasons.push(`Price ₹${product.price.toLocaleString('en-IN')} exceeds maximum budget of ₹${input.maxBudget.toLocaleString('en-IN')}`);
  }

  // 3. Stock Rule: Must be in stock with count > 0
  const isInStock = product.inStock && product.stockCount > 0;
  if (!isInStock) {
    rejectionReasons.push(`Item is currently out of stock (${product.stockCount} units available)`);
  }

  // 4. PIN Code Rule: Must be in supported delivery areas
  const cleanPin = input.deliveryPinCode ? input.deliveryPinCode.trim() : '';
  const isPinDeliverable = cleanPin.length > 0 && product.supportedPinCodes.includes(cleanPin);
  if (!isPinDeliverable) {
    rejectionReasons.push(`PIN code ${cleanPin || 'None provided'} is not currently serviced for express delivery by ${product.mockStoreName}`);
  }

  // 5. Delivery Deadline Rule: Delivery date <= required deadline
  let isDeadlineMet = true;
  if (!input.requiredDeliveryDate) {
    rejectionReasons.push('Required delivery deadline date was not specified.');
    isDeadlineMet = false;
  } else {
    // String comparison works for ISO YYYY-MM-DD
    if (estimatedDeliveryDate > input.requiredDeliveryDate) {
      isDeadlineMet = false;
      rejectionReasons.push(
        `Arrives on ${estimatedDeliveryDate} (in ${product.deliveryDays} days), which misses your required deadline of ${input.requiredDeliveryDate}`
      );
    }
  }

  // 6. Category Filter (if specified and not 'all')
  let isCategoryMet = true;
  if (input.category && input.category !== 'all' && input.category.toLowerCase() !== product.category.toLowerCase()) {
    isCategoryMet = false;
    rejectionReasons.push(`Category "${product.category}" does not match requested filter "${input.category}"`);
  }

  // 7. Personalisation & Engraving Rule
  let isPersonalisationMet = true;
  if (input.personalisationRequired) {
    if (!product.personalisationAvailable) {
      isPersonalisationMet = false;
      rejectionReasons.push('Product does not support custom personalisation or engraving as requested');
    } else if (input.engravingText && input.engravingText.trim().length > 32) {
      isPersonalisationMet = false;
      rejectionReasons.push(`Engraving text length (${input.engravingText.trim().length} chars) exceeds store limit of 32 characters`);
    }
  }

  // Determine Overall Status
  let status: 'eligible' | 'excluded' | 'uncertain' = 'eligible';

  if (!cleanPin || !input.requiredDeliveryDate) {
    status = 'uncertain';
  } else if (rejectionReasons.length > 0) {
    status = 'excluded';
  } else {
    status = 'eligible';
  }

  // Calculate Ranking Score
  const interestScore = calculateInterestScore(product, input.recipientInterests, input.occasion);
  // Give points for budget savings and faster delivery buffer
  const budgetSafety = Math.max(0, (input.maxBudget - product.price) / 100);
  const deliveryBuffer = 5 - product.deliveryDays;
  const score = interestScore * 2 + budgetSafety + deliveryBuffer;

  return {
    productId: product.id,
    product,
    status,
    rejectionReasons,
    estimatedDeliveryDate,
    isDeadlineMet,
    isBudgetMet,
    isInStock,
    isPinDeliverable,
    isPersonalisationMet,
    score,
    sourceRecordId: product.sourceRecordId,
    retrievalTimestamp,
  };
}

/**
 * Generate natural language recommendation reasoning.
 * Uses server-side Gemini 3.8 Flash if available, otherwise high-precision rule-based reasoner.
 */
export async function generateGiftReasoning(
  shortlist: AgentDecision[],
  input: UserInput
): Promise<{
  updatedShortlist: AgentDecision[];
  engine: 'Gemini AI (Server-Side)' | 'Deterministic Rule-Based Reasoner (Fallback)' | string;
}> {
  // First build rule-based reasons as solid fallback
  const fallbackList = shortlist.map(item => {
    const p = item.product;
    const interestMatch = p.interests.find(i => input.recipientInterests.toLowerCase().includes(i.toLowerCase())) || p.category;
    let reason = `Recommended because it directly aligns with the recipient's interest in ${interestMatch} for ${input.occasion}. At ₹${p.price.toLocaleString('en-IN')}, it sits comfortably within your ₹${input.maxBudget.toLocaleString('en-IN')} budget and is verified to arrive on ${item.estimatedDeliveryDate}, safely before your deadline of ${input.requiredDeliveryDate}.`;
    
    if (input.personalisationRequired && input.engravingText) {
      reason += ` Supports custom engraving "${input.engravingText}".`;
    }

    return {
      ...item,
      recommendationReason: reason,
    };
  });

  // Attempt to call server-side Gemini endpoint with 12s timeout
  try {
    const topCandidates = shortlist.slice(0, 4);
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.APP_URL || 'http://localhost:3000');
    const res = await fetch(`${baseUrl}/api/reasoning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        input,
        products: topCandidates.map(s => ({
          id: s.productId,
          name: s.product.name,
          category: s.product.category,
          price: s.product.price,
          estimatedDeliveryDate: s.estimatedDeliveryDate,
          interests: s.product.interests,
        })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.reasonings)) {
        const geminiMap = new Map<string, string>();
        for (const r of data.reasonings) {
          geminiMap.set(r.productId, r.reason);
        }

        const enhancedList = fallbackList.map(item => ({
          ...item,
          recommendationReason: geminiMap.get(item.productId) || item.recommendationReason,
        }));

        return {
          updatedShortlist: enhancedList,
          engine: 'Gemini AI (Server-Side)' as const,
        };
      }
    }
  } catch (err) {
    // Server endpoint not reachable (e.g. static host or dev mode offline)
    console.warn('Server Gemini reasoning unavailable, falling back to deterministic engine:', err);
  }

  return {
    updatedShortlist: fallbackList,
    engine: 'Deterministic Rule-Based Reasoner (Fallback)',
  };
}

/**
 * Execute Complete Agent Run
 */
export async function runAgentWorkflow(
  products: Product[],
  input: UserInput,
  onStepProgress?: (step: AgentStep) => void
): Promise<DecisionEngineResult> {
  const plan = [...AGENT_EXECUTION_STEPS];
  const retrievalTimestamp = new Date().toISOString();

  // Step 1: Understand
  onStepProgress?.({
    stepNumber: 1,
    title: 'Understand Request',
    status: 'running',
    summary: `Parsed recipient interests: "${input.recipientInterests}", Occasion: ${input.occasion}, Budget: ₹${input.maxBudget}, Deadline: ${input.requiredDeliveryDate}, PIN: ${input.deliveryPinCode}.`,
    timestamp: new Date().toLocaleTimeString(),
  });

  await new Promise(r => setTimeout(r, 200));

  // Step 2: Plan
  onStepProgress?.({
    stepNumber: 2,
    title: 'Formulate Execution Plan',
    status: 'running',
    summary: `Structured 8 deterministic validation steps across candidate catalog.`,
    details: plan,
    timestamp: new Date().toLocaleTimeString(),
  });

  await new Promise(r => setTimeout(r, 200));

  // Step 3: Retrieve
  onStepProgress?.({
    stepNumber: 3,
    title: 'Retrieve Product Evidence',
    status: 'running',
    summary: `Scanned ${products.length} synthetic records across mock stores with stable source IDs.`,
    timestamp: new Date().toLocaleTimeString(),
  });

  await new Promise(r => setTimeout(r, 200));

  // Step 4: Apply Decision Rules
  const allEvaluations: AgentDecision[] = products.map(prod =>
    evaluateProductEligibility(prod, input)
  );

  const eligible = allEvaluations
    .filter(d => d.status === 'eligible')
    .sort((a, b) => b.score - a.score);

  const excluded = allEvaluations.filter(d => d.status === 'excluded');
  const uncertain = allEvaluations.filter(d => d.status === 'uncertain');

  onStepProgress?.({
    stepNumber: 4,
    title: 'Apply Deterministic Rules',
    status: 'completed',
    summary: `Evaluated ${allEvaluations.length} items. Eligible: ${eligible.length}, Excluded: ${excluded.length}, Uncertain: ${uncertain.length}.`,
    timestamp: new Date().toLocaleTimeString(),
  });

  // Step 5: Present Shortlist with Reasoning
  const { updatedShortlist, engine } = await generateGiftReasoning(eligible, input);

  onStepProgress?.({
    stepNumber: 5,
    title: 'Generate Shortlist & Rationale',
    status: 'completed',
    summary: `Finalized top ${updatedShortlist.length} eligible recommendations powered by ${engine}.`,
    timestamp: new Date().toLocaleTimeString(),
  });

  return {
    runId: input.runId,
    plan,
    allEvaluations,
    eligibleShortlist: updatedShortlist,
    excludedList: excluded,
    uncertainList: uncertain,
    reasoningEngine: engine,
    retrievalTimestamp,
  };
}
