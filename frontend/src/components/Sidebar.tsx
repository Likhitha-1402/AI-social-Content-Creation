"use client";

import React from "react";
import { useStore } from "../store/useStore";
import {
  LayoutDashboard,
  MessageSquare,
  Image as ImageIcon,
  Video as VideoIcon,
  Calendar as CalendarIcon,
  Share2,
  Volume2,
  LogOut,
  Sparkles,
  FileText,
  Shield
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, logout } = useStore();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "chat", label: "AI Chat Studio", icon: MessageSquare },
    { id: "image", label: "AI Image Studio", icon: ImageIcon },
    { id: "video", label: "AI Video Studio", icon: VideoIcon },
    { id: "article", label: "AI Article Studio", icon: FileText },
    { id: "storytoeverything", label: "Story-to-Everything", icon: Sparkles },
    { id: "social", label: "Social AI Studio", icon: Share2 },
    { id: "calendar", label: "Content Calendar", icon: CalendarIcon },
    { id: "brand", label: "Brand Voice Settings", icon: Volume2 },
    { id: "security", label: "Security & Audit Logs", icon: Shield },
  ];

  return (
    <aside className="w-72 glass-panel m-4 mr-0 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl z-20 border-r border-white/10 shrink-0">
      <div>
        {/* Branding header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
              CreatorVerse
            </h1>
            <span className="text-xs text-indigo-400 font-medium tracking-wide">
              AI CONTENT STUDIO
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-300 border-l-2 border-violet-500 pl-3.5"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-violet-400" : "text-zinc-400 group-hover:text-white"
                  }`}
                />
                {item.label}
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-white/5 bg-black/10">
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors duration-200">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-indigo-900/50 flex items-center justify-center border border-indigo-500/20 text-indigo-300 font-bold uppercase shrink-0 text-sm">
              {user?.email?.charAt(0) || "C"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-zinc-300 truncate">
                Creator Account
              </span>
              <span className="text-[10px] text-zinc-500 truncate">
                {user?.email || "guest@creatorverse.ai"}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
