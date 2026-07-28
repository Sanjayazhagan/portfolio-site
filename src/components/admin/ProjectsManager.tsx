"use client";

import { useState } from "react";
import { saveProject, deleteProject } from "@/app/admin/actions";
import { GlassCard } from "@/components/ui/GlassCard";

export function ProjectsManager({ initialProjects, availablePillars }: { initialProjects: any[], availablePillars: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setFormData({
      ...project,
      pillars: typeof project.pillars === "string" ? JSON.parse(project.pillars) : (project.pillars || []),
      tags: typeof project.tags === "string" ? JSON.parse(project.tags) : (project.tags || [])
    });
  };
  
  const handleNew = () => {
    setEditingId("new");
    setFormData({ title: "", slug: "", description: "", date: new Date().toISOString().split('T')[0], pillars: [], tags: [], content: "", showcase: true });
  };
  
  const handleSave = async () => {
    await saveProject(formData);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deleteProject(id);
    }
  };

  const togglePillar = (pillarId: string) => {
    setFormData((prev: any) => {
      const current = prev.pillars || [];
      if (current.includes(pillarId)) {
        return { ...prev, pillars: current.filter((id: string) => id !== pillarId) };
      } else {
        return { ...prev, pillars: [...current, pillarId] };
      }
    });
  };

  if (editingId) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">{editingId === "new" ? "New Project" : "Edit Project"}</h3>
        <div className="space-y-4">
          <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Slug (e.g. my-cool-project)" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
          <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" type="date" placeholder="Date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          <textarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          
          <div className="space-y-2">
            <span className="text-slate-400 text-sm">Assign to Pillars:</span>
            <div className="flex flex-wrap gap-2">
              {availablePillars?.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePillar(p.id)}
                  className={`px-3 py-1 rounded text-sm ${formData.pillars?.includes(p.id) ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input 
              type="checkbox" 
              id="showcase" 
              checked={formData.showcase ?? true} 
              onChange={e => setFormData({...formData, showcase: e.target.checked})} 
              className="w-4 h-4 accent-cyan-500"
            />
            <label htmlFor="showcase" className="text-slate-300 font-medium">Showcase in Hero Section</label>
          </div>

          <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Tags (comma separated, e.g. React, Python, gRPC)" value={formData.tags?.join(", ")} onChange={e => setFormData({...formData, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="GitHub URL" value={formData.github || ""} onChange={e => setFormData({...formData, github: e.target.value})} />
            <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="LinkedIn URL" value={formData.linkedin || ""} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
            <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Video Demo URL" value={formData.video || ""} onChange={e => setFormData({...formData, video: e.target.value})} />
            <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Live Demo URL" value={formData.live || ""} onChange={e => setFormData({...formData, live: e.target.value})} />
            <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white md:col-span-2" placeholder="Kaggle URL" value={formData.kaggle || ""} onChange={e => setFormData({...formData, kaggle: e.target.value})} />
          </div>
          <textarea className="w-full h-40 bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-sm" placeholder="Markdown Content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
          <div className="flex gap-4">
            <button onClick={handleSave} className="bg-cyan-600 px-4 py-2 rounded text-white font-medium">Save</button>
            <button onClick={() => setEditingId(null)} className="bg-slate-700 px-4 py-2 rounded text-white">Cancel</button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Projects</h2>
        <button onClick={handleNew} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-full text-sm font-medium text-white transition-colors">Add Project</button>
      </div>
      {initialProjects.map(p => (
        <GlassCard key={p.id} className="p-4 flex flex-col md:flex-row md:justify-between md:items-center group gap-4 md:gap-0">
          <div>
            <h3 className="text-white font-bold flex items-center gap-2">
              {p.title}
              {p.showcase && <span className="text-[10px] bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800">Featured</span>}
            </h3>
            <p className="text-sm text-slate-400">{p.slug}</p>
          </div>
          <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleEdit(p)} className="text-cyan-400 hover:text-cyan-300 px-3 py-1 bg-cyan-900/30 rounded">Edit</button>
            <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-900/30 rounded">Delete</button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
