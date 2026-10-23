import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK if API key exists
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & Status endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Server-side natural language gift reasoning endpoint
app.post('/api/reasoning', async (req, res) => {
  const { input, products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'No products provided' });
  }

  // If Gemini API is not configured, reply cleanly so client uses deterministic NLP engine
  if (!aiClient) {
    return res.json({
      success: false,
      reason: 'GEMINI_API_KEY not configured on server',
      engine: 'Deterministic Rule-Based Reasoner',
    });
  }

  try {
    const candidates = products.slice(0, 4);

    const prompt = `You are a helpful commerce gift advisor for an Indian shopping platform.
Recipient Profile:
- Interests: ${input?.recipientInterests || 'General'}
- Occasion: ${input?.occasion || 'Special Occasion'}
- Maximum Budget: ₹${input?.maxBudget || 1500}
- Required Delivery Deadline: ${input?.requiredDeliveryDate || 'N/A'}
- Personalisation / Customisation: ${input?.personalisationRequired ? `Yes (${input?.engravingText || 'Personalised'})` : 'No'}

For each of the following products, write a concise 1-sentence recommendation reason highlighting why it matches the recipient's interests, price value in INR, and arrival before the deadline:
${JSON.stringify(candidates, null, 2)}

Respond ONLY with a JSON array:
[
  {
    "productId": "string",
    "reason": "string"
  }
]`;

    const generatePromise = aiClient.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout exceeded')), 10000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text || '';
    const reasonings = JSON.parse(text);

    return res.json({
      success: true,
      reasonings,
      engine: 'Gemini AI (Server-Side)',
    });
  } catch (error: any) {
    console.error('Gemini reasoning error:', error?.message || error);
    return res.json({
      success: false,
      error: error?.message || 'Gemini inference failed',
      engine: 'Deterministic Rule-Based Reasoner',
    });
  }
});

async function startServer() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(indexHtmlPath);

  if (process.env.NODE_ENV === 'production' && hasDist) {
    // Serve pre-built static bundle in production
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(indexHtmlPath);
    });
  } else {
    // Mount Vite dev server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gift Finder application server running on http://0.0.0.0:${PORT}`);
    console.log(`Gemini API configured: ${!!process.env.GEMINI_API_KEY}`);
  });
}

startServer();
