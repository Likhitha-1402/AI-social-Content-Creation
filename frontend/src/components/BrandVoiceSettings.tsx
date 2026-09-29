"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { API_URL } from "../utils/api";
import { Volume2, Sparkles, Check } from "lucide-react";

export default function BrandVoiceSettings() {
  const { token, brandVoice, setBrandVoice } = useStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState("My Brand Persona");
  const [tone, setTone] = useState("Friendly");
  const [vocabulary, setVocabulary] = useState("Modern, accessible");
  const [ctaStyle, setCtaStyle] = useState("Soft conversion");
  const [emojiUsage, setEmojiUsage] = useState("Moderate");
  const [formatting, setFormatting] = useState("Spaced paragraphs");

  const tones = [
    "Friendly", "Professional", "Corporate", "Luxury", 
    "Inspirational", "Funny", "Startup Founder", "Casual", "CEO"
  ];

  const emojis = ["None", "Minimal", "Moderate", "High"];

  useEffect(() => {
    if (!token) return;
    
    // Fetch existing voice from db
    fetch(`${API_URL}/api/brand-voice`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setBrandVoice(data);
          setName(data.name);
          setTone(data.tone);
          setVocabulary(data.vocabulary);
          setCtaStyle(data.ctaStyle);
          setEmojiUsage(data.emojiUsage);
          setFormatting(data.formatting);
        }
      })
      .catch((err) => console.error("Error loading brand voice:", err));
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch(`${API_URL}/api/brand-voice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, tone, vocabulary, ctaStyle, emojiUsage, formatting })
      });
      const data = await res.json();
      
      if (res.ok) {
        setBrandVoice(data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in relative z-10">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Brand Voice Memory</h2>
        <p className="text-zinc-400 mt-1">Configure your personal style memory rules. Virtual agents will align all generated copy to match this profile.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] w-36 h-36 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2.5 text-white font-bold border-b border-white/5 pb-4 mb-6">
          <Volume2 className="w-5 h-5 text-violet-400" />
          <span>Brand Voice Rules Profile</span>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" /> Presets updated and memorized! Agents will align future creations to this profile.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Persona name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Persona Profile Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tone selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Tone Style</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Emojis selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Emoji Density</label>
              <select
                value={emojiUsage}
                onChange={(e) => setEmojiUsage(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                {emojis.map((em) => (
                  <option key={em} value={em}>{em}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Vocabulary Guidelines</label>
            <input
              type="text"
              required
              placeholder="e.g. 'Use words like innovative, bootstrap, leverage. Avoid excessive buzzwords.'"
              value={vocabulary}
              onChange={(e) => setVocabulary(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Call to Action (CTA) Preference</label>
              <input
                type="text"
                required
                placeholder="e.g. 'Soft link invitation or ask an engaging question at the end.'"
                value={ctaStyle}
                onChange={(e) => setCtaStyle(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Formatting Layout Rules</label>
              <input
                type="text"
                required
                placeholder="e.g. 'Spaced sentences, double space breaks, short intro lines.'"
                value={formatting}
                onChange={(e) => setFormatting(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save Voice Persona Parameters</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
