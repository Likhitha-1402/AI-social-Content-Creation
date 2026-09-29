"use client";

import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { API_URL } from "../utils/api";
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  Search,
  BookOpen
} from "lucide-react";

export default function ArticleStudio() {
  const { token, articleDraft, setArticleDraft } = useStore();
  const [incident, setIncident] = useState("");
  const [format, setFormat] = useState("Blog Post");
  const [length, setLength] = useState("Medium");
  const [isSeoOptimized, setIsSeoOptimized] = useState(true);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  React.useEffect(() => {
    if (articleDraft) {
      setIncident(articleDraft);
      setArticleDraft("");
    }
  }, [articleDraft, setArticleDraft]);

  const formats = [
    "Blog Post", "Newspaper Article", "Magazine Feature", 
    "Research Article", "LinkedIn Article", "Press Release", 
    "Case Study", "Executive Summary", "Social Media Summary"
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident.trim() || !token) return;

    setLoading(true);
    setOutput(null);

    try {
      const res = await fetch(`${API_URL}/api/studio/article`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ incident, format, length })
      });
      const data = await res.json();
      if (res.ok) {
        setOutput(data.result);
      } else {
        alert(data.error || "Generation failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    alert("Copied to clipboard!");
  };

  const handleExport = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${format.toLowerCase().replace(/\s+/g, "-")}-article.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to separate text and render badge labels for verified facts vs AI analysis
  const renderFormattedArticle = () => {
    if (!output) return null;

    // Simple parser searching for headers
    const sections = output.split(/(?=###?\s+)/);
    return (
      <div className="space-y-6">
        {sections.map((section, idx) => {
          const isVerified = section.toLowerCase().includes("verified facts") || section.toLowerCase().includes("verified source facts");
          const isAiCommentary = section.toLowerCase().includes("ai analysis") || section.toLowerCase().includes("commentary");
          
          if (isVerified) {
            return (
              <div key={idx} className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                    Verified Source Facts
                  </span>
                </div>
                <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {section.replace(/###?\s+.*Verified.*/gi, "").trim()}
                </div>
              </div>
            );
          }

          if (isAiCommentary) {
            return (
              <div key={idx} className="p-6 rounded-2xl border border-violet-500/20 bg-violet-500/5 shadow-lg shadow-violet-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-violet-500/5 blur-xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-violet-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase text-violet-400 tracking-widest bg-violet-400/10 px-2 py-0.5 rounded border border-violet-400/20">
                    AI Narrative Interpretation
                  </span>
                </div>
                <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {section.replace(/###?\s+.*Commentary.*/gi, "").replace(/###?\s+.*Analysis.*/gi, "").trim()}
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {section}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Configure Panel */}
      <div className="glass-panel p-6 rounded-3xl space-y-6 h-fit">
        <div className="flex items-center gap-2 text-white font-bold border-b border-white/5 pb-4">
          <BookOpen className="w-5 h-5 text-violet-400" />
          <span>AI Article Studio</span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Topic / Incident Prompt</label>
            <textarea
              required
              rows={5}
              placeholder="e.g. 'SpaceX catches the giant Starship booster rocket mid-air using mechanical chopsticks. Groundbreaking engineering milestone...'"
              value={incident}
              onChange={(e) => setIncident(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Article Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              {formats.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Target Length</label>
            <div className="grid grid-cols-3 gap-2">
              {["Short", "Medium", "Long"].map(l => (
                <button
                  type="button"
                  key={l}
                  onClick={() => setLength(l)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    length === l
                      ? "bg-violet-600/20 border-violet-500 text-violet-300"
                      : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="seo"
              checked={isSeoOptimized}
              onChange={(e) => setIsSeoOptimized(e.target.checked)}
              className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
            />
            <label htmlFor="seo" className="text-xs font-semibold text-zinc-300 cursor-pointer select-none">
              Inject SEO tags & focus keywords
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !incident.trim()}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Fact-Checking & Writing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Article</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-2 space-y-6">
        {!output && !loading && (
          <div className="glass-panel p-12 rounded-3xl min-h-[400px] flex flex-col justify-center items-center text-center space-y-3 bg-black/20">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/5 text-zinc-600">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-zinc-500 text-xs font-medium">Input your topic story and select length parameters to draft your article.</p>
          </div>
        )}

        {loading && (
          <div className="glass-panel p-8 rounded-3xl min-h-[400px] flex flex-col justify-center items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
            <div className="space-y-1 text-center">
              <p className="text-xs font-bold text-white">Multi-Agent Editorial Pipeline Active</p>
              <p className="text-[10px] text-zinc-500 max-w-sm">Research, Fact-checking, and Copywriting agents are cross-verifying background events...</p>
            </div>
          </div>
        )}

        {output && !loading && (
          <div className="glass-panel p-8 rounded-3xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="text-xs text-zinc-300 font-semibold">{format} Output Layout</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-semibold text-zinc-300 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Text
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-semibold text-zinc-300 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export MD
                </button>
              </div>
            </div>

            {/* Generated Render Content */}
            <div className="space-y-6 text-zinc-100">
              {renderFormattedArticle()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
