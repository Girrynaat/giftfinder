# Gift Finder with Delivery Deadline

**Agentic AI Hackathon 2026 – Powered by Ziro.Digital**  
*Industry: Commerce & Consumer AI*

Gift Finder with Delivery Deadline is an autonomous AI gift-shopping agent that finds gifts under **₹1,500** based on recipient interests and deterministically ensures that candidate items are in stock, serviced for the user's PIN code, and verified to arrive before their delivery deadline.

---

## 🌟 Key Features

1. **Step-by-Step Agent Workflow:**
   - **Step 1: Understand the Request** – Parses recipient interests, occasion, maximum budget (default ₹1,500), required delivery deadline, delivery PIN code, category, and customisation requirements.
   - **Step 2: Plan** – Formulates an 8-step deterministic execution strategy.
   - **Step 3: Retrieve Product Evidence** – Scans 18 realistic synthetic products with stable product IDs (`PROD-BK-101`, `PROD-PERS-201`, etc.) and fresh source record IDs.
   - **Step 4: Apply Deterministic Decision Rules** – Strict rule enforcement:
     - Price must not exceed budget cap.
     - Product must be in stock (> 0 inventory).
     - PIN code must be serviced.
     - Delivery date must be on or before deadline.
     - Returnability and personalisation must be checked.
     - *No LLM is permitted to override these rules.*
   - **Step 5: Present Shortlist with Rationale** – Shows eligible products, excluded items with clear rejection reasons, and transparent evidence freshness timestamps.

2. **Mandatory Human-in-the-Loop Approval:**
   - The agent is **strictly prohibited** from adding items to the mock cart autonomously.
   - Requires explicit human review in a safety modal.
   - Displays exact readback of custom engraving text (e.g. `"Happy Birthday, Anu"`) and requires confirmation.
   - Displays prominent non-returnable policy disclosures before approval.
   - Built-in duplicate action prevention prevents re-adding the same approved item for a run.

3. **Independent Post-Cart Verification:**
   - After human approval, a separate verification engine checks the live mock-store state against the intended action.
   - Verifies: Live stock availability, logistics deadline compliance, budget cap adherence, and return policy disclosure.
   - Generates an audit matrix comparing **Intended Action State** vs **Actual Observed State** (`Verified` / `Failed`).

4. **Dedicated Official Test Cases Suite (4/4):**
   - **TC1: Under budget, arrives in time** – Shortlists in-stock book under ₹1,500 that delivers before deadline.
   - **TC2: Engraving text** – Verbatim preservation and readback of `"Happy Birthday, Anu"`.
   - **TC3: Arrives after date** – Deterministic exclusion of candidate that arrives past deadline.
   - **TC4: Personalised item non-returnable** – Mandatory prominent disclosure of final-sale terms.
   - 1-click **"Run All 4 Official Test Cases"** button with automated verification.

5. **Dual-Mode AI Reasoning (Zero Paid Key Dependency):**
   - Uses server-side **Google Gemini 3.8 Flash** via `@google/genai` when `GEMINI_API_KEY` is present.
   - Transparently falls back to a deterministic rule-based NLP reasoner when no key is provided, enabling 100% offline and free-tier hosting on Vercel without paid APIs.

6. **Immutable Audit Trail & Evidence Ledger:**
   - Saves run IDs, inputs, decisions, approvals, and verification results in browser `localStorage`.
   - 1-click export of the complete audit log to formatted `.json`.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- npm or bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
If you wish to use Gemini 3.8 Flash for enhanced natural-language rationale:
```bash
cp .env.example .env
# Edit .env and set GEMINI_API_KEY="your-gemini-api-key"
```
*Note: If no API key is provided, the application automatically uses the built-in deterministic reasoner with full functionality.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 Deploying to Vercel (Public HTTPS URL)

This project is built to deploy seamlessly to Vercel as a static single-page application with zero configuration:

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Agentic AI Hackathon 2026 - Gift Finder"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/gift-finder-deadline.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New Project"** and import your GitHub repository.
   - Vercel automatically detects the **Vite** framework preset:
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`
   - *(Optional)* Add `GEMINI_API_KEY` in **Settings > Environment Variables** if you wish to use server-side Gemini.
   - Click **Deploy**.

Within 30 seconds, your application will be live at `https://<your-project>.vercel.app` with a secure HTTPS URL.

---

## 🧪 Testing the 4 Official Test Cases

Navigate to the **"Official Test Cases"** tab in the top navigation:
1. Click **"Run All 4 Official Test Cases"** to run all 4 benchmarks sequentially.
2. Or click **"Run Test TC1"**, **"Run Test TC2"**, **"Run Test TC3"**, or **"Run Test TC4"** individually.
3. Observe the pass/fail matrix, supporting product evidence IDs, and actual vs expected outcomes.

---

## 🛡️ Hackathon Verification & Integrity

- **Synthetic Mock Store Data:** 18 curated synthetic items across Books, Mugs, Personalised gifts, Desk accessories, Home décor, Accessories, Hobby gifts, and Gift sets.
- **No Hallucinated Orders:** Simulated mock cart clearly marked as simulation.
- **No Paid Tooling Needed:** Works without n8n, LangGraph, or paid databases.
