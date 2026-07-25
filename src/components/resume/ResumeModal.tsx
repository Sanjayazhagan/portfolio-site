"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Download, FileWarning } from "lucide-react";
import { usePostHog } from "posthog-js/react";

interface ResumeData {
  name: string;
  email: string;
  summary: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    period: string;
    bullets: string[];
  }[];
  projects: {
    title: string;
    bullets: string[];
    links?: { github?: string | null; live?: string | null; kaggle?: string | null };
  }[];
}

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div
      className="bg-white text-black p-8 md:p-12 font-serif text-[11pt] leading-relaxed"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold tracking-wide uppercase mb-1">{data.name}</h1>
        <div className="text-sm text-gray-700 flex items-center justify-center gap-1 flex-wrap">
          <span>{data.email}</span>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-400 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-[10.5pt] text-gray-800">{data.summary}</p>
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-400 pb-1 mb-2">
            Technical Skills
          </h2>
          <p className="text-[10.5pt] text-gray-800">{data.skills.join(" • ")}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-400 pb-1 mb-3">
            Experience
          </h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-[11pt]">{exp.role}</h3>
                <span className="text-[9.5pt] text-gray-600 italic whitespace-nowrap ml-4">{exp.period}</span>
              </div>
              <p className="text-[10pt] text-gray-600 italic">{exp.company}</p>
              <ul className="list-disc ml-5 mt-1 space-y-0.5">
                {exp.bullets.map((b, j) => (
                  <li key={j} className="text-[10.5pt] text-gray-800">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-400 pb-1 mb-3">
            Projects
          </h2>
          {data.projects.map((proj, i) => {
            const linkEntries = proj.links
              ? Object.entries(proj.links).filter(([, v]) => v)
              : [];
            return (
              <div key={i} className="mb-3">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="font-bold text-[11pt]">{proj.title}</h3>
                  {linkEntries.map(([label, url]) => (
                    <a key={label} href={url!} className="text-[9pt] text-blue-700 underline">
                      [{label}]
                    </a>
                  ))}
                </div>
                <ul className="list-disc ml-5 mt-1 space-y-0.5">
                  {proj.bullets.map((b, j) => (
                    <li key={j} className="text-[10.5pt] text-gray-800">{b}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

export function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const posthog = usePostHog();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
      setJobDescription("");
      setResumeData(null);
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

      setResumeData(data.resume);
      setStatus("success");
      posthog?.capture("resume_generate_success");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setStatus("error");
      posthog?.capture("resume_generate_error", { error: err.message });
    }
  };

  const handleDownloadPDF = () => {
    if (!resumeData) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Build project links dynamically
    const buildProjectLinks = (links?: { github?: string | null; live?: string | null; kaggle?: string | null }) => {
      if (!links) return "";
      return Object.entries(links)
        .filter(([, v]) => v)
        .map(([label, url]) => `<a class="project-link" href="${url}">[${label}]</a>`)
        .join(" ");
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${resumeData.name} - Resume</title>
        <style>
          @page { margin: 0.5in; size: letter; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 11pt; line-height: 1.45; color: #1a1a1a; }
          .header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #000; padding-bottom: 12px; }
          .header h1 { font-size: 20pt; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
          .header .contact { font-size: 9.5pt; color: #444; }
          .header .contact a { color: #1a4a8a; text-decoration: underline; }
          section { margin-bottom: 14px; }
          section h2 { font-size: 10pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #999; padding-bottom: 3px; margin-bottom: 8px; }
          .entry { margin-bottom: 10px; }
          .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
          .entry-header h3 { font-size: 11pt; font-weight: bold; }
          .entry-header .period { font-size: 9.5pt; color: #555; font-style: italic; white-space: nowrap; margin-left: 12px; }
          .entry .company { font-size: 10pt; color: #555; font-style: italic; }
          .project-link { font-size: 9pt; color: #1a4a8a; text-decoration: underline; margin-left: 6px; }
          ul { list-style-type: disc; margin-left: 20px; margin-top: 4px; }
          ul li { font-size: 10.5pt; color: #2a2a2a; margin-bottom: 2px; }
          .skills p, .summary p { font-size: 10.5pt; color: #2a2a2a; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${resumeData.name}</h1>
          <div class="contact">${resumeData.email}</div>
        </div>

        ${resumeData.summary ? `
        <section class="summary">
          <h2>Professional Summary</h2>
          <p>${resumeData.summary}</p>
        </section>` : ""}

        ${resumeData.skills?.length ? `
        <section class="skills">
          <h2>Technical Skills</h2>
          <p>${resumeData.skills.join(" &bull; ")}</p>
        </section>` : ""}

        ${resumeData.experience?.length ? `
        <section>
          <h2>Experience</h2>
          ${resumeData.experience.map((exp) => `
            <div class="entry">
              <div class="entry-header">
                <h3>${exp.role}</h3>
                <span class="period">${exp.period}</span>
              </div>
              <div class="company">${exp.company}</div>
              <ul>${exp.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
            </div>
          `).join("")}
        </section>` : ""}

        ${resumeData.projects?.length ? `
        <section>
          <h2>Projects</h2>
          ${resumeData.projects.map((proj) => `
            <div class="entry">
              <div class="entry-header">
                <h3>${proj.title} ${buildProjectLinks(proj.links)}</h3>
              </div>
              <ul>${proj.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
            </div>
          `).join("")}
        </section>` : ""}
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
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
          className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-900/30 text-cyan-400 rounded-lg border border-cyan-900/50">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white">AI Resume Builder</h2>
                <p className="text-xs md:text-sm text-slate-400">Tailored ATS-friendly resume in seconds.</p>
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
          <div className="p-5 md:p-6 overflow-y-auto flex-1">
            {status === "idle" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">
                  What do you want to hire me for?
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste a job description or describe the role you are hiring for..."
                  className="w-full h-40 bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none text-sm"
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
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 size={40} className="text-cyan-400 animate-spin" />
                <h3 className="text-lg font-bold text-white">Crafting Your Resume...</h3>
                <p className="text-slate-400 max-w-sm text-sm">
                  Analyzing the job description, selecting the most relevant projects and experience, and tailoring everything to match. This takes about 15-30 seconds.
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

            {status === "success" && resumeData && (
              <div className="space-y-4">
                <div
                  ref={printRef}
                  className="rounded-xl overflow-hidden border border-slate-700 shadow-lg max-h-[55vh] overflow-y-auto"
                >
                  <ResumePreview data={resumeData} />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download as PDF
                  </button>
                  <button
                    onClick={() => setStatus("idle")}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Redo
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
