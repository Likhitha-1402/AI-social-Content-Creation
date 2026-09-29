"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { API_URL } from "../utils/api";
import {
  Share2,
  Sparkles,
  Copy,
  Calendar,
  Eye,
  Globe,
  Smile,
  Compass,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Trash2
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

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function SocialStudio() {
  const { token, socialDraft, setSocialDraft } = useStore();
  const [activePlatform, setActivePlatform] = useState("linkedin");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  
  // Custom states
  const [details, setDetails] = useState("");
  const [autoTone, setAutoTone] = useState(true);
  const [manualTone, setManualTone] = useState("Professional");
  const [detectedTone, setDetectedTone] = useState("");
  const [translateLang, setTranslateLang] = useState("Original");
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (socialDraft) {
      setDetails(socialDraft);
      setSocialDraft("");
    }
  }, [socialDraft, setSocialDraft]);

  // File uploads
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileUrl(null);
  };

  const platforms = [
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-sky-400" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-400" },
    { id: "x", name: "X (Twitter)", icon: Twitter, color: "text-zinc-300" },
    { id: "facebook", name: "Facebook", icon: Linkedin, color: "text-blue-500" },
    { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-500" },
    { id: "threads", name: "Threads", icon: Twitter, color: "text-zinc-400" },
    { id: "pinterest", name: "Pinterest", icon: Instagram, color: "text-red-600" },
    { id: "tiktok", name: "TikTok", icon: Youtube, color: "text-rose-400" },
    { id: "reddit", name: "Reddit", icon: Share2, color: "text-orange-500" },
    { id: "medium", name: "Medium", icon: FileText, color: "text-teal-400" }
  ];

  const tones = [
    "Professional", "Luxury", "Casual", "Friendly", "Storytelling", 
    "Humorous", "Technical", "Startup Founder", "Motivational"
  ];

  const languages = [
    "Original", "English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", 
    "Marathi", "Bengali", "Gujarati", "Spanish", "French", "German", "Japanese", "Chinese"
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim() || !token) return;

    setLoading(true);
    setOutput(null);

    // Auto Tone simulation logic based on query content keywords
    let suggestedTone = "Professional";
    const lowerText = details.toLowerCase();
    if (lowerText.includes("fail") || lowerText.includes("struggle") || lowerText.includes("journey")) {
      suggestedTone = "Storytelling";
    } else if (lowerText.includes("funny") || lowerText.includes("joke") || lowerText.includes("witty")) {
      suggestedTone = "Humorous";
    } else if (lowerText.includes("luxury") || lowerText.includes("premium") || lowerText.includes("exclusive")) {
      suggestedTone = "Luxury";
    } else if (lowerText.includes("code") || lowerText.includes("architecture") || lowerText.includes("data")) {
      suggestedTone = "Technical";
    } else if (lowerText.includes("pitch") || lowerText.includes("funding") || lowerText.includes("launched")) {
      suggestedTone = "Startup Founder";
    }
    setDetectedTone(suggestedTone);

    const finalTone = autoTone ? suggestedTone : manualTone;
    const prompt = `Generate an optimized ${activePlatform} post. 
    Tone Profile: ${finalTone}. 
    Content constraints: respect characters limits, formatting rules, CTAs, and hashtags optimized for ${activePlatform}.
    Details: ${details}`;

    try {
      const res = await fetch(`${API_URL}/api/studio/incident`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ incident: prompt, format: `${activePlatform} Post` })
      });
      const data = await res.json();
      if (res.ok) {
        setOutput(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (lang: string) => {
    setTranslateLang(lang);
    if (lang === "Original" || !output) return;

    setTranslating(true);
    try {
      const res = await fetch(`${API_URL}/api/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: output, targetLanguage: lang })
      });
      const data = await res.json();
      if (res.ok) {
        setOutput(data.translated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    alert("Copied to clipboard!");
  };

  const handleSchedule = async () => {
    if (!output || !token) return;
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
          platforms: activePlatform,
          content: output,
          scheduledTime: date.toISOString(),
          status: "scheduled"
        })
      });
      if (res.ok) {
        alert("Campaign post scheduled successfully! Check Content Calendar.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Configuration Sidebar */}
      <div className="glass-panel p-6 rounded-3xl space-y-6 h-fit">
        <div className="flex items-center gap-2 text-white font-bold border-b border-white/5 pb-4">
          <Share2 className="w-5 h-5 text-violet-400" />
          <span>Social Campaign Studio</span>
        </div>

        {/* Platform Selection scroll grid */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-400 block mb-2 uppercase tracking-wide">Select Platform</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
            {platforms.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activePlatform === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => {
                    setActivePlatform(tab.id);
                    setOutput(null);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-violet-600/20 border-violet-500 text-violet-300"
                      : "bg-white/[0.01] border-white/5 text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${tab.color}`} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Campaign Details / Target Idea</label>
            <textarea
              required
              rows={4}
              placeholder="Provide information or draft to optimize..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
            />
          </div>

          {/* Files/Images Attachment Section */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-300">Campaign Attachments</span>
            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-zinc-300 font-semibold border border-white/5 cursor-pointer flex-1 justify-center transition-colors">
                <Paperclip className="w-4 h-4 text-violet-400" />
                <span>Add Image / File</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {file && (
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 truncate text-zinc-300">
                  <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Auto Tone Detector */}
          <div className="space-y-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-violet-400" />
                Auto Tone Detection
              </span>
              <input
                type="checkbox"
                checked={autoTone}
                onChange={(e) => setAutoTone(e.target.checked)}
                className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
              />
            </div>

            {autoTone ? (
              detectedTone ? (
                <div className="text-[10px] text-violet-400 font-bold bg-violet-400/10 px-2 py-1 rounded border border-violet-400/20 w-fit">
                  Suggested Tone: {detectedTone}
                </div>
              ) : (
                <span className="text-[9px] text-zinc-500 leading-none">Suggested tone will detect automatically from prompt content.</span>
              )
            ) : (
              <select
                value={manualTone}
                onChange={(e) => setManualTone(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
              >
                {tones.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>

          {/* Translation selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-violet-400" />
              Engine Translation
            </span>
            <select
              value={translateLang}
              onChange={(e) => handleTranslate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
            >
              {languages.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? "Optimizing Campaign..." : "Generate Social Post"}
          </button>
        </form>
      </div>

      {/* Editor & Preview Column */}
      <div className="lg:col-span-2 space-y-6">
        {loading || translating ? (
          <div className="glass-panel p-8 rounded-3xl min-h-[300px] flex flex-col justify-center items-center gap-3">
            <span className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-xs text-zinc-500 font-semibold">Social drafting agents are adapting content constraints...</p>
          </div>
        ) : output ? (
          <div className="space-y-6">
            {/* Live post layout mockup */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-2 border-b border-white/5 pb-3">
                <Eye className="w-4 h-4 text-violet-400" />
                Live {activePlatform} Screen Preview
              </span>

              {/* Feed Card Mock */}
              <div className="bg-black/30 border border-white/5 rounded-2xl p-5 max-w-lg mx-auto shadow-2xl space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-600/25 flex items-center justify-center border border-violet-500/20 text-violet-400 font-extrabold uppercase">
                    C
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Creator Account</h5>
                    <span className="text-[9px] text-zinc-500 font-medium block">Sponsored • Platform Optimizer</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">{output}</p>

                {fileUrl && (
                  <div className="rounded-xl overflow-hidden border border-white/5 bg-white/5 relative max-h-56 flex items-center justify-center">
                    <img src={fileUrl} alt="Attached asset" className="w-full h-full object-cover max-h-56" />
                  </div>
                )}

                {activePlatform === "instagram" && !fileUrl && (
                  <div className="h-48 w-full bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-zinc-700 animate-pulse" />
                  </div>
                )}

                <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-white/5 pt-3">
                  <span>👍 84 Likes</span>
                  <span>💬 12 Comments</span>
                </div>
              </div>
            </div>

            {/* Actions panel */}
            <div className="glass-panel p-5 rounded-2xl flex justify-between items-center flex-wrap gap-4">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-400/10 px-2.5 py-1 rounded border border-indigo-400/20">
                Aesthetic tone: {detectedTone || manualTone}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button
                  onClick={handleSchedule}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-lg hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" /> Queue Post
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-3xl min-h-[350px] flex flex-col justify-center items-center text-center space-y-3 bg-black/20">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/5 text-zinc-600">
              <Compass className="w-5 h-5" />
            </div>
            <p className="text-zinc-500 text-xs font-medium">Select a campaign platform and write description details to synthesize preview.</p>
          </div>
        )}
      </div>
    </div>
  );
}
