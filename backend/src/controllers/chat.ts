import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "./auth";
import { runMultiAgentPipeline, AgentProgress } from "../agents/agent_orchestrator";

const prisma = new PrismaClient();

export async function createSession(req: AuthenticatedRequest, res: Response) {
  const { title } = req.body;
  const userId = req.userId!;

  try {
    const session = await prisma.chatSession.create({
      data: {
        title: title || "New Creator Session",
        userId,
      },
    });
    return res.status(201).json(session);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getSessions(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;

  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" }
      ],
    });
    return res.json(sessions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateSession(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { title, isPinned } = req.body;
  const userId = req.userId!;

  try {
    const session = await prisma.chatSession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const updated = await prisma.chatSession.update({
      where: { id },
      data: {
        title: title !== undefined ? title : session.title,
        isPinned: isPinned !== undefined ? isPinned : session.isPinned,
      },
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteSession(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.userId!;

  try {
    const session = await prisma.chatSession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    await prisma.chatSession.delete({
      where: { id },
    });

    return res.json({ success: true, message: "Session deleted" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getMessages(req: AuthenticatedRequest, res: Response) {
  const { sessionId } = req.params;
  const userId = req.userId!;

  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    return res.json(messages);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  const { sessionId } = req.params;
  const { content, toneOverride, platform } = req.body;
  const userId = req.userId!;
  const file = req.file; // From multer upload if present

  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Attachments format
    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileType: string | undefined;

    if (file) {
      fileUrl = `/uploads/${file.filename}`;
      fileName = file.originalname;
      fileType = file.mimetype;
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        role: "user",
        content,
        fileUrl,
        fileName,
        fileType,
        sessionId,
      },
    });

    // Check for Brand Voice settings
    const activeBrandVoice = await prisma.brandVoice.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Setup Socket.io progress broadcaster
    const io = req.app.get("io");
    const onAgentProgress = (progress: AgentProgress) => {
      if (io) {
        io.to(sessionId).emit("agent-progress", progress);
      }
    };

    // Load message history for context memory
    const previousMessages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" }
    });

    const history = previousMessages
      .filter(m => m.id !== userMessage.id)
      .map(m => {
        let text = m.content;
        if (m.role === "assistant") {
          try {
            const parsed = JSON.parse(m.content);
            text = parsed.optimizedContent || parsed.rawContent || m.content;
          } catch (e) {}
        }
        return { role: m.role, content: text };
      });

    // Run multi-agent pipeline
    const attachments = fileUrl ? [{ name: fileName!, url: fileUrl, type: fileType! }] : [];
    const agentOutput = await runMultiAgentPipeline(
      {
        prompt: content,
        brandVoice: activeBrandVoice || undefined,
        platform,
        attachments,
        toneOverride,
        history,
      },
      onAgentProgress
    );

    // Save Assistant structured response as a Markdown text containing the metrics and formatting
    const formattedContent = JSON.stringify(agentOutput); // We can save raw output or structured JSON
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: formattedContent,
        sessionId,
      },
    });

    // Touch session update timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return res.json({
      userMessage,
      assistantMessage,
      parsedOutput: agentOutput,
    });
  } catch (error: any) {
    console.error("SendMessage Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function streamChat(req: AuthenticatedRequest, res: Response) {
  const { content, sessionId, platform, toneOverride } = req.body;
  const userId = req.userId!;

  if (!content) {
    return res.status(400).json({ error: "Content prompt is required" });
  }

  // Setup streaming headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // 1. Get or create session
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId }
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          title: content.substring(0, 30) + (content.length > 30 ? "..." : ""),
          userId
        }
      });
    }

    // Send session info as first SSE event
    res.write(`data: ${JSON.stringify({ type: "session", sessionId: session.id })}\n\n`);

    // 2. Save User message
    await prisma.chatMessage.create({
      data: {
        role: "user",
        content,
        sessionId: session.id
      }
    });

    let fullResponseText = "";

    // 3. Check for keys to stream from real APIs
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Load conversation history messages
    const historyMessages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" }
    });

    const conversationHistory = historyMessages
      .filter(m => m.content !== content)
      .map(m => {
        let text = m.content;
        if (m.role === "assistant") {
          try {
            const parsed = JSON.parse(m.content);
            text = parsed.optimizedContent || parsed.rawContent || m.content;
          } catch (e) {}
        }
        return { role: m.role, content: text };
      });

    if (geminiKey) {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const contents: any[] = conversationHistory.map(h => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }]
      }));
      contents.push({ role: "user", parts: [{ text: content }] });

      const result = await model.generateContentStream({ contents });
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponseText += chunkText;
        res.write(`data: ${JSON.stringify({ type: "chunk", text: chunkText })}\n\n`);
      }
    } else if (openaiKey) {
      const OpenAI = require("openai");
      const openai = new OpenAI({ apiKey: openaiKey });
      
      const messages: any[] = conversationHistory.map(h => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content
      }));
      messages.push({ role: "user", content });

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        stream: true
      });

      for await (const chunk of stream) {
        const chunkText = chunk.choices[0]?.delta?.content || "";
        fullResponseText += chunkText;
        res.write(`data: ${JSON.stringify({ type: "chunk", text: chunkText })}\n\n`);
      }
    } else {
      // 4. Progressive simulator typing fallback
      // Dynamic response selections based on keywords
      let mockText = `### CreatorVerse AI Agent Response 🚀\n\nHere is your platform copy draft:\n\n`;
      const lower = content.toLowerCase();
      
      if (lower.includes("linkedin")) {
        mockText += `**I am thrilled to share that we just launched CreatorVerse AI!** 🚀\n\n` +
                    `Building online visibility is critical but time-consuming. That's why we've engineered a unified, multi-agent AI Content Studio that handles drafting, SEO analysis, formatting, and scheduling in a single dashboard.\n\n` +
                    `Here's why agentic workflows change the game:\n` +
                    `• **True Collaboration**: Research, copywriting, and fact-checking agents review every post.\n` +
                    `• **Visual Capabilities**: Generate high-quality assets and storyboarded clips.\n` +
                    `• **Local Sovereignty**: Option to run models locally via Ollama to keep data private.\n\n` +
                    `What are your thoughts on integrating AI into marketing operations? 👇\n\n` +
                    `#artificialintelligence #automation #marketingtech #productivity`;
      } else if (lower.includes("instagram")) {
        mockText += `🔥 LEVEL UP YOUR CONTENT WITH CREATORVERSE AI! 🔥\n\n` +
                    `Stop jump-shipping between 5 different browser tabs to generate text, visual cards, and video narrations. We've built the ultimate all-in-one content studio.\n\n` +
                    `⚡️ Top Features:\n` +
                    `1️⃣ Cinematic Text-to-Image.\n` +
                    `2️⃣ Automated Story-to-Video storyboard outlines.\n` +
                    `3️⃣ Instant platform tone adaptation.\n\n` +
                    `Hit the link in our bio to try it out free! 👇\n\n` +
                    `#aiart #creatorspace #aestheticworkspaces #techstartup`;
      } else {
        mockText += `Thank you for asking! CreatorVerse AI is an enterprise-grade AI Content Studio. Here are the core features you can test right now:\n\n` +
                    `1. **AI Chat Studio**: Stream AI responses optimized for tone and channel.\n` +
                    `2. **AI Image Studio**: Create images in 8 styles (Cinematic, Cyberpunk, Watercolor, Flat, Anime, etc.) and perform background removals.\n` +
                    `3. **AI Video Studio**: Input story scripts, compile scenes lists, narrate voice tracks, and render video slides.\n` +
                    `4. **Content Calendar**: Drag and schedule drafts to stay ahead of publishing schedules.\n\n` +
                    `How can I assist you with your marketing drafts today?`;
      }

      const words = mockText.split(" ");
      for (const word of words) {
        const textChunk = word + " ";
        fullResponseText += textChunk;
        res.write(`data: ${JSON.stringify({ type: "chunk", text: textChunk })}\n\n`);
        await new Promise(r => setTimeout(r, 45)); // clean typing flow rate
      }
    }

    // 5. Save complete structured message in history
    const agentOutput = {
      rawContent: fullResponseText,
      optimizedContent: fullResponseText,
      hashtags: extractLocalHashtags(fullResponseText),
      cta: "Join the conversation below!",
      readabilityScore: 88,
      viralityScore: 92,
      engagementScore: 87,
      suggestedPostingTimes: ["09:00 AM", "05:00 PM"]
    };

    await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: JSON.stringify(agentOutput),
        sessionId: session.id
      }
    });

    // Touch session update time
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() }
    });

    res.write(`data: ${JSON.stringify({ type: "done", fullContent: fullResponseText })}\n\n`);
    res.end();

  } catch (error: any) {
    console.error("streamChat Error:", error);
    res.write(`data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`);
    res.end();
  }
}

// Local helper
function extractLocalHashtags(text: string): string[] {
  const matches = text.match(/#\w+/g);
  if (matches) return matches.slice(0, 5);
  return ["#ai", "#creatorverse", "#contentstudio"];
}

// -------------------------------------------------------------
// Message Actions (Bookmark, Regenerate, Edit Prompt)
// -------------------------------------------------------------
export async function toggleBookmark(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.userId!;
  try {
    const message = await prisma.chatMessage.findFirst({
      where: { id, session: { userId } }
    });
    if (!message) return res.status(404).json({ error: "Message not found" });
    const updated = await prisma.chatMessage.update({
      where: { id },
      data: { isBookmarked: !message.isBookmarked }
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getBookmarkedMessages(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { isBookmarked: true, session: { userId } },
      orderBy: { createdAt: "desc" }
    });
    return res.json(messages);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function regenerateMessage(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.userId!;
  try {
    const msgToRegen = await prisma.chatMessage.findFirst({
      where: { id, session: { userId } }
    });
    if (!msgToRegen) return res.status(404).json({ error: "Message not found" });
    const sessionId = msgToRegen.sessionId;
    
    // Get all messages in this session up to this message's creation (excluding it)
    const history = await prisma.chatMessage.findMany({
      where: { sessionId, createdAt: { lt: msgToRegen.createdAt } },
      orderBy: { createdAt: "asc" }
    });
    
    // The last message in history should be the user message
    const lastUserMsg = history[history.length - 1];
    if (!lastUserMsg || lastUserMsg.role !== "user") {
      return res.status(400).json({ error: "Cannot regenerate: missing prompt context" });
    }
    
    // Delete the assistant message to regenerate and any subsequent messages
    await prisma.chatMessage.deleteMany({
      where: { sessionId, createdAt: { gte: msgToRegen.createdAt } }
    });

    // Now run multi-agent pipeline
    const activeBrandVoice = await prisma.brandVoice.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    
    const io = req.app.get("io");
    const onAgentProgress = (progress: any) => {
      if (io) io.to(sessionId).emit("agent-progress", progress);
    };

    // Construct history logs for pipeline
    const historyList = history.slice(0, -1).map(h => {
      let text = h.content;
      if (h.role === "assistant") {
        try {
          const parsed = JSON.parse(h.content);
          text = parsed.optimizedContent || parsed.rawContent || h.content;
        } catch (e) {}
      }
      return { role: h.role, content: text };
    });

    const agentOutput = await runMultiAgentPipeline(
      {
        prompt: lastUserMsg.content,
        brandVoice: activeBrandVoice || undefined,
        history: historyList
      },
      onAgentProgress
    );

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: JSON.stringify(agentOutput),
        sessionId
      }
    });

    return res.json({
      assistantMessage,
      parsedOutput: agentOutput
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function editPromptMessage(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.userId!;
  if (!content) return res.status(400).json({ error: "New content is required" });

  try {
    const userMsg = await prisma.chatMessage.findFirst({
      where: { id, role: "user", session: { userId } }
    });
    if (!userMsg) return res.status(404).json({ error: "User message not found" });
    const sessionId = userMsg.sessionId;

    // Delete all messages in this session created AFTER this user message
    await prisma.chatMessage.deleteMany({
      where: { sessionId, createdAt: { gt: userMsg.createdAt } }
    });

    // Update the user message content
    const updatedUserMsg = await prisma.chatMessage.update({
      where: { id },
      data: { content }
    });

    // Get history preceding this message
    const history = await prisma.chatMessage.findMany({
      where: { sessionId, createdAt: { lt: userMsg.createdAt } },
      orderBy: { createdAt: "asc" }
    });

    // Run multi-agent pipeline
    const activeBrandVoice = await prisma.brandVoice.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    const io = req.app.get("io");
    const onAgentProgress = (progress: any) => {
      if (io) io.to(sessionId).emit("agent-progress", progress);
    };

    const historyList = history.map(h => {
      let text = h.content;
      if (h.role === "assistant") {
        try {
          const parsed = JSON.parse(h.content);
          text = parsed.optimizedContent || parsed.rawContent || h.content;
        } catch (e) {}
      }
      return { role: h.role, content: text };
    });

    const agentOutput = await runMultiAgentPipeline(
      {
        prompt: content,
        brandVoice: activeBrandVoice || undefined,
        history: historyList
      },
      onAgentProgress
    );

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: JSON.stringify(agentOutput),
        sessionId
      }
    });

    return res.json({
      userMessage: updatedUserMsg,
      assistantMessage,
      parsedOutput: agentOutput
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

