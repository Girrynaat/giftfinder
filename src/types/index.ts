export type ProductCategory =
  | 'Books'
  | 'Personalised gifts'
  | 'Desk accessories'
  | 'Mugs'
  | 'Home décor'
  | 'Accessories'
  | 'Hobby-related gifts'
  | 'Gift sets';

export type ProductEligibilityStatus = 'eligible' | 'excluded' | 'uncertain';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  interests: string[];
  price: number; // in INR
  inStock: boolean;
  stockCount: number;
  deliveryDays: number; // Standard transit days from reference date
  supportedPinCodes: string[]; // e.g. ['560001', '110001', ...]
  returnPolicy: string;
  isReturnable: boolean;
  personalisationAvailable: boolean;
  customisationRequirements?: string;
  mockStoreName: string;
  sourceRecordId: string;
  mockProductUrl: string;
  lastUpdated: string;
  imageUrl?: string;
}

export interface UserInput {
  runId: string;
  recipientInterests: string;
  occasion: string;
  maxBudget: number; // Default ₹1,500
  requiredDeliveryDate: string; // YYYY-MM-DD
  deliveryPinCode: string;
  category?: string;
  personalisationRequired: boolean;
  engravingText?: string;
}

export interface AgentStep {
  stepNumber: number;
  title: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  summary: string;
  details?: string[];
  timestamp?: string;
}

export interface AgentDecision {
  productId: string;
  product: Product;
  status: ProductEligibilityStatus;
  rejectionReasons: string[];
  recommendationReason?: string;
  estimatedDeliveryDate: string;
  isDeadlineMet: boolean;
  isBudgetMet: boolean;
  isInStock: boolean;
  isPinDeliverable: boolean;
  isPersonalisationMet: boolean;
  score: number;
  sourceRecordId: string;
  retrievalTimestamp: string;
}

export interface CartItem {
  id: string; // Unique cart item ID
  runId: string;
  productId: string;
  productName: string;
  category: string;
  price: number;
  expectedDeliveryDate: string;
  returnPolicy: string;
  isReturnable: boolean;
  engravingText?: string;
  approvedAt: string;
  approvalStatus: 'approved';
  mockStoreName: string;
  sourceRecordId: string;
}

export interface VerificationCheck {
  passed: boolean;
  label: string;
  intended: string | number | boolean;
  observed: string | number | boolean;
  message: string;
}

export interface VerificationResult {
  id: string;
  cartItemId: string;
  productId: string;
  runId: string;
  timestamp: string;
  overallStatus: 'Verified' | 'Failed' | 'Pending' | 'Needs manual review';
  stockCheck: VerificationCheck;
  deliveryCheck: VerificationCheck;
  priceCheck: VerificationCheck;
  returnPolicyCheck: VerificationCheck;
  diagnosticNotes: string;
}

export interface AuditRecord {
  runId: string;
  timestamp: string;
  input: UserInput;
  plan: string[];
  candidatesRetrieved: number;
  shortlistCount: number;
  excludedCount: number;
  decisions: AgentDecision[];
  cartActions: CartItem[];
  verificationResults: VerificationResult[];
  reasoningEngine: 'Gemini AI (Server-Side)' | 'Deterministic Rule-Based Reasoner (Fallback)' | string;
}

export interface TestCase {
  id: string;
  title: string;
  badge: string;
  objective: string;
  input: UserInput;
  expectedOutcome: string;
  explanationText: string;
}

export interface TestCaseExecutionResult {
  testId: string;
  title: string;
  executedAt: string;
  passed: boolean;
  runId: string;
  expected: string;
  actual: string;
  explanation: string;
  supportingEvidenceId: string;
  productShortlist: AgentDecision[];
  approvalAction?: CartItem;
  verification?: VerificationResult;
}
