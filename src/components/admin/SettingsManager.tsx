"use client";

import { useState } from "react";
import { changePassword } from "@/app/admin/actions";
import { GlassCard } from "@/components/ui/GlassCard";

export function SettingsManager({ userEmail }: { userEmail: string }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setStatus("");
    if (!oldPass || !newPass) {
      setStatus("error: Please fill in both fields");
      return;
    }
    setLoading(true);
    try {
      await changePassword(userEmail, oldPass, newPass);
      setStatus("success: Password changed successfully!");
      setOldPass("");
      setNewPass("");
    } catch (e: any) {
      setStatus("error: " + (e.message || "Failed to change password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6 max-w-lg">
      <h3 className="text-xl font-bold text-white mb-6">Security Settings</h3>
      
      {status && (
        <div className={`p-3 rounded mb-4 text-sm ${status.startsWith("error") ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
          {status.replace("error: ", "").replace("success: ", "")}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Old Password</label>
          <input 
            type="password" 
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-cyan-500" 
            value={oldPass} 
            onChange={e => setOldPass(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
          <input 
            type="password" 
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-cyan-500" 
            value={newPass} 
            onChange={e => setNewPass(e.target.value)} 
          />
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-4 py-2 rounded text-white font-medium transition-colors"
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </div>
    </GlassCard>
  );
}
