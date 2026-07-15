"use client";

import { useState } from "react";
import { saveExperience, deleteExperience } from "@/app/admin/actions";
import { GlassCard } from "@/components/ui/GlassCard";

export function ExperienceManager({ initialExperiences }: { initialExperiences: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  const handleEdit = (exp: any) => {
    setEditingId(exp.id);
    setFormData(exp);
  };
  
  const handleNew = () => {
    setEditingId("new");
    setFormData({ role: "", company: "", period: "", description: "" });
  };
  
  const handleSave = async () => {
    await saveExperience(formData);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deleteExperience(id);
    }
  };

  if (editingId) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">{editingId === "new" ? "New Experience" : "Edit Experience"}</h3>
        <div className="space-y-4">
          <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
          <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Company" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
          <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Period (e.g. 2024 - Present)" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} />
          <textarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
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
        <h2 className="text-xl font-bold text-white">Experience</h2>
        <button onClick={handleNew} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-full text-sm font-medium text-white transition-colors">Add Experience</button>
      </div>
      {initialExperiences.map(e => (
        <GlassCard key={e.id} className="p-4 flex justify-between items-center group">
          <div>
            <h3 className="text-white font-bold">{e.role} @ {e.company}</h3>
            <p className="text-sm text-slate-400">{e.period}</p>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleEdit(e)} className="text-cyan-400 hover:text-cyan-300 px-3 py-1 bg-cyan-900/30 rounded">Edit</button>
            <button onClick={() => handleDelete(e.id)} className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-900/30 rounded">Delete</button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
