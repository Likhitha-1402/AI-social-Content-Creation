"use client";

import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { API_URL } from "../utils/api";
import {
  Sparkles,
  Copy,
  Download,
  Calendar,
  Share2,
  FileText,
  Video,
  Volume2,
  Image as ImageIcon,
  MessageSquare,
  FileSpreadsheet
} from "lucide-react";

// Inline brand SVGs for social icons
const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function StoryToEverything() {
  const { token } = useStore();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState("article");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !token) return;

    setLoading(true);
    setOutput(null);

    try {
      const res = await fetch(`${API_URL}/api/studio/story-to-everything`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (res.ok) {
        setOutput(data);
      } else {
        alert(data.error || "Generation failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Content copied to clipboard!");
  };

  const handleScheduleItem = async (content: string, type: string) => {
    if (!token) return;
    try {
      const date = new Date();
      date.setDate(date.getDate() + 1);

      const res = await fetch(`${API_URL}/api/calendar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          platforms: type,
          content,
          scheduledTime: date.toISOString(),
          status: "draft"
        })
      });
      if (res.ok) {
        alert("Draft successfully queued in Content Calendar!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const subTabs = [
    { id: "article", label: "Blog Article", icon: FileText, color: "text-violet-400" },
    { id: "linkedin", label: "LinkedIn Post", icon: Linkedin, color: "text-sky-400" },
    { id: "twitter", label: "X Thread", icon: Twitter, color: "text-zinc-300" },
    { id: "instagram", label: "Instagram Caption", icon: Instagram, color: "text-pink-400" },
    { id: "youtube", label: "YouTube Script", icon: Video, color: "text-red-400" },
    { id: "audio", label: "Podcast Script", icon: Volume2, color: "text-emerald-400" },
    { id: "visual", label: "Visual Asset", icon: ImageIcon, color: "text-amber-400" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Input panel */}
      <div className="glass-panel p-6 rounded-3xl space-y-6 h-fit">
        <div className="flex items-center gap-2 text-white font-bold border-b border-white/5 pb-4">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <span>Story-to-Everything AI</span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          The ultimate content multiplier. Paste a single story or event prompt, and our agents will build a complete media package consisting of social copies, visual assets, podcast audio blueprints, and full blog layouts.
        </p>

        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Unified Narrative Prompt</label>
            <textarea
              required
              rows={6}
              placeholder="e.g. 'A tech startup has successfully integrated local AI models using WebGPU. It enables users to edit high-definition video offline on their mobile devices. The feedback was extremely positive...'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Multiplying Content Channels...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Multiply Campaign Assets</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Output preview tabs board */}
      <div className="lg:col-span-2 space-y-6">
        {!output && !loading && (
          <div className="glass-panel p-12 rounded-3xl min-h-[400px] flex flex-col justify-center items-center text-center space-y-3 bg-black/20">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/5 text-zinc-600">
              <Share2 className="w-5 h-5" />
            </div>
            <p className="text-zinc-500 text-xs font-medium">Input your story to synthesize your omnichannel campaign deliverables.</p>
          </div>
        )}

        {loading && (
          <div className="glass-panel p-8 rounded-3xl min-h-[400px] flex flex-col justify-center items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
            <div className="space-y-1 text-center">
              <p className="text-xs font-bold text-white">Coordinating Multi-Agent Production Pipeline</p>
              <p className="text-[10px] text-zinc-500 max-w-sm">Editorial copywriters, SEO researchers, visual designers, and script planners are generating matching context drafts concurrently...</p>
            </div>
          </div>
        )}

        {output && !loading && (
          <div className="space-y-6">
            {/* Visual Header Carousel of tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-white/5">
              {subTabs.map(tab => {
                const Icon = tab.icon;
                const isSelected = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-violet-600/20 border-violet-500 text-violet-300"
                        : "bg-white/[0.01] border-white/5 text-zinc-400 hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${tab.color}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Render selected content tab output */}
            <div className="glass-panel p-8 rounded-3xl space-y-4">
              {activeSubTab !== "visual" && (
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Campaign Draft Output</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyText(output[activeSubTab])}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-semibold text-zinc-300 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Draft
                    </button>
                    <button
                      onClick={() => handleScheduleItem(output[activeSubTab], activeSubTab === "article" ? "blog" : activeSubTab)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-semibold text-zinc-300 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Queue Post
                    </button>
                  </div>
                </div>
              )}

              {activeSubTab === "article" && (
                <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {output.article}
                </div>
              )}

              {activeSubTab === "linkedin" && (
                <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {output.linkedin}
                </div>
              )}

              {activeSubTab === "twitter" && (
                <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {output.twitter}
                </div>
              )}

              {activeSubTab === "instagram" && (
                <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {output.instagram}
                </div>
              )}

              {activeSubTab === "youtube" && (
                <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {output.youtube}
                </div>
              )}

              {activeSubTab === "audio" && (
                <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {output.audio}
                </div>
              )}

              {activeSubTab === "visual" && (
                <div className="space-y-6 text-center">
                  <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                    <img src={output.imageUrl} alt="Campaign Asset" className="w-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 uppercase tracking-widest">
                        Campaign Banner Seed
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-3">
                    <a
                      href={output.imageUrl}
                      target="_blank"
                      download="campaign-banner.jpg"
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-lg hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Artwork
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
