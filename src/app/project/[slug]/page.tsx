import projects from "@/data/projects.json";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowUpRight, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export function generateStaticParams() {
  return projects.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ProjectPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const project = projects.find((p) => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="py-24 w-full relative min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <Link href="/#projects" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors mb-8 inline-block">
          ← Back to Projects
        </Link>
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium border-r border-slate-200 pr-4">
              <Calendar size={16} />
              <span>{project.date || "2024"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.pillars.map((p) => (
                <span key={p} className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100/50">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
            {project.description}
          </p>
        </div>

        <div className="space-y-6">
          {project.content ? (
            <GlassCard className="p-8 h-full min-h-[400px]">
              <div className="prose prose-lg prose-slate prose-a:text-indigo-600 prose-headings:text-slate-900 prose-headings:mt-0 prose-p:leading-relaxed prose-li:my-0 prose-ul:my-2 max-w-none">
                <ReactMarkdown>{project.content}</ReactMarkdown>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 h-full min-h-[400px] flex items-center justify-center bg-slate-100/50 border-dashed">
              <span className="text-slate-400 font-medium">Project Documentation Placeholder</span>
            </GlassCard>
          )}
        </div>

        {/* Mobile Links & Resources */}
        <div className="xl:hidden mt-12">
          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Links & Resources</h3>
            <div className="space-y-2">
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                  <div className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900">
                    <GithubIcon size={16} />
                    <span className="font-medium text-xs">Source Code</span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
                </a>
              )}
              {project.linkedin && (
                <a href={project.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                  <div className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900">
                    <LinkedinIcon size={16} />
                    <span className="font-medium text-xs">LinkedIn Post</span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
                </a>
              )}
              {project.video && (
                <a href={project.video} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                  <div className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span className="font-medium text-xs">Video Demo</span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
                </a>
              )}
              {project.live && (
                <a href={project.live} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                  <div className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900">
                    <ExternalLink size={16} />
                    <span className="font-medium text-xs">Live Demo</span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
                </a>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Desktop Links & Resources - Fixed Right */}
      <div className="hidden xl:block fixed top-32 right-8 2xl:right-24 w-64 z-10">
        <GlassCard className="p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Links & Resources</h3>
          <div className="space-y-2">
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                <div className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900">
                  <GithubIcon size={16} />
                  <span className="font-medium text-xs">Source Code</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
              </a>
            )}
            {project.linkedin && (
              <a href={project.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                <div className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900">
                  <LinkedinIcon size={16} />
                  <span className="font-medium text-xs">LinkedIn Post</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
              </a>
            )}
            {project.video && (
              <a href={project.video} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                <div className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span className="font-medium text-xs">Video Demo</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                <div className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900">
                  <ExternalLink size={16} />
                  <span className="font-medium text-xs">Live Demo</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
              </a>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
