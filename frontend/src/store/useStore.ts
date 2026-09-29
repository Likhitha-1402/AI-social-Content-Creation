import { create } from "zustand";

export interface User {
  id: string;
  email: string;
}

export interface ChatSession {
  id: string;
  title: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  isBookmarked?: boolean;
  createdAt: string;
}

export interface BrandVoice {
  name: string;
  tone: string;
  vocabulary: string;
  ctaStyle: string;
  emojiUsage: string;
  formatting: string;
}

interface StoreState {
  token: string | null;
  user: User | null;
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: ChatMessage[];
  bookmarks: ChatMessage[];
  brandVoice: BrandVoice | null;
  loading: boolean;
  activeTab: string;
  videoDraft: string;
  socialDraft: string;
  articleDraft: string;
  imageDraft: string;
  setAuth: (token: string | null, user: User | null) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setActiveSessionId: (id: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setBookmarks: (bookmarks: ChatMessage[]) => void;
  setBrandVoice: (voice: BrandVoice | null) => void;
  setLoading: (loading: boolean) => void;
  setActiveTab: (tab: string) => void;
  setVideoDraft: (draft: string) => void;
  setSocialDraft: (draft: string) => void;
  setArticleDraft: (draft: string) => void;
  setImageDraft: (draft: string) => void;
  logout: () => void;
}

export const useStore = create<StoreState>((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  user: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null,
  sessions: [],
  activeSessionId: null,
  messages: [],
  bookmarks: [],
  brandVoice: null,
  loading: false,
  activeTab: "dashboard",
  videoDraft: "",
  socialDraft: "",
  articleDraft: "",
  imageDraft: "",
  setAuth: (token, user) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");

    set({ token, user });
  },
  setSessions: (sessions) => set({ sessions }),
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  setMessages: (messages) => set({ messages }),
  setBookmarks: (bookmarks) => set({ bookmarks }),
  setBrandVoice: (brandVoice) => set({ brandVoice }),
  setLoading: (loading) => set({ loading }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setVideoDraft: (videoDraft) => set({ videoDraft }),
  setSocialDraft: (socialDraft) => set({ socialDraft }),
  setArticleDraft: (articleDraft) => set({ articleDraft }),
  setImageDraft: (imageDraft) => set({ imageDraft }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({
      token: null,
      user: null,
      sessions: [],
      activeSessionId: null,
      messages: [],
      bookmarks: [],
      brandVoice: null,
      activeTab: "dashboard",
      videoDraft: "",
      socialDraft: "",
      articleDraft: "",
      imageDraft: ""
    });
  }
}));
