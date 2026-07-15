"use client";

import { useState } from "react";
import { saveLog, deleteLog } from "@/app/admin/actions";
import { GlassCard } from "@/components/ui/GlassCard";

export function LogsManager({ initialLogs, availablePillars }: { initialLogs: any[], availablePillars: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  const handleEdit = (log: any) => {
    setEditingId(log.id);
    setFormData({
      ...log,
      pillars: typeof log.pillars === "string" ? JSON.parse(log.pillars) : (log.pillars || []),
    });
  };
  
  const handleNew = () => {
    setEditingId("new");
    setFormData({ title: "", date: new Date().toISOString().split('T')[0], type: "Learning", content: "", pillars: [], link: "", github: "", linkedin: "", live: "", kaggle: "" });
  };
  
  const handleSave = async () => {
    await saveLog(formData);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deleteLog(id);
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
        <h3 className="text-xl font-bold text-white mb-4">{editingId === "new" ? "New Journey Log" : "Edit Journey Log"}</h3>
        <div className="space-y-4">
          <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" type="date" placeholder="Date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Type (e.g. Learning, Project Build)" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
          </div>
          
          <div className="space-y-2">
            <span className="text-slate-400 text-sm">Assign to Pillars:</span>
            <div className="flex flex-wrap gap-2">
              {availablePillars.map(p => (
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

          <div className="grid grid-cols-2 gap-4">
            <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="External Link (Optional)" value={formData.link || ""} onChange={e => setFormData({...formData, link: e.target.value})} />
            <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="GitHub URL" value={formData.github || ""} onChange={e => setFormData({...formData, github: e.target.value})} />
            <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="LinkedIn URL" value={formData.linkedin || ""} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
            <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Live Demo URL" value={formData.live || ""} onChange={e => setFormData({...formData, live: e.target.value})} />
            <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white col-span-2" placeholder="Kaggle URL" value={formData.kaggle || ""} onChange={e => setFormData({...formData, kaggle: e.target.value})} />
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
        <h2 className="text-xl font-bold text-white">Journeys (Logs)</h2>
        <button onClick={handleNew} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-full text-sm font-medium text-white transition-colors">Add Journey</button>
      </div>
      {initialLogs.map(log => (
        <GlassCard key={log.id} className="p-4 flex justify-between items-center group">
          <div>
            <h3 className="text-white font-bold">{log.title}</h3>
            <p className="text-sm text-slate-400">{log.date} - {log.type}</p>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleEdit(log)} className="text-cyan-400 hover:text-cyan-300 px-3 py-1 bg-cyan-900/30 rounded">Edit</button>
            <button onClick={() => handleDelete(log.id)} className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-900/30 rounded">Delete</button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
