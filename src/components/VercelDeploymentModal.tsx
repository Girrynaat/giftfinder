import React from 'react';
import { X, ExternalLink, Check, Copy, Terminal, Globe, Rocket } from 'lucide-react';

interface VercelDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeploymentModal: React.FC<VercelDeploymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedStep, setCopiedStep] = React.useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Rocket className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold">Vercel &amp; GitHub Deployment Guide</h3>
              <p className="text-xs text-slate-300">Ready for instant public HTTPS deployment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-cyan-950">
            <strong>Zero-Dependency Portability:</strong> This application contains a client-side deterministic decision engine with 18 synthetic mock store records. It builds via standard <code className="font-mono bg-cyan-100 px-1 rounded">npm run build</code> into static assets with zero external paid APIs required, making it 100% compatible with Vercel's free tier.
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">Step 1: Export &amp; Push to GitHub</span>
                <button
                  onClick={() => copyToClipboard('git init && git add . && git commit -m "Initial commit" && git branch -M main && git remote add origin <YOUR_REPO_URL> && git push -u origin main', 1)}
                  className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
                >
                  {copiedStep === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStep === 1 ? 'Copied' : 'Copy Commands'}</span>
                </button>
              </div>
              <p className="text-slate-600 mb-2">Create a new repository on your GitHub account, then run:</p>
              <pre className="bg-slate-900 text-slate-200 p-2.5 rounded font-mono text-[11px] overflow-x-auto">
{`git init
git add .
git commit -m "Agentic AI Hackathon 2026 - Gift Finder"
git branch -M main
git remote add origin https://github.com/<YOUR_USER>/gift-finder-hackathon.git
git push -u origin main`}
              </pre>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 text-sm block mb-1">Step 2: Import into Vercel</span>
              <p className="text-slate-600 mb-2 leading-relaxed">
                Log into <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-cyan-700 underline font-semibold">vercel.com</a>, click <strong>"Add New Project"</strong>, and import your GitHub repository.
              </p>
              <div className="bg-white p-2.5 border border-slate-200 rounded font-mono text-[11px] space-y-1 text-slate-700">
                <div>Framework Preset: <strong>Vite</strong></div>
                <div>Build Command: <code className="bg-slate-100 px-1 py-0.5 rounded">npm run build</code></div>
                <div>Output Directory: <code className="bg-slate-100 px-1 py-0.5 rounded">dist</code></div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 text-sm block mb-1">Step 3: Environment Variables (Optional)</span>
              <p className="text-slate-600 leading-relaxed">
                If you have a Gemini API key for enhanced reasoning, add <code className="font-mono bg-slate-200 px-1 rounded">GEMINI_API_KEY</code> in the Vercel Project Settings &gt; Environment Variables.
                If left unset, the application automatically uses the built-in deterministic reasoning engine with zero errors.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 text-sm block mb-1">Step 4: Deploy &amp; Submit</span>
              <p className="text-slate-600 leading-relaxed">
                Click <strong>"Deploy"</strong>. In ~30 seconds, Vercel will provide your public HTTPS URL (e.g., <code className="font-mono text-cyan-800">https://gift-finder-hackathon.vercel.app</code>) ready for hackathon evaluation!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
