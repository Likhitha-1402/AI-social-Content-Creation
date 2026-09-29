"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";

// Components
import Auth from "../components/Auth";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import ChatStudio from "../components/ChatStudio";
import ImageStudio from "../components/ImageStudio";
import VideoStudio from "../components/VideoStudio";
import SocialStudio from "../components/SocialStudio";
import ContentCalendar from "../components/ContentCalendar";
import BrandVoiceSettings from "../components/BrandVoiceSettings";
import ArticleStudio from "../components/ArticleStudio";
import StoryToEverything from "../components/StoryToEverything";
import SecurityStudio from "../components/SecurityStudio";

export default function Home() {
  const { token, activeTab, setActiveTab } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Render Auth form if not logged in
  if (!token) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen flex bg-[#07070a] text-zinc-100 overflow-hidden relative font-sans">
      {/* Background Aurora glowing particles */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none z-0" />

      {/* Floating Glass Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto h-screen relative z-10 no-scrollbar">
        {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === "chat" && <ChatStudio />}
        {activeTab === "image" && <ImageStudio />}
        {activeTab === "video" && <VideoStudio />}
        {activeTab === "article" && <ArticleStudio />}
        {activeTab === "storytoeverything" && <StoryToEverything />}
        {activeTab === "social" && <SocialStudio />}
        {activeTab === "calendar" && <ContentCalendar />}
        {activeTab === "brand" && <BrandVoiceSettings />}
        {activeTab === "security" && <SecurityStudio />}
      </main>
    </div>
  );
}
