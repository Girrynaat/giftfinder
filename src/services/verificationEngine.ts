import { CartItem, Product, UserInput, VerificationResult, VerificationCheck } from '../types';
import { getOffsetDateString, REFERENCE_DATE } from '../data/mockStores';

/**
 * Runs independent post-approval verification against live mock store records.
 */
export function runIndependentVerification(
  cartItem: CartItem,
  userInput: UserInput,
  mockProducts: Product[],
  referenceDateStr: string = REFERENCE_DATE
): VerificationResult {
  const currentMockProduct = mockProducts.find(p => p.id === cartItem.productId);
  const nowTimestamp = new Date().toISOString();

  if (!currentMockProduct) {
    const failedCheck: VerificationCheck = {
      passed: false,
      label: 'Catalog Existence',
      intended: cartItem.productId,
      observed: 'Item Not Found in Store Records',
      message: 'Product could not be resolved in the store database during post-cart verification.',
    };

    return {
      id: `VR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      cartItemId: cartItem.id,
      productId: cartItem.productId,
      runId: cartItem.runId,
      timestamp: nowTimestamp,
      overallStatus: 'Failed',
      stockCheck: failedCheck,
      deliveryCheck: failedCheck,
      priceCheck: failedCheck,
      returnPolicyCheck: failedCheck,
      diagnosticNotes: `CRITICAL: Product ${cartItem.productId} was not found in mock store inventory.`,
    };
  }

  // 1. Stock Check
  const stockPassed = currentMockProduct.inStock && currentMockProduct.stockCount > 0;
  const stockCheck: VerificationCheck = {
    passed: stockPassed,
    label: 'Inventory Availability',
    intended: 'In Stock (> 0 units)',
    observed: `${currentMockProduct.stockCount} units (${currentMockProduct.inStock ? 'Available' : 'Depleted'})`,
    message: stockPassed
      ? `Verified: Sufficient stock (${currentMockProduct.stockCount} units remaining) confirmed at ${currentMockProduct.mockStoreName}.`
      : `Failed: Product has run out of stock or inventory count is 0.`,
  };

  // 2. Delivery Date Check
  const freshDeliveryEstimate = getOffsetDateString(currentMockProduct.deliveryDays, referenceDateStr);
  const deliveryPassed = freshDeliveryEstimate <= userInput.requiredDeliveryDate;
  const deliveryCheck: VerificationCheck = {
    passed: deliveryPassed,
    label: 'Deadline Compliance',
    intended: `Arrive on or before ${userInput.requiredDeliveryDate}`,
    observed: freshDeliveryEstimate,
    message: deliveryPassed
      ? `Verified: Arrives on ${freshDeliveryEstimate} (${currentMockProduct.deliveryDays} transit days), safely meeting deadline of ${userInput.requiredDeliveryDate}.`
      : `Failed: Latest logistics estimate is ${freshDeliveryEstimate}, which exceeds the required deadline of ${userInput.requiredDeliveryDate}.`,
  };

  // 3. Price Check
  const pricePassed = currentMockProduct.price <= userInput.maxBudget;
  const priceCheck: VerificationCheck = {
    passed: pricePassed,
    label: 'Budget Ceiling',
    intended: `≤ ₹${userInput.maxBudget.toLocaleString('en-IN')}`,
    observed: `₹${currentMockProduct.price.toLocaleString('en-IN')}`,
    message: pricePassed
      ? `Verified: Price ₹${currentMockProduct.price.toLocaleString('en-IN')} remains strictly within the ₹${userInput.maxBudget.toLocaleString('en-IN')} budget cap.`
      : `Failed: Price ₹${currentMockProduct.price.toLocaleString('en-IN')} exceeds the user budget cap of ₹${userInput.maxBudget.toLocaleString('en-IN')}.`,
  };

  // 4. Return Policy Disclosure Check
  const hasPolicyText = !!currentMockProduct.returnPolicy && currentMockProduct.returnPolicy.length > 5;
  // If item is non-returnable, it must have been disclosed as non-returnable
  const policyDisclosed = hasPolicyText && (!currentMockProduct.isReturnable ? !cartItem.isReturnable : true);
  const returnPolicyCheck: VerificationCheck = {
    passed: policyDisclosed,
    label: 'Return Policy Disclosure',
    intended: currentMockProduct.isReturnable ? 'Returnable' : 'Non-Returnable Disclosed',
    observed: currentMockProduct.returnPolicy,
    message: policyDisclosed
      ? `Verified: Store policy correctly disclosed: "${currentMockProduct.returnPolicy}" (${currentMockProduct.isReturnable ? 'Eligible for return' : 'Final Sale / Non-Returnable'}).`
      : `Failed: Return policy disclosure mismatch or ambiguous terms.`,
  };

  // Determine Overall Status
  let overallStatus: 'Verified' | 'Failed' | 'Pending' | 'Needs manual review' = 'Verified';
  const notes: string[] = [];

  if (!stockPassed || !deliveryPassed || !pricePassed || !policyDisclosed) {
    overallStatus = 'Failed';
    if (!stockPassed) notes.push('Stock check failed');
    if (!deliveryPassed) notes.push('Delivery deadline check failed');
    if (!pricePassed) notes.push('Price exceeded budget');
    if (!policyDisclosed) notes.push('Return policy not properly disclosed');
  } else if (!currentMockProduct.isReturnable) {
    // Non-returnable items are verified but with explicit advisory note
    notes.push('Verified with customer advisory: Customised non-returnable item terms confirmed');
  }

  return {
    id: `VR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    cartItemId: cartItem.id,
    productId: cartItem.productId,
    runId: cartItem.runId,
    timestamp: nowTimestamp,
    overallStatus,
    stockCheck,
    deliveryCheck,
    priceCheck,
    returnPolicyCheck,
    diagnosticNotes: notes.length > 0 ? notes.join('; ') : 'All 4 verification checks passed deterministically.',
  };
}
