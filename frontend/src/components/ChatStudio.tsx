"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import io from "socket.io-client";
import { API_URL } from "../utils/api";
import {
  MessageSquare,
  Send,
  Paperclip,
  Pin,
  Trash2,
  Edit3,
  FileText,
  Sparkles,
  Copy,
  Calendar,
  Download,
  Terminal,
  TrendingUp,
  Cpu,
  Bookmark,
  Plus,
  RefreshCw,
  Share2
} from "lucide-react";

export default function ChatStudio() {
  const {
    token,
    activeSessionId,
    setActiveSessionId,
    setActiveTab,
    setVideoDraft,
    setSocialDraft,
    setArticleDraft,
    setImageDraft
  } = useStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState("general");
  const [tone, setTone] = useState("Professional");
  
  // Multi-Agent states
  const [agentLogs, setAgentLogs] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit / Action States
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Suggested Prompts
  const suggestedPrompts = [
    { text: "Write a high-converting LinkedIn post about AI agents", icon: Sparkles },
    { text: "Draft an Instagram caption with viral hashtags about a new launch", icon: TrendingUp },
    { text: "Turn a brief topic into an optimized Twitter thread", icon: MessageSquare }
  ];

  // Fetch Sessions
  const fetchSessions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSessions(data);
        if (data.length > 0 && !activeSessionId) {
          setActiveSessionId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Messages for active session
  const fetchMessages = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/chats/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [token]);

  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
      setAgentLogs([]);
      
      // Connect Socket.io for real-time agent updates
      socketRef.current = io(API_URL);
      socketRef.current.emit("join-chat", activeSessionId);

      socketRef.current.on("agent-progress", (progress: any) => {
        setAgentLogs((prev) => {
          // Prevent duplicates by checking name and status
          const exists = prev.some(
            (p) => p.agentName === progress.agentName && p.status === progress.status
          );
          if (exists) return prev;
          return [...prev, progress];
        });
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.emit("leave-chat", activeSessionId);
          socketRef.current.disconnect();
        }
      };
    }
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentLogs]);

  // Create new session
  const handleCreateSession = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: `Session ${sessions.length + 1}` })
      });
      const newSession = await res.json();
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newSession.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Pinned
  const handleTogglePin = async (id: string, isPinned: boolean) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/chats/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPinned: !isPinned })
      });
      fetchSessions();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Session
  const handleDeleteSession = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/chats/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
      fetchSessions();
    } catch (err) {
      console.error(err);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if ((!text.trim() && !file) || isGenerating || !token) return;

    setIsGenerating(true);
    setAgentLogs([]);
    setInputText("");
    setFile(null);

    const formData = new FormData();
    formData.append("content", text);
    formData.append("platform", platform);
    formData.append("toneOverride", tone);
    if (file) {
      formData.append("file", file);
    }

    try {
      // Optimistic add user message locally
      const mockUserMsg = {
        id: "temp-user",
        role: "user",
        content: text,
        fileName: file ? file.name : null,
        fileType: file ? file.type : null,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, mockUserMsg]);

      if (!file) {
        // Stream AI response via SSE /api/chat
        const res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            content: text,
            sessionId: activeSessionId,
            platform,
            toneOverride: tone
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to initiate chat stream");
        }

        if (!res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let streamedResponseText = "";

        // Insert temporary assistant placeholder message
        const assistantTempId = "temp-assistant";
        setMessages((prev) => [
          ...prev,
          {
            id: assistantTempId,
            role: "assistant",
            content: "",
            createdAt: new Date().toISOString()
          }
        ]);

        let finalSessionId = activeSessionId;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(Boolean);

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === "session") {
                if (parsed.sessionId !== finalSessionId) {
                  finalSessionId = parsed.sessionId;
                  setActiveSessionId(parsed.sessionId);
                  fetchSessions();
                }
              } else if (parsed.type === "chunk") {
                streamedResponseText += parsed.text;
                
                // Formulate simulated structured representation to let the UI parse it
                const simulatedJSON = JSON.stringify({
                  optimizedContent: streamedResponseText,
                  rawContent: streamedResponseText,
                  hashtags: [],
                  cta: "Join the conversation below!",
                  readabilityScore: 90,
                  viralityScore: 85,
                  engagementScore: 88,
                  suggestedPostingTimes: []
                });

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantTempId
                      ? { ...msg, content: simulatedJSON }
                      : msg
                  )
                );
              } else if (parsed.type === "done") {
                if (finalSessionId) {
                  fetchMessages(finalSessionId);
                }
              }
            } catch (err) {
              // chunk json parse error
            }
          }
        }
      } else {
        // Standard multipart file send
        const res = await fetch(`${API_URL}/api/chats/${activeSessionId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        const data = await res.json();
        
        if (res.ok) {
          fetchMessages(activeSessionId!);
        } else {
          throw new Error(data.error || "Message delivery failed");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export content
  const handleExportMarkdown = (text: string) => {
    let content = text;
    try {
      const parsed = JSON.parse(text);
      content = parsed.optimizedContent || parsed.rawContent;
    } catch (e) {}

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "creatorverse-output.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add output to calendar
  const handleScheduleContent = async (text: string) => {
    if (!token) return;
    let content = text;
    try {
      const parsed = JSON.parse(text);
      content = parsed.optimizedContent || parsed.rawContent;
    } catch (e) {}

    try {
      const date = new Date();
      date.setDate(date.getDate() + 1); // tomorrow as default

      const response = await fetch(`${API_URL}/api/calendar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          platforms: platform === "general" ? "linkedin" : platform,
          content,
          scheduledTime: date.toISOString(),
          status: "draft"
        })
      });

      if (response.ok) {
        alert("Draft scheduled successfully! View it in the Content Calendar tab.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBookmark = async (msgId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/chats/messages/${msgId}/bookmark`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMessages(activeSessionId!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerateResponse = async (msgId: string) => {
    if (!token || isGenerating) return;
    setIsGenerating(true);
    setAgentLogs([]);
    try {
      const res = await fetch(`${API_URL}/api/chats/messages/${msgId}/regenerate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMessages(activeSessionId!);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditPromptSubmit = async (msgId: string) => {
    if (!editingText.trim() || !token || isGenerating) return;
    setIsGenerating(true);
    setAgentLogs([]);
    setEditingMessageId(null);
    try {
      const res = await fetch(`${API_URL}/api/chats/messages/${msgId}/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: editingText })
      });
      if (res.ok) {
        fetchMessages(activeSessionId!);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderMarkdown = (content: string) => {
    if (!content) return "";
    
    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const codeLines = part.slice(3, -3).trim().split("\n");
        const lang = codeLines[0]?.match(/^\w+$/) ? codeLines[0] : "";
        const code = codeLines.slice(lang ? 1 : 0).join("\n");
        return (
          <div key={idx} className="my-3 p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-[11px] leading-relaxed text-zinc-300 overflow-x-auto relative">
            <span className="absolute top-2 right-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{lang || "code"}</span>
            <pre>{code}</pre>
          </div>
        );
      }
      
      const lines = part.split("\n");
      let inTable = false;
      let tableRows: string[][] = [];

      const renderedLines = lines.map((line, lIdx) => {
        // Table row detection
        if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
          inTable = true;
          const cols = line.split("|").map(c => c.trim()).filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1);
          if (cols.every(c => c.match(/^[-:]+$/))) {
            return null;
          }
          tableRows.push(cols);
          return null;
        } else if (inTable) {
          inTable = false;
          const rowsToRender = [...tableRows];
          tableRows = [];
          return (
            <div key={`table-${lIdx}`} className="my-3 overflow-x-auto">
              <table className="w-full text-left border-collapse border border-white/10 text-xs">
                <thead>
                  <tr className="bg-white/5">
                    {rowsToRender[0]?.map((h, hIdx) => (
                      <th key={hIdx} className="border border-white/10 p-2 font-bold text-white">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowsToRender.slice(1).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02]">
                      {row.map((col, colIdx) => (
                        <td key={colIdx} className="border border-white/10 p-2 text-zinc-300">{col}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (line.startsWith("### ")) {
          return <h5 key={lIdx} className="text-sm font-bold text-white mt-3 mb-2">{line.replace("### ", "")}</h5>;
        }
        if (line.startsWith("## ")) {
          return <h4 key={lIdx} className="text-base font-extrabold text-white mt-4 mb-2">{line.replace("## ", "")}</h4>;
        }
        if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={lIdx} className="ml-4 list-disc text-xs text-zinc-300 mt-1">
              {line.substring(2)}
            </li>
          );
        }
        if (!line.trim()) {
          return <div key={lIdx} className="h-2" />;
        }
        return <p key={lIdx} className="text-xs text-zinc-300 leading-relaxed mt-1">{line}</p>;
      });

      return (
        <div key={idx} className="space-y-1">
          {renderedLines}
        </div>
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-fade-in relative z-10">
      {/* Sessions Left panel */}
      <div className="w-80 glass-panel rounded-3xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-sm font-bold text-white">Active Sessions</span>
          <button
            onClick={handleCreateSession}
            className="p-2 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600/20 hover:text-white transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
          {sessions.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No sessions yet. Create one!
            </div>
          ) : (
            sessions.map((sess) => {
              const isSelected = activeSessionId === sess.id;
              return (
                <div
                  key={sess.id}
                  onClick={() => setActiveSessionId(sess.id)}
                  className={`group flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-white/[0.04] border border-white/10"
                      : "border border-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isSelected ? "text-violet-400" : "text-zinc-500"}`} />
                    <span className={`text-xs truncate ${isSelected ? "text-white font-semibold" : "text-zinc-400"}`}>
                      {sess.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(sess.id, sess.isPinned);
                      }}
                      className={`p-1 rounded text-zinc-500 hover:text-violet-400 ${sess.isPinned ? "text-violet-500" : ""}`}
                    >
                      <Pin className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(sess.id);
                      }}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat window workspace */}
      <div className="flex-1 glass-panel rounded-3xl flex flex-col justify-between overflow-hidden relative">
        {/* Top bar controls */}
        <div className="p-4 border-b border-white/5 bg-black/10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-300">Target Platform</span>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="general">🤖 Chat Sandbox</option>
              <option value="linkedin">💼 LinkedIn optimized</option>
              <option value="instagram">📸 Instagram Visuals</option>
              <option value="x">🐦 X (Twitter Thread)</option>
              <option value="youtube">▶ YouTube Script</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-300">Tone Profile</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="Professional">Professional</option>
              <option value="Casual">Casual</option>
              <option value="Luxury">Luxury</option>
              <option value="Inspirational">Inspirational</option>
              <option value="Funny">Funny</option>
              <option value="Recruiter-Friendly">Recruiter Friendly</option>
            </select>
          </div>
        </div>

        {/* Message view */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {messages.length === 0 && !isGenerating && (
            <div className="max-w-xl mx-auto py-16 text-center space-y-8 h-full flex flex-col justify-center">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-400">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white">Create Platform-Ready Content</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Your requests are routed through a multi-agent system of research, drafting, brand matching, SEO tags formatting, and QA. Check suggestions below or write naturally.
                </p>
              </div>

              {/* Suggestions chips */}
              <div className="grid grid-cols-1 gap-3">
                {suggestedPrompts.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s.text)}
                      className="p-4 text-left rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-violet-500/30 text-xs text-zinc-300 font-medium transition-all duration-200 flex items-center gap-3 cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-violet-400 shrink-0" />
                      {s.text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages loop */}
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            let displayContent = msg.content;
            let structuredOutput: any = null;
            let parsedDrafts: any = null;

            if (!isUser) {
              try {
                structuredOutput = JSON.parse(msg.content);
                displayContent = structuredOutput.optimizedContent || structuredOutput.rawContent || msg.content;
              } catch (e) {
                // Not JSON
              }

              // Parse campaign draft tags
              const videoMatch = displayContent.match(/\[VIDEO_DRAFT:\s*([\s\S]*?)\]/i);
              const socialMatch = displayContent.match(/\[SOCIAL_DRAFT:\s*([\s\S]*?)\]/i);
              const articleMatch = displayContent.match(/\[ARTICLE_DRAFT:\s*([\s\S]*?)\]/i);
              const imageMatch = displayContent.match(/\[IMAGE_DRAFT:\s*([\s\S]*?)\]/i);

              if (videoMatch || socialMatch || articleMatch || imageMatch) {
                parsedDrafts = {
                  video: videoMatch ? videoMatch[1].trim() : "",
                  social: socialMatch ? socialMatch[1].trim() : "",
                  article: articleMatch ? articleMatch[1].trim() : "",
                  image: imageMatch ? imageMatch[1].trim() : ""
                };
              }

              // Strip draft tags for clean render
              displayContent = displayContent
                .replace(/\[VIDEO_DRAFT:\s*[\s\S]*?\]/gi, "")
                .replace(/\[SOCIAL_DRAFT:\s*[\s\S]*?\]/gi, "")
                .replace(/\[ARTICLE_DRAFT:\s*[\s\S]*?\]/gi, "")
                .replace(/\[IMAGE_DRAFT:\s*[\s\S]*?\]/gi, "")
                .trim();
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                )}

                <div className={`max-w-2xl p-5 rounded-2xl space-y-4 relative group ${
                  isUser
                    ? "bg-gradient-to-tr from-violet-600/30 to-indigo-600/20 border border-violet-500/25 text-white"
                    : "glass-panel text-zinc-100"
                }`}>
                  {isUser ? (
                    editingMessageId === msg.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-semibold text-zinc-300 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditPromptSubmit(msg.id)}
                            className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 rounded text-[10px] font-semibold text-white cursor-pointer"
                          >
                            Save & Send
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{displayContent}</p>
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditingText(msg.content);
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-white bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                          title="Edit Prompt"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      {renderMarkdown(displayContent)}
                    </div>
                  )}

                  {/* Campaign Orchestrator dispatching center */}
                  {!isUser && parsedDrafts && (
                    <div className="mt-4 p-4 rounded-xl border border-violet-500/20 bg-violet-600/5 space-y-3">
                      <div className="flex items-center gap-2 text-white font-semibold text-xs border-b border-white/5 pb-2">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <span>AI Campaign Orchestration Center</span>
                      </div>
                      <p className="text-[10px] text-zinc-400">Specialized agent drafts are ready. Click below to route directly to workrooms:</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {parsedDrafts.video && (
                          <button
                            onClick={() => {
                              setVideoDraft(parsedDrafts.video);
                              setActiveTab("video");
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-semibold cursor-pointer border border-white/5 text-left transition-colors"
                          >
                            🎬 Send to Video Studio
                          </button>
                        )}
                        
                        {parsedDrafts.social && (
                          <button
                            onClick={() => {
                              setSocialDraft(parsedDrafts.social);
                              setActiveTab("social");
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-semibold cursor-pointer border border-white/5 text-left transition-colors"
                          >
                            📱 Send to Social Studio
                          </button>
                        )}
                        
                        {parsedDrafts.article && (
                          <button
                            onClick={() => {
                              setArticleDraft(parsedDrafts.article);
                              setActiveTab("article");
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-semibold cursor-pointer border border-white/5 text-left transition-colors"
                          >
                            📝 Send to Article Studio
                          </button>
                        )}

                        {parsedDrafts.image && (
                          <button
                            onClick={() => {
                              setImageDraft(parsedDrafts.image);
                              setActiveTab("image");
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-semibold cursor-pointer border border-white/5 text-left transition-colors"
                          >
                            🎨 Send to Image Studio
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Render files info if user uploaded */}
                  {isUser && msg.fileUrl && (
                    <div className="p-3 bg-black/20 rounded-xl border border-white/5 flex items-center gap-3 text-zinc-300 text-xs">
                      <FileText className="w-4 h-4 text-violet-400" />
                      <span className="truncate max-w-[200px]">{msg.fileName}</span>
                    </div>
                  )}

                  {/* Render analysis metadata if assistant output */}
                  {!isUser && structuredOutput && (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      {/* KPI Scores */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[9px] text-zinc-500 font-semibold block uppercase">Readability</span>
                          <span className="text-sm font-bold text-emerald-400">{structuredOutput.readabilityScore}%</span>
                        </div>
                        <div className="p-2 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[9px] text-zinc-500 font-semibold block uppercase">Engagement</span>
                          <span className="text-sm font-bold text-violet-400">{structuredOutput.engagementScore}%</span>
                        </div>
                        <div className="p-2 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[9px] text-zinc-500 font-semibold block uppercase">Virality</span>
                          <span className="text-sm font-bold text-indigo-400">{structuredOutput.viralityScore}%</span>
                        </div>
                      </div>

                      {/* Hashtags display */}
                      {structuredOutput.hashtags && structuredOutput.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {structuredOutput.hashtags.map((tag: string, i: number) => (
                            <span key={i} className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleToggleBookmark(msg.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                            msg.isBookmarked ? "text-amber-400 bg-amber-400/10 border border-amber-400/20" : "text-zinc-300"
                          }`}
                        >
                          <Bookmark className={`w-3 h-3 ${msg.isBookmarked ? "fill-current" : ""}`} /> Bookmark
                        </button>
                        <button
                          onClick={() => handleRegenerateResponse(msg.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-semibold text-zinc-300 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Regenerate
                        </button>
                        <button
                          onClick={() => { navigator.clipboard.writeText(displayContent); alert("Copied to clipboard!"); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-semibold text-zinc-300 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                        <button
                          onClick={() => handleScheduleContent(msg.content)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-semibold text-zinc-300 cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" /> Queue Post
                        </button>
                        <button
                          onClick={() => handleExportMarkdown(msg.content)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-semibold text-zinc-300 cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Export Markdown
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Real-time Multi-Agent visualizer logs */}
          {isGenerating && (
            <div className="flex gap-4 items-start justify-start">
              <div className="w-9 h-9 rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center animate-pulse">
                <Cpu className="w-5 h-5" />
              </div>

              <div className="glass-panel p-5 rounded-2xl w-full max-w-2xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <Terminal className="w-4 h-4 animate-spin" />
                  <span>Agent Collaborative Pipeline Active:</span>
                </div>

                <div className="space-y-2 border-l border-white/10 pl-4 py-1">
                  {agentLogs.map((log, i) => (
                    <div key={i} className="text-xs flex items-center gap-2 text-zinc-400">
                      <span className="font-semibold text-zinc-300">{log.agentName}:</span>
                      <span>{log.message}</span>
                      <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded font-extrabold capitalize">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Animated typing dots */}
                <div className="flex items-center gap-1.5 pl-4 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* File Preview bar */}
        {file && (
          <div className="mx-6 p-3 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center text-xs text-zinc-300 relative z-20">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-violet-400" />
              <span className="font-semibold truncate max-w-[250px]">{file.name}</span>
              <span className="text-[10px] text-zinc-500">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-zinc-500 hover:text-rose-400 font-bold"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Input area Form */}
        <div className="p-6 border-t border-white/5 bg-black/10 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Ask anything or generate platform copy (e.g. 'Turn this document into an Instagram caption')..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isGenerating}
              className="w-full pl-5 pr-24 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <div className="absolute right-3.5 top-[11px] flex items-center gap-2">
              {/* Attachment selector */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating || !activeSessionId}
                title="Attach document, image, or audio"
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleSendMessage()}
                disabled={(!inputText.trim() && !file) || isGenerating}
                className="p-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
