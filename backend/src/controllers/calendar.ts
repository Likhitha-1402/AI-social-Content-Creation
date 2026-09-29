import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "./auth";

const prisma = new PrismaClient();

export async function getScheduledPosts(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;

  try {
    const posts = await prisma.scheduledPost.findMany({
      where: { userId },
      orderBy: { scheduledTime: "asc" }
    });
    return res.json(posts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createScheduledPost(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId!;
  const { platforms, content, imageUrl, videoUrl, scheduledTime, status } = req.body;

  if (!platforms || !content || !scheduledTime) {
    return res.status(400).json({ error: "platforms, content, and scheduledTime are required" });
  }

  try {
    const post = await prisma.scheduledPost.create({
      data: {
        platforms,
        content,
        imageUrl,
        videoUrl,
        scheduledTime: new Date(scheduledTime),
        status: status || "scheduled",
        userId
      }
    });
    return res.status(201).json(post);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateScheduledPost(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.userId!;
  const { platforms, content, imageUrl, videoUrl, scheduledTime, status } = req.body;

  try {
    const existing = await prisma.scheduledPost.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ error: "Scheduled post not found" });
    }

    const updated = await prisma.scheduledPost.update({
      where: { id },
      data: {
        platforms: platforms !== undefined ? platforms : existing.platforms,
        content: content !== undefined ? content : existing.content,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
        scheduledTime: scheduledTime !== undefined ? new Date(scheduledTime) : existing.scheduledTime,
        status: status !== undefined ? status : existing.status
      }
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteScheduledPost(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const userId = req.userId!;

  try {
    const existing = await prisma.scheduledPost.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ error: "Scheduled post not found" });
    }

    await prisma.scheduledPost.delete({
      where: { id }
    });

    return res.json({ success: true, message: "Scheduled post deleted" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
