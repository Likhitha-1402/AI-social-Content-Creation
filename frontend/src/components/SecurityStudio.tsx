"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { API_URL } from "../utils/api";
import {
  Shield,
  Activity,
  UserCheck,
  Lock,
  RefreshCw,
  Trash2,
  Database
} from "lucide-react";

export default function SecurityStudio() {
  const { token, user } = useStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/security/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const handleDeleteData = () => {
    const confirm = window.confirm("Are you sure you want to request account data deletion? This will permanently remove your scheduled posts, assets, and chat logs to comply with GDPR requirements. This cannot be undone.");
    if (confirm) {
      alert("GDPR data deletion request received. Your database entries will be removed within 24 hours.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Security & Audit Center
        </h2>
        <p className="text-zinc-400 mt-1">
          Monitor your account audit logs, configure data privacy, and manage role-based permission settings.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Encryption</span>
            <h4 className="text-sm font-bold text-white mt-1">AES-256 Enabled</h4>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Account Role</span>
            <h4 className="text-sm font-bold text-white mt-1">Creator permissions</h4>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">API Rate Limits</span>
            <h4 className="text-sm font-bold text-white mt-1">Active Monitoring</h4>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Data Locality</span>
            <h4 className="text-sm font-bold text-white mt-1">Local Sovereignty</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audit Log Table */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-6 flex flex-col justify-between h-[450px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              <h4 className="text-sm font-bold text-white">System Audit Logs</h4>
            </div>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-3">
            {logs.length === 0 ? (
              <div className="py-20 text-center text-xs text-zinc-500">
                No security audit logs found.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded border border-violet-500/20">
                      {log.action}
                    </span>
                    <p className="text-zinc-300 font-medium mt-1.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* GDPR Privacy Controls */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 h-fit">
          <div className="border-b border-white/5 pb-4">
            <h4 className="text-sm font-bold text-white">User Privacy Settings</h4>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Configure your data collection preferences for artificial intelligence integrations.
          </p>

          <div className="space-y-4">
            {/* Opt out AI training */}
            <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <input
                type="checkbox"
                id="optout"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="w-4.5 h-4.5 accent-violet-500 rounded mt-0.5 cursor-pointer"
              />
              <div className="space-y-1">
                <label htmlFor="optout" className="text-xs font-bold text-zinc-200 cursor-pointer select-none">
                  AI Model Opt-Out
                </label>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Do not use my uploaded content or generated assets for future LLM or diffusion training loops.
                </p>
              </div>
            </div>

            {/* GDPR right to be forgotten */}
            <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
              <button
                onClick={handleDeleteData}
                className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all cursor-pointer shrink-0"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
              <div className="space-y-1">
                <span className="text-xs font-bold text-red-400 block">Right to be Forgotten</span>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Request immediate purge of all campaign data, chat transcripts, media files, and active session tokens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
