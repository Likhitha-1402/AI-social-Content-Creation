"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { API_URL } from "../utils/api";
import {
  Sparkles,
  Play,
  Pause,
  Download,
  Film,
  ListOrdered,
  Volume2,
  FileText,
  Video as VideoIcon,
  Maximize2,
  Settings,
  RefreshCw,
  Clock,
  Eye,
  Sliders,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Trash2,
  Music,
  Plus,
  Type
} from "lucide-react";

export default function VideoStudio() {
  const { token, videoDraft, setVideoDraft } = useStore();
  const [story, setStory] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [ratio, setRatio] = useState("16:9");
  const [videoType, setVideoType] = useState("text"); // "text" | "article" | "image"
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Pipeline steps progress states
  const [loading, setLoading] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState([
    { name: "Generating Script", progress: 0, status: "idle" },
    { name: "Generating Scenes", progress: 0, status: "idle" },
    { name: "Generating Images", progress: 0, status: "idle" },
    { name: "Generating Narration", progress: 0, status: "idle" },
    { name: "Rendering Video", progress: 0, status: "idle" }
  ]);

  // Storyboard compiler list
  const [storyboard, setStoryboard] = useState<any[]>([]);
  const [videoAsset, setVideoAsset] = useState<any>(null);
  
  // Player control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [bgMusicUrl, setBgMusicUrl] = useState("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
  const [bgVolume, setBgVolume] = useState(0.2);
  const [customMusicUrl, setCustomMusicUrl] = useState<string | null>(null);

  // Subtitle styling and word level highlighting
  const [subtitleStyle, setSubtitleStyle] = useState("yellow-classic");
  const [spokenWordIdx, setSpokenWordIdx] = useState(-1);

  // Advanced Voice configurations
  const [selectedVoice, setSelectedVoice] = useState("Professional Female");
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voiceVolume, setVoiceVolume] = useState(0.9);
  const [voiceLanguage, setVoiceLanguage] = useState("English");
  const [voiceEmotion, setVoiceEmotion] = useState("Neutral");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load shared drafts from chat orchestrator
  useEffect(() => {
    if (videoDraft) {
      setStory(videoDraft);
      setVideoDraft("");
    }
  }, [videoDraft, setVideoDraft]);

  const styles = [
    "Cinematic", "Documentary", "Pixar", "Anime", "Cartoon", "Realistic", 
    "3D", "Watercolor", "Comic", "Cyberpunk", "Luxury Commercial", 
    "Social Media Reel", "Instagram Reel", "YouTube Explainer", "TikTok Style", "News Report"
  ];

  const voices = [
    // Female
    "Natural Female", "Young Female", "Professional Female", "Story Narrator", "News Anchor",
    // Male
    "Professional Male", "Documentary Narrator", "Motivational Speaker", "Business Presenter",
    // Child
    "Child Boy", "Child Girl"
  ];

  const languages = [
    "English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", 
    "Bengali", "Spanish", "French", "Japanese", "Arabic"
  ];

  const subtitleStyles = [
    { id: "yellow-classic", label: "Yellow Classic" },
    { id: "netflix-white", label: "Netflix White" },
    { id: "tiktok-bold", label: "TikTok Bold Style" },
    { id: "neon-glow", label: "Neon Cyberpunk" }
  ];

  const ratios = [
    { label: "16:9 Landscape (YouTube)", val: "16:9" },
    { label: "9:16 Portrait (TikTok/Reels)", val: "9:16" },
    { label: "1:1 Square (Instagram)", val: "1:1" }
  ];

  // Storyboard compiler generator
  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.trim() && !uploadedImage && !token) return;

    setLoading(true);
    setStoryboard([]);
    setVideoAsset(null);
    setCurrentSceneIdx(0);
    setProgressPercent(0);
    setIsPlaying(false);

    // Initialize progress bars
    setPipelineSteps([
      { name: "Generating Script", progress: 0, status: "active" },
      { name: "Generating Scenes", progress: 0, status: "idle" },
      { name: "Generating Images", progress: 0, status: "idle" },
      { name: "Generating Narration", progress: 0, status: "idle" },
      { name: "Rendering Video", progress: 0, status: "idle" }
    ]);

    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      setPipelineSteps((prev) => {
        const nextSteps = [...prev];
        const stepObj = nextSteps[stepIdx];
        if (!stepObj) {
          clearInterval(stepInterval);
          return prev;
        }

        if (stepObj.progress < 100) {
          stepObj.progress = Math.min(100, stepObj.progress + 20);
          stepObj.status = "active";
        } else {
          stepObj.status = "completed";
          stepIdx++;
          if (nextSteps[stepIdx]) {
            nextSteps[stepIdx].status = "active";
            nextSteps[stepIdx].progress = 20;
          }
        }
        return nextSteps;
      });
    }, 400); // 400ms * 5 ticks per step * 5 steps = 10s total matching backend compile duration

    try {
      let finalStory = story;
      if (videoType === "image" && uploadedImage) {
        finalStory = `Animate the uploaded visual asset: Zooming and panning slowly on the details of this image, showing dynamic particles. Style: ${style}`;
      }

      const res = await fetch(`${API_URL}/api/video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ story: finalStory, style, ratio, voice: selectedVoice })
      });
      const data = await res.json();
      
      setTimeout(() => {
        clearInterval(stepInterval);
        if (res.ok) {
          if (videoType === "image" && uploadedImage && data.storyboard?.length > 0) {
            data.storyboard[0].imageUrl = uploadedImage;
          }
          setStoryboard(data.storyboard);
          setVideoAsset(data.videoAsset);
        } else {
          alert(data.error || "Synthesis failed.");
        }
        setLoading(false);
      }, 10000 - (stepIdx * 2000)); // calculate remainder

    } catch (err) {
      clearInterval(stepInterval);
      setLoading(false);
      console.error(err);
    }
  };

  // Web Speech synthesis voice matching engine
  const speakSceneText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose correct language code
    const langCodes: Record<string, string> = {
      "English": "en-US",
      "Hindi": "hi-IN",
      "Telugu": "te-IN",
      "Tamil": "ta-IN",
      "Kannada": "kn-IN",
      "Malayalam": "ml-IN",
      "Bengali": "bn-IN",
      "Spanish": "es-ES",
      "French": "fr-FR",
      "Japanese": "ja-JP",
      "Arabic": "ar-SA"
    };
    utterance.lang = langCodes[voiceLanguage] || "en-US";
    
    utterance.pitch = voicePitch;
    utterance.rate = voiceRate;
    utterance.volume = voiceVolume;

    // Filter available system voices
    const voicesList = window.speechSynthesis.getVoices();
    let matchedVoice = null;
    
    const lowerVoice = selectedVoice.toLowerCase();
    const isFemale = lowerVoice.includes("female") || lowerVoice.includes("girl") || lowerVoice.includes("anchor") || lowerVoice.includes("storyteller");
    const isChild = lowerVoice.includes("child") || lowerVoice.includes("boy") || lowerVoice.includes("girl");

    let filteredVoices = voicesList.filter(v => v.lang.startsWith(utterance.lang.substring(0, 2)));
    if (filteredVoices.length === 0) filteredVoices = voicesList;

    if (isChild) {
      matchedVoice = filteredVoices.find(v => v.name.toLowerCase().includes("child") || v.name.toLowerCase().includes("kid") || v.name.toLowerCase().includes("girl"));
    } else if (isFemale) {
      matchedVoice = filteredVoices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("hazel") || v.name.toLowerCase().includes("female"));
    } else {
      matchedVoice = filteredVoices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("mark") || v.name.toLowerCase().includes("male"));
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    
    // Dynamic rate changes for emotion
    if (voiceEmotion === "Energetic") {
      utterance.rate = Math.min(2, voiceRate * 1.2);
      utterance.pitch = Math.min(2, voicePitch * 1.05);
    } else if (voiceEmotion === "Dramatic") {
      utterance.rate = Math.max(0.5, voiceRate * 0.8);
      utterance.pitch = Math.max(0.5, voicePitch * 0.95);
    } else if (voiceEmotion === "Sad") {
      utterance.rate = Math.max(0.5, voiceRate * 0.75);
      utterance.pitch = Math.max(0.5, voicePitch * 0.85);
    }

    // Word boundary index listener
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const words = text.split(" ");
        let charCount = 0;
        let wordIdx = 0;
        for (let i = 0; i < words.length; i++) {
          charCount += words[i].length + 1;
          if (event.charIndex < charCount) {
            wordIdx = i;
            break;
          }
        }
        setSpokenWordIdx(wordIdx);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Video playback loop
  useEffect(() => {
    let playTimer: NodeJS.Timeout;
    if (isPlaying && storyboard.length > 0) {
      const activeScene = storyboard[currentSceneIdx];
      const durationMs = (activeScene?.duration || 6) * 1000;

      speakSceneText(activeScene?.narratorText || "");

      if (audioRef.current) {
        audioRef.current.src = customMusicUrl || bgMusicUrl;
        audioRef.current.volume = bgVolume;
        audioRef.current.play().catch(() => {});
      }

      playTimer = setInterval(() => {
        setCurrentSceneIdx((prevIdx) => {
          if (prevIdx >= storyboard.length - 1) {
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.pause();
            return 0;
          }
          return prevIdx + 1;
        });
      }, durationMs);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      clearInterval(playTimer);
    };
  }, [isPlaying, currentSceneIdx, storyboard, selectedVoice, voiceLanguage, voicePitch, voiceRate, voiceEmotion, bgMusicUrl, customMusicUrl, bgVolume]);

  // Sync progress indicator bar
  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    const activeScene = storyboard[currentSceneIdx];
    const durationMs = (activeScene?.duration || 6) * 1000;

    if (isPlaying) {
      setProgressPercent(0);
      const intervalMs = 100;
      const stepValue = (intervalMs / durationMs) * 100;
      progressTimer = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 100) return 0;
          return prev + stepValue;
        });
      }, intervalMs);
    } else {
      setProgressPercent(0);
    }
    return () => clearInterval(progressTimer);
  }, [isPlaying, currentSceneIdx, storyboard]);

  // Handle mock image upload for Image-to-Video
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Background music custom MP3 uploader
  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const musicUrl = URL.createObjectURL(file);
      setCustomMusicUrl(musicUrl);
      alert(`Custom audio "${file.name}" loaded successfully as background track!`);
    }
  };

  // Storyboard editing triggers
  const handleUpdateSceneText = (index: number, text: string) => {
    const updated = [...storyboard];
    updated[index].narratorText = text;
    updated[index].subtitle = text.substring(0, 45) + "...";
    setStoryboard(updated);
  };

  const handleUpdateScenePrompt = (index: number, promptText: string) => {
    const updated = [...storyboard];
    updated[index].visualDescription = promptText;
    setStoryboard(updated);
  };

  const handleRegenerateSceneImage = (index: number) => {
    const updated = [...storyboard];
    const cleanPrompt = encodeURIComponent(`${updated[index].visualDescription}. Camera Angle: ${updated[index].cameraAngle}, Lighting: ${updated[index].lighting}, Composition: ${updated[index].composition}, Style: ${style}`);
    updated[index].imageUrl = `https://image.pollinations.ai/p/${cleanPrompt}?width=1024&height=576&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
    setStoryboard(updated);
  };

  const handleMoveScene = (index: number, direction: "up" | "down") => {
    const updated = [...storyboard];
    if (direction === "up" && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === "down" && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    updated.forEach((s, i) => s.sceneNumber = i + 1);
    setStoryboard(updated);
  };

  const handleUpdateSceneDuration = (index: number, duration: number) => {
    const updated = [...storyboard];
    updated[index].duration = Math.max(1, duration);
    setStoryboard(updated);
  };

  const handleUpdateSceneTransition = (index: number, transition: string) => {
    const updated = [...storyboard];
    updated[index].transition = transition;
    setStoryboard(updated);
  };

  // Subtitle highlights builder
  const renderHighlightedSubtitles = (text: string) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.map((word, idx) => {
      const isHighlighted = spokenWordIdx === idx;
      return (
        <span
          key={idx}
          className={`mx-0.5 transition-all ${
            isHighlighted
              ? "text-yellow-400 font-extrabold scale-110 underline decoration-violet-500 underline-offset-4"
              : ""
          }`}
        >
          {word}
        </span>
      );
    });
  };

  // VTT/SRT Exports
  const handleExportSubtitles = (format: "srt" | "vtt") => {
    if (storyboard.length === 0) return;
    let srtText = "";
    let timeAccumulator = 0;

    storyboard.forEach((scene, index) => {
      const start = timeAccumulator;
      const end = timeAccumulator + (scene.duration || 6);
      timeAccumulator = end;

      const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600).toString().padStart(2, "0");
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
        const s = Math.floor(secs % 60).toString().padStart(2, "0");
        const ms = "000";
        return `${h}:${m}:${s}${format === "srt" ? "," : "."}${ms}`;
      };

      if (format === "srt") {
        srtText += `${index + 1}\n${formatTime(start)} --> ${formatTime(end)}\n${scene.narratorText}\n\n`;
      } else {
        if (index === 0) srtText += "WEBVTT\n\n";
        srtText += `${index + 1}\n${formatTime(start)} --> ${formatTime(end)}\n${scene.narratorText}\n\n`;
      }
    });

    const blob = new Blob([srtText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `creatorverse-subtitles.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMockMP4 = () => {
    alert("Synthesizing narration and compiling storyboard scenes into a continuous MP4 video... Download will start automatically.");
    const link = document.createElement("a");
    link.href = "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-server-nodes-31848-large.mp4";
    link.download = "creatorverse-video.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-12">
      {/* Settings Input Panel */}
      <div className="glass-panel p-6 rounded-3xl space-y-6 h-fit">
        <div className="flex items-center gap-2 text-white font-bold border-b border-white/5 pb-4">
          <Film className="w-5 h-5 text-violet-400" />
          <span>AI Video Studio</span>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl">
          {[
            { id: "text", label: "Text-to-Video" },
            { id: "article", label: "Article-to-Video" },
            { id: "image", label: "Image-to-Video" }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setVideoType(t.id);
                setStoryboard([]);
                setVideoAsset(null);
              }}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                videoType === t.id ? "bg-violet-600/30 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleGenerateVideo} className="space-y-5">
          {videoType !== "image" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                {videoType === "article" ? "Paste Article Content, PDF text, or Topic URL" : "Narrative Story Script"}
              </label>
              <textarea
                required
                rows={5}
                placeholder={
                  videoType === "article"
                    ? "Paste blog text or enter a research paper topic. The system will summarize and write a storyboard screenplay automatically."
                    : "e.g. 'A futuristic city glowing under auroras. Flying cars cruise through neon skyscrapers while robots code on transparent displays...'"
                }
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300">Upload Image to Animate</label>
              <div className="p-6 border-2 border-dashed border-white/10 hover:border-violet-500/30 rounded-2xl text-center bg-white/[0.01] transition-all relative">
                {uploadedImage ? (
                  <div className="space-y-2">
                    <img src={uploadedImage} alt="Uploaded source" className="max-h-32 object-cover mx-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="text-[10px] text-rose-400 font-semibold hover:underline block mx-auto cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <span className="text-xs text-zinc-400 block font-medium">Drag or Click to upload</span>
                    <span className="text-[9px] text-zinc-600 block mt-1">PNG, JPG up to 10MB</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Animation style */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Visual Aesthetic Style</label>
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
            <label className="text-xs font-semibold text-zinc-300">Video Framing Format</label>
            <div className="grid grid-cols-1 gap-2">
              {ratios.map(r => (
                <button
                  type="button"
                  key={r.val}
                  onClick={() => setRatio(r.val)}
                  className={`py-2 px-3 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                    ratio === r.val
                      ? "bg-violet-600/20 border-violet-500 text-violet-300"
                      : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (!story.trim() && !uploadedImage)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
                <span>Generating screenplay...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compile AI Video Project</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Media Player and storyboard column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Step-by-Step Loaders progress panel */}
        {loading && (
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-400">
              <span className="w-4 h-4 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin shrink-0" />
              <span>Multi-Agent Production Pipeline rendering...</span>
            </div>
            <div className="space-y-3">
              {pipelineSteps.map((step, idx) => {
                const isActive = step.status === "active";
                const isCompleted = step.status === "completed";
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className={isActive ? "text-white" : isCompleted ? "text-emerald-400" : "text-zinc-500"}>
                        {step.name}
                      </span>
                      <span className={isCompleted ? "text-emerald-400" : "text-zinc-500"}>
                        {isCompleted ? "COMPLETED" : `${step.progress}%`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${step.progress}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted
                            ? "bg-emerald-500"
                            : isActive
                            ? "bg-violet-500"
                            : "bg-white/10"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Video Player */}
        {storyboard.length > 0 && !loading && (
          <div className="glass-panel p-6 rounded-3xl space-y-6 relative overflow-hidden">
            {/* Background Audio track */}
            <audio ref={(el) => { audioRef.current = el; }} loop />

            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider pl-1">AI Explainer Canvas</span>
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest bg-violet-400/10 px-2 py-0.5 rounded border border-violet-400/20">
                Scene {currentSceneIdx + 1} of {storyboard.length} • {storyboard[currentSceneIdx]?.transition} Transition
              </span>
            </div>

            {/* Video Viewport player */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video flex items-center justify-center max-h-[380px] mx-auto shadow-2xl">
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img
                  src={storyboard[currentSceneIdx]?.imageUrl}
                  alt=""
                  className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                    isPlaying ? "scale-110 translate-y-1" : "scale-100"
                  }`}
                />
              </div>

              <div className="absolute inset-0 bg-black/25 pointer-events-none" />

              {/* dynamic synchronized subtitles overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-center z-10">
                <span className={`px-4 py-1.5 rounded-lg font-bold shadow-xl leading-relaxed max-w-lg inline-block text-xs border border-white/10 ${
                  subtitleStyle === "yellow-classic" ? "bg-black/80 text-yellow-300" :
                  subtitleStyle === "netflix-white" ? "bg-black/70 text-white" :
                  subtitleStyle === "tiktok-bold" ? "bg-yellow-400 text-black uppercase font-black tracking-wide" :
                  "bg-black/90 text-emerald-400 font-mono shadow-emerald-500/20"
                }`}>
                  {renderHighlightedSubtitles(storyboard[currentSceneIdx]?.narratorText || "")}
                </span>
              </div>

              {/* Playback trigger cover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/35 hover:opacity-100 opacity-0 transition-opacity">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current text-zinc-950" /> : <Play className="w-6 h-6 fill-current text-zinc-950 ml-1" />}
                </button>
              </div>
            </div>

            {/* Timeline progress segmented bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-1">
                <span>00:00</span>
                <span>
                  {storyboard.reduce((acc, s) => acc + (s.duration || 6), 0)}s duration
                </span>
              </div>
              
              <div className="grid grid-cols-5 gap-1.5 h-3 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
                {storyboard.map((_, idx) => {
                  const isActive = currentSceneIdx === idx;
                  const isPassed = currentSceneIdx > idx;
                  return (
                    <div key={idx} className="relative h-full w-full bg-white/[0.02] rounded-full overflow-hidden">
                      <div
                        style={{
                          width: isActive ? `${progressPercent}%` : isPassed ? "100%" : "0%"
                        }}
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-100 ease-out"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subtitle Formatter & Audio tracks panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Voice selectors */}
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block border-b border-white/5 pb-2">Narrator Voice Controls</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase">Voice Model</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px]"
                    >
                      {voices.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase">Accent / Language</label>
                    <select
                      value={voiceLanguage}
                      onChange={(e) => setVoiceLanguage(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px]"
                    >
                      {languages.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase">Speed</label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.1"
                      value={voiceRate}
                      onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase">Pitch</label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.1"
                      value={voicePitch}
                      onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase">Emotion</label>
                    <select
                      value={voiceEmotion}
                      onChange={(e) => setVoiceEmotion(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-1 text-[9px]"
                    >
                      {["Neutral", "Energetic", "Dramatic", "Sad"].map(em => (
                        <option key={em} value={em}>{em}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Music Mixer & Subtitle Styles */}
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block border-b border-white/5 pb-2">Subtitles & Music</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase">Subtitle Style</label>
                    <select
                      value={subtitleStyle}
                      onChange={(e) => setSubtitleStyle(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px]"
                    >
                      {subtitleStyles.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase">BG Music</label>
                    <select
                      value={bgMusicUrl}
                      onChange={(e) => setBgMusicUrl(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px]"
                    >
                      <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3">Corporate Electronic</option>
                      <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3">Cyberpunk Tech Beat</option>
                      <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3">Epic Orchestral Symphony</option>
                      <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3">Nature Relaxing Acoustic</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs gap-3">
                  <label className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded border border-white/5 cursor-pointer text-[10px]">
                    <Music className="w-3.5 h-3.5 text-violet-400" />
                    <span>Upload Custom Music</span>
                    <input type="file" accept="audio/*" onChange={handleMusicUpload} className="hidden" />
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={bgVolume}
                      onChange={(e) => setBgVolume(parseFloat(e.target.value))}
                      className="w-16 accent-violet-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action exports */}
            <div className="flex flex-wrap justify-between items-center border-t border-white/5 pt-4 gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/5 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} Play Preview
                </button>
                
                <button
                  onClick={() => handleExportSubtitles("srt")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl text-[10px] font-semibold transition-all border border-white/5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" /> SRT Subtitles
                </button>
                <button
                  onClick={() => handleExportSubtitles("vtt")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl text-[10px] font-semibold transition-all border border-white/5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> VTT Subtitles
                </button>
              </div>

              <button
                onClick={handleExportMockMP4}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-lg hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export Video (MP4)
              </button>
            </div>
          </div>
        )}

        {/* Screenplay Timeline Editor */}
        {storyboard.length > 0 && !loading && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Screenplay Timeline Editor</h4>
              <span className="text-[10px] text-zinc-500 font-medium">Reorder scenes, edit scripts, regenerate visuals, and sync durations.</span>
            </div>
            
            <div className="space-y-4">
              {storyboard.map((scene, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentSceneIdx(idx)}
                  className={`p-5 glass-panel rounded-2xl space-y-4 hover:border-violet-500/25 transition-all cursor-pointer ${
                    currentSceneIdx === idx ? "border-violet-500/40 bg-white/[0.02]" : "border-transparent"
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Scene thumbnail & actions */}
                    <div className="w-full md:w-40 h-24 bg-white/5 rounded-xl border border-white/5 overflow-hidden shrink-0 relative flex items-center justify-center group/thumb">
                      <img src={scene.imageUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRegenerateSceneImage(idx); }}
                          className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg transition-all"
                          title="Regenerate scene visual with random seed"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 text-[8px] font-extrabold text-white bg-black/80 px-2 py-0.5 rounded border border-white/5 uppercase">
                        Scene {scene.sceneNumber}
                      </span>
                    </div>

                    {/* Timeline text editing forms */}
                    <div className="flex-1 space-y-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-[8px] text-violet-400 font-extrabold uppercase block tracking-wider">Narrator Narrative Voiceover</span>
                        <textarea
                          rows={2}
                          value={scene.narratorText}
                          onChange={(e) => handleUpdateSceneText(idx, e.target.value)}
                          className="w-full px-3 py-1.5 bg-black/20 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-none"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[8px] text-indigo-400 font-extrabold uppercase block tracking-wider">Visual Prompt Description</span>
                        <input
                          type="text"
                          value={scene.visualDescription}
                          onChange={(e) => handleUpdateScenePrompt(idx, e.target.value)}
                          className="w-full px-3 py-1.5 bg-black/20 border border-white/10 rounded-lg text-[10px] text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scene metadata controller bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 uppercase">Duration:</span>
                      <input
                        type="number"
                        min="2"
                        max="20"
                        value={scene.duration}
                        onChange={(e) => handleUpdateSceneDuration(idx, parseInt(e.target.value))}
                        className="w-12 bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-white"
                      />
                      <span className="text-zinc-500">s</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 uppercase">Transition:</span>
                      <select
                        value={scene.transition}
                        onChange={(e) => handleUpdateSceneTransition(idx, e.target.value)}
                        className="bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-white"
                      >
                        {["Fade", "Slide Left", "Zoom In", "None"].map(tr => (
                          <option key={tr} value={tr}>{tr}</option>
                        ))}
                      </select>
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1.5 md:col-span-2 md:justify-end">
                      <span className="text-zinc-500 uppercase mr-1">Move:</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveScene(idx, "up"); }}
                        disabled={idx === 0}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveScene(idx, "down"); }}
                        disabled={idx === storyboard.length - 1}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!videoAsset && !loading && (
          <div className="glass-panel p-12 rounded-3xl min-h-[350px] flex flex-col justify-center items-center text-center space-y-3 bg-black/20">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/5 text-zinc-600">
              <VideoIcon className="w-5 h-5" />
            </div>
            <p className="text-zinc-500 text-xs font-medium">Compile your script, article, or image settings to synth the video timeline player.</p>
          </div>
        )}
      </div>
    </div>
  );
}
