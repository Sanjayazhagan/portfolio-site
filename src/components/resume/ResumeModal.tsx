"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Download, FileText, FileWarning } from "lucide-react";
import { usePostHog } from "posthog-js/react";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const posthog = usePostHog();

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
      setJobDescription("");
      setPdfDataUri(null);
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    
    setStatus("loading");
    posthog?.capture("resume_generate_started");
    
    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate resume");
      }
      
      setPdfDataUri(data.pdfBase64);
      setStatus("success");
      posthog?.capture("resume_generate_success");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setStatus("error");
      posthog?.capture("resume_generate_error", { error: err.message });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-900/30 text-cyan-400 rounded-lg border border-cyan-900/50">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Resume Builder</h2>
                <p className="text-sm text-slate-400">Tailor a pristine ATS-friendly LaTeX resume instantly.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {status === "idle" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">
                  What do you want to hire me for?
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste a job description or describe the role you are hiring for..."
                  className="w-full h-40 bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
                <button
                  onClick={handleGenerate}
                  disabled={!jobDescription.trim()}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  Generate Tailored Resume
                </button>
              </div>
            )}

            {status === "loading" && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 size={40} className="text-cyan-400 animate-spin" />
                <h3 className="text-lg font-bold text-white">Drafting Resume...</h3>
                <p className="text-slate-400 max-w-sm text-sm">
                  Analyzing your job description, retrieving portfolio data, drafting ATS-friendly LaTeX, and compiling to PDF. This usually takes about 10-20 seconds.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-red-900/20 text-red-400 rounded-full">
                  <FileWarning size={40} />
                </div>
                <h3 className="text-lg font-bold text-white">Generation Failed</h3>
                <p className="text-red-400/80 max-w-sm text-sm">{errorMessage}</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-full transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {status === "success" && pdfDataUri && (
              <div className="flex flex-col h-[60vh] min-h-[400px]">
                <div className="flex-1 rounded-xl overflow-hidden border border-slate-700 bg-white mb-4 relative">
                  <iframe 
                    src={pdfDataUri} 
                    className="w-full h-full absolute inset-0 border-none"
                    title="Generated Resume PDF"
                  />
                </div>
                <div className="flex gap-4">
                  <a
                    href={pdfDataUri}
                    download="Sanjay_Azhagan_Resume.pdf"
                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download PDF
                  </a>
                  <button
                    onClick={() => setStatus("idle")}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
