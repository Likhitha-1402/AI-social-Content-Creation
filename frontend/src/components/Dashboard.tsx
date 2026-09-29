"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { API_URL } from "../utils/api";
import {
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  ThumbsUp,
  FileText
} from "lucide-react";

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const { token } = useStore();
  const [stats, setStats] = useState({
    totalPosts: 12,
    scheduled: 3,
    brandVoice: "Authentic Founder",
    engagement: 87.4,
  });

  const [scheduledItems, setScheduledItems] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    
    // Fetch scheduled items from API
    fetch(`${API_URL}/api/calendar`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setScheduledItems(data.slice(0, 3));
          setStats(prev => ({
            ...prev,
            scheduled: data.length
          }));
        }
      })
      .catch(err => console.error("Error fetching dashboard calendar:", err));
  }, [token]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper header banner */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Creator Studio Dashboard
          </h2>
          <p className="text-zinc-400 mt-1">
            Your cooperative AI agents have optimized your pipeline. Here is your current output status.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("chat")}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-violet-500/20 transition-all duration-200 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-violet-200" />
          Create New Content
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total creations */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
          <div className="absolute right-[-10px] top-[-10px] w-20 h-20 rounded-full bg-violet-600/5 blur-xl group-hover:bg-violet-600/10 transition-all" />
          <div className="flex justify-between items-start">
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Total Creations
            </span>
            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mt-2">
              {stats.totalPosts}
            </h3>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +15.2% this week
            </span>
          </div>
        </div>

        {/* Scheduled posts */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
          <div className="absolute right-[-10px] top-[-10px] w-20 h-20 rounded-full bg-indigo-600/5 blur-xl group-hover:bg-indigo-600/10 transition-all" />
          <div className="flex justify-between items-start">
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Scheduled Posts
            </span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mt-2">
              {stats.scheduled}
            </h3>
            <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> Ready in pipeline
            </span>
          </div>
        </div>

        {/* Brand Tone */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
          <div className="absolute right-[-10px] top-[-10px] w-20 h-20 rounded-full bg-violet-600/5 blur-xl group-hover:bg-violet-600/10 transition-all" />
          <div className="flex justify-between items-start">
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Brand Voice Profile
            </span>
            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mt-2 truncate">
              {stats.brandVoice}
            </h3>
            <span className="text-[10px] text-zinc-500 font-medium mt-1 block">
              Applied automatically
            </span>
          </div>
        </div>

        {/* Engagement Score */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute right-[-10px] top-[-10px] w-20 h-20 rounded-full bg-emerald-600/5 blur-xl group-hover:bg-emerald-600/10 transition-all" />
          <div className="flex justify-between items-start">
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Avg. Virality Score
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mt-2">
              {stats.engagement}%
            </h3>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              Optimized for reach
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Analytical visualizer + Scheduled list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graph representation */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-base font-bold text-white">
              AI-Predicted Engagement Index
            </h4>
            <span className="text-xs text-zinc-500 font-medium">
              Past 7 Days
            </span>
          </div>

          {/* Simple premium mock chart using raw Tailwind bars */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6">
            {[72, 85, 91, 78, 88, 95, 87].map((val, idx) => {
              const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full relative flex justify-center items-end h-full">
                    {/* Hover detail tooltip */}
                    <span className="absolute top-[-30px] opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-white/10 text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-xl">
                      {val}%
                    </span>
                    <div
                      style={{ height: `${val}%` }}
                      className="w-full bg-gradient-to-t from-violet-600/80 to-indigo-500/90 rounded-t-lg group-hover:from-violet-500 group-hover:to-indigo-400 transition-all duration-300 shadow-lg shadow-violet-500/10 cursor-pointer"
                    />
                  </div>
                  <span className="text-xs text-zinc-500 font-medium mt-1">
                    {dayNames[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming scheduled queue */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-base font-bold text-white">
              Upcoming Queue
            </h4>
            <button
              onClick={() => setActiveTab("calendar")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              See all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {scheduledItems.length === 0 ? (
              <div className="py-12 text-center space-y-2 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <Calendar className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-500">No scheduled content.</p>
                <button
                  onClick={() => setActiveTab("calendar")}
                  className="text-xs text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Schedule one now
                </button>
              </div>
            ) : (
              scheduledItems.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-3 hover:border-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 tracking-wider">
                      {item.platforms.split(",")[0]}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold">
                      {new Date(item.scheduledTime).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium line-clamp-2">
                    {item.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Suggested optimization tools */}
      <div className="glass-panel p-8 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <h5 className="font-bold text-white text-sm">Engagement Boosters</h5>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Your brand voice is currently set to friendly. Adding narrative hooks at the beginning of posts increases average retention by 22%.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Eye className="w-5 h-5" />
          </div>
          <h5 className="font-bold text-white text-sm">Viral Peak Timing</h5>
          <p className="text-xs text-zinc-500 leading-relaxed">
            LinkedIn algorithm reach predictions show a traffic surge between 08:30 AM and 09:30 AM EST on weekdays. Adjust calendar schedules accordingly.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <h5 className="font-bold text-white text-sm">Document Converter</h5>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Upload your product descriptions or PDF whitepapers in the AI Chat Studio to automatically output multi-slide Instagram Carousels.
          </p>
        </div>
      </div>
    </div>
  );
}
