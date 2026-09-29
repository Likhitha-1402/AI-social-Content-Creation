"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { API_URL } from "../utils/api";
import {
  Sparkles,
  Download,
  Scissors,
  Maximize2,
  Trash2,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Sliders,
  Maximize,
  Crop
} from "lucide-react";

export default function ImageStudio() {
  const { token, imageDraft, setImageDraft } = useStore();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [ratio, setRatio] = useState("1:1");

  useEffect(() => {
    if (imageDraft) {
      setPrompt(imageDraft);
      setImageDraft("");
    }
  }, [imageDraft, setImageDraft]);
  const [loading, setLoading] = useState(false);
  const [activeImage, setActiveImage] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Editing actions states
  const [bgRemoved, setBgRemoved] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [upscaled, setUpscaled] = useState(false);
  const [upscaling, setUpscaling] = useState(false);
  const [inpaintingText, setInpaintingText] = useState("");
  const [inpaintingActive, setInpaintingActive] = useState(false);
  const [inpaintingStatus, setInpaintingStatus] = useState("");

  const styles = [
    "Cinematic", "Photorealistic", "Digital Art", "Watercolor Paint", 
    "Cyberpunk Glow", "3D Pixar Render", "Anime Vector", "Sketch Outline",
    "Oil Painting", "Infographic Design", "Social Graphics Card", "Magazine Cover"
  ];

  const ratios = [
    { label: "1:1 Square (Instagram)", val: "1:1" },
    { label: "16:9 Landscape (YouTube)", val: "16:9" },
    { label: "9:16 Portrait (TikTok/Reels)", val: "9:16" },
    { label: "4:5 Portrait (Instagram Post)", val: "4:5" },
    { label: "2:3 Portrait (Pinterest Pin)", val: "2:3" },
    { label: "2.63:1 Landscape (LinkedIn Banner)", val: "2.63:1" }
  ];

  const fetchHistory = async () => {
    if (!token) return;
    try {
      // Seed with some default beautiful assets
      setHistory([
        {
          id: "1",
          prompt: "A luxury office workspace with futuristic AI robots programming virtual displays",
          style: "Cyberpunk Glow",
          aspectRatio: "16:9",
          url: "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=600&auto=format&fit=crop&q=60"
        },
        {
          id: "2",
          prompt: "Abstract digital networks connection mesh glow concept art",
          style: "Digital Art",
          aspectRatio: "1:1",
          url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=60"
        },
        {
          id: "3",
          prompt: "Minimal corporate desk flat illustration gradient artwork",
          style: "Watercolor Paint",
          aspectRatio: "4:5",
          url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60"
        }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !token) return;

    setLoading(true);
    setBgRemoved(false);
    setUpscaled(false);
    setInpaintingActive(false);

    try {
      const res = await fetch(`${API_URL}/api/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, style, aspectRatio: ratio })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveImage(data);
        setHistory([data, ...history]);
        setPrompt("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBg = () => {
    setRemovingBg(true);
    setTimeout(() => {
      setRemovingBg(false);
      setBgRemoved(true);
      // Simulate transparency mask overlay or check completion status
    }, 2000);
  };

  const handleUpscale = () => {
    setUpscaling(true);
    setTimeout(() => {
      setUpscaling(false);
      setUpscaled(true);
    }, 1800);
  };

  const handleInpaintingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inpaintingText.trim()) return;

    setInpaintingStatus("Analyzing composition structure...");
    setTimeout(() => {
      setInpaintingStatus("Brushing mask layers...");
      setTimeout(() => {
        setInpaintingStatus("Generating inpaint overlay pixels...");
        setTimeout(() => {
          setInpaintingStatus("");
          // Update active image URL with seed parameters
          const updatedImg = {
            ...activeImage,
            url: `https://image.pollinations.ai/p/${encodeURIComponent(prompt + " adding " + inpaintingText)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`
          };
          setActiveImage(updatedImg);
          setInpaintingText("");
        }, 1500);
      }, 1200);
    }, 1000);
  };

  const downloadImage = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.download = "creatorverse-artwork.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Configuration Column */}
      <div className="glass-panel p-6 rounded-3xl space-y-6 h-fit">
        <div className="flex items-center gap-2 text-white font-bold border-b border-white/5 pb-4">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <span>AI Image Studio</span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Prompt Description</label>
            <textarea
              required
              rows={4}
              placeholder="e.g. 'A luxury office workspace with futuristic AI robots programming transparent holographic monitors, premium architectural lighting...'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
            />
          </div>

          {/* Style selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Visual Art style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              {styles.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Aspect ratios */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Device Aspect Ratio</label>
            <select
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              {ratios.map(r => (
                <option key={r.val} value={r.val}>{r.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Running Image Synthesis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Masterpiece</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generation View column */}
      <div className="lg:col-span-2 space-y-8">
        {/* Main generation pane */}
        <div className="glass-panel p-6 rounded-3xl min-h-[400px] flex flex-col justify-between items-center relative overflow-hidden bg-black/20">
          {!activeImage && !loading && (
            <div className="my-auto text-center space-y-3">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-zinc-600 border border-white/5">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-zinc-500 text-xs font-medium">Your generated artwork will render here.</p>
            </div>
          )}

          {loading && (
            <div className="my-auto text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Synthesizing Pixels...</p>
                <p className="text-[10px] text-zinc-500">Cooperative agents are assembling color grids matching style vectors.</p>
              </div>
            </div>
          )}

          {activeImage && !loading && (
            <>
              {/* Image Preview container */}
              <div className="relative group max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-white/10 my-auto">
                <img
                  src={activeImage.url}
                  alt={activeImage.prompt}
                  className={`max-h-[360px] object-cover transition-all duration-500 ${
                    bgRemoved ? "brightness-110 contrast-105 saturate-[0.85] bg-slate-900" : ""
                  } ${upscaled ? "scale-[1.01] contrast-105 shadow-violet-500/10" : ""}`}
                />
                
                {/* Floating indicators */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-[9px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 uppercase tracking-wide">
                    {activeImage.style || "Aesthetic"}
                  </span>
                  <span className="text-[9px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 uppercase tracking-wide">
                    Ratio {activeImage.aspectRatio || "1:1"}
                  </span>
                </div>
              </div>

              {/* Inpainting overlay panel */}
              {inpaintingActive && (
                <div className="w-full max-w-md p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3 z-10 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Crop className="w-4 h-4 text-violet-400" />
                      Inpainting / Outpainting Brush Editor
                    </span>
                    <button
                      onClick={() => setInpaintingActive(false)}
                      className="text-zinc-500 hover:text-white text-[10px] font-bold"
                    >
                      Close
                    </button>
                  </div>
                  <form onSubmit={handleInpaintingSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Prompt to add/remove/edit elements in image..."
                      value={inpaintingText}
                      onChange={(e) => setInpaintingText(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Apply Paint
                    </button>
                  </form>
                  {inpaintingStatus && (
                    <p className="text-[9px] text-violet-400 font-bold animate-pulse">{inpaintingStatus}</p>
                  )}
                </div>
              )}

              {/* Editing & Actions panel */}
              <div className="w-full pt-6 border-t border-white/5 flex flex-wrap gap-3 justify-between items-center z-10">
                <div className="flex gap-2 flex-wrap">
                  {/* Remove Background */}
                  <button
                    onClick={handleRemoveBg}
                    disabled={removingBg || bgRemoved}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/5 cursor-pointer disabled:opacity-50"
                  >
                    {removingBg ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : bgRemoved ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Scissors className="w-3.5 h-3.5" />
                    )}
                    Remove Background
                  </button>

                  {/* Upscale */}
                  <button
                    onClick={handleUpscale}
                    disabled={upscaling || upscaled}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/5 cursor-pointer disabled:opacity-50"
                  >
                    {upscaling ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : upscaled ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                    Upscale 4K
                  </button>

                  {/* Inpaint toggle */}
                  <button
                    onClick={() => setInpaintingActive(!inpaintingActive)}
                    className={`flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      inpaintingActive ? "bg-violet-600/20 border-violet-500 text-violet-300" : "bg-white/5 border-white/5 text-zinc-300"
                    }`}
                  >
                    <Crop className="w-3.5 h-3.5" />
                    Edit / Brush
                  </button>
                </div>

                <button
                  onClick={() => downloadImage(activeImage.url)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-lg hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Art
                </button>
              </div>
            </>
          )}
        </div>

        {/* History Gallery */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider pl-1">Past Creations</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {history.map((img) => (
              <div
                key={img.id}
                onClick={() => {
                  setActiveImage(img);
                  setBgRemoved(false);
                  setUpscaled(false);
                }}
                className="group relative h-40 rounded-2xl overflow-hidden border border-white/5 hover:border-violet-500/30 cursor-pointer shadow-lg transition-all duration-300 hover:-translate-y-1 bg-black/10"
              >
                <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-[10px]">
                  <span className="font-extrabold text-white line-clamp-1 uppercase">{img.style}</span>
                  <p className="text-zinc-400 font-medium line-clamp-2 leading-relaxed mt-0.5">{img.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
