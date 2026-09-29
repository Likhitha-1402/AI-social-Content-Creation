"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { API_URL } from "../utils/api";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Send,
  Clock,
  CheckCircle,
  Filter
} from "lucide-react";

// Inline brand SVGs since Lucide-React v0.400+ removed social icons
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

export default function ContentCalendar() {
  const { token } = useStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Post Form
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostPlatform, setNewPostPlatform] = useState("linkedin");
  const [newPostDate, setNewPostDate] = useState("");

  const fetchPosts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !newPostDate || !token) return;

    try {
      const res = await fetch(`${API_URL}/api/calendar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          platforms: newPostPlatform,
          content: newPostContent,
          scheduledTime: new Date(newPostDate).toISOString(),
          status: "scheduled"
        })
      });

      if (res.ok) {
        setNewPostContent("");
        setNewPostDate("");
        setShowAddModal(false);
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/calendar/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishNow = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/calendar/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "published" })
      });
      if (res.ok) {
        fetchPosts();
        alert("Post published successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (filterPlatform === "all") return true;
    return p.platforms.toLowerCase().includes(filterPlatform);
  });

  const getPlatformIcon = (platformStr: string) => {
    const lower = platformStr.toLowerCase();
    if (lower.includes("linkedin")) return <Linkedin className="w-4 h-4 text-sky-400" />;
    if (lower.includes("instagram")) return <Instagram className="w-4 h-4 text-pink-400" />;
    if (lower.includes("x") || lower.includes("twitter")) return <Twitter className="w-4 h-4 text-zinc-300" />;
    return <CalendarIcon className="w-4 h-4 text-violet-400" />;
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Content Scheduler</h2>
          <p className="text-zinc-400 mt-1">Manage, filter, and plan your multi-platform social calendar.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Calendar Entry
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Filter Platform:</span>
        </div>

        <div className="flex gap-2">
          {[
            { id: "all", name: "All Channels" },
            { id: "linkedin", name: "LinkedIn" },
            { id: "instagram", name: "Instagram" },
            { id: "x", name: "X (Twitter)" }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterPlatform(btn.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filterPlatform === btn.id
                  ? "bg-violet-600/20 border-violet-500 text-violet-300"
                  : "bg-white/[0.01] border-white/5 text-zinc-400 hover:bg-white/5"
              }`}
            >
              {btn.name}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid Representation & Items list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly visual cards layout */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider pl-1">Weekly Grid View</h4>
          
          <div className="grid grid-cols-7 gap-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              // Get posts for this specific day index offset from today
              const today = new Date();
              const currentDayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
              const targetDayOffset = i + 1 - (currentDayOfWeek === 0 ? 7 : currentDayOfWeek);
              const dateForDay = new Date();
              dateForDay.setDate(today.getDate() + targetDayOffset);

              const postsForDay = posts.filter(p => {
                const pDate = new Date(p.scheduledTime);
                return pDate.getDate() === dateForDay.getDate() && pDate.getMonth() === dateForDay.getMonth();
              });

              return (
                <div
                  key={i}
                  className="glass-panel p-3 rounded-2xl min-h-[160px] flex flex-col justify-between hover:border-white/10 transition-colors"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{day}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{dateForDay.getDate()}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 py-2 no-scrollbar">
                    {postsForDay.map(post => (
                      <div
                        key={post.id}
                        className="p-1 rounded bg-violet-600/10 border border-violet-500/20 flex items-center justify-between gap-1"
                        title={post.content}
                      >
                        <span className="truncate text-[9px] text-zinc-300 font-medium">
                          {post.content}
                        </span>
                        {getPlatformIcon(post.platforms)}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const formattedDate = dateForDay.toISOString().split("T")[0] + "T12:00";
                      setNewPostDate(formattedDate);
                      setShowAddModal(true);
                    }}
                    className="w-full text-center text-[10px] text-violet-400 hover:text-white font-semibold pt-2 border-t border-white/5 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed scheduled queue */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider pl-1">Scheduled Queue Details</h4>
          
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="glass-panel p-12 text-center text-zinc-500 text-xs rounded-3xl">
                No entries scheduled for this filter.
              </div>
            ) : (
              filteredPosts.map(post => {
                const isPublished = post.status === "published";
                return (
                  <div
                    key={post.id}
                    className="p-5 glass-panel rounded-2xl space-y-4 hover:border-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platforms)}
                        <span className="text-[10px] font-extrabold uppercase text-zinc-300 tracking-wider">
                          {post.platforms}
                        </span>
                      </div>
                      
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        isPublished
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}>
                        {post.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-2.5 text-[10px] text-zinc-500 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{new Date(post.scheduledTime).toLocaleString()}</span>
                    </div>

                    {/* Operations */}
                    <div className="flex justify-between items-center border-t border-white/5 pt-3">
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {!isPublished && (
                        <button
                          onClick={() => handlePublishNow(post.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-lg text-[10px] font-bold border border-white/5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> Publish Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Scheduler Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 glass-panel rounded-3xl space-y-6">
            <h3 className="text-base font-bold text-white">Create New Schedule Item</h3>

            <form onSubmit={handleAddPost} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Publish Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Insert post copy..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Platform</label>
                  <select
                    value={newPostPlatform}
                    onChange={(e) => setNewPostPlatform(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="x">X (Twitter)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newPostDate}
                    onChange={(e) => setNewPostDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer"
                >
                  Add Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
