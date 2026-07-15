"use client";

import { useState } from "react";
import { savePillar, deletePillar } from "@/app/admin/actions";
import { GlassCard } from "@/components/ui/GlassCard";

export function PillarsManager({ initialPillars }: { initialPillars: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  const handleEdit = (pillar: any) => {
    setEditingId(pillar.id);
    setFormData(pillar);
  };
  
  const handleNew = () => {
    setEditingId("new");
    setFormData({ id: "", title: "", summary: "", philosophy: "" });
  };
  
  const handleSave = async () => {
    await savePillar(formData);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deletePillar(id);
    }
  };

  if (editingId) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">{editingId === "new" ? "New Pillar" : "Edit Pillar"}</h3>
        <div className="space-y-4">
          <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="ID (e.g. ai, full-stack)" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={editingId !== "new"} />
          <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <textarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Summary" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
          <textarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Philosophy" value={formData.philosophy} onChange={e => setFormData({...formData, philosophy: e.target.value})} />
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
        <h2 className="text-xl font-bold text-white">Pillars</h2>
        <button onClick={handleNew} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-full text-sm font-medium text-white transition-colors">Add Pillar</button>
      </div>
      {initialPillars.map(p => (
        <GlassCard key={p.id} className="p-4 flex justify-between items-center group">
          <div>
            <h3 className="text-white font-bold">{p.title}</h3>
            <p className="text-sm text-slate-400">{p.id}</p>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleEdit(p)} className="text-cyan-400 hover:text-cyan-300 px-3 py-1 bg-cyan-900/30 rounded">Edit</button>
            <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-900/30 rounded">Delete</button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
