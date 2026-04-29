import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

/**
 * GET /chat/history?session_id=XXX
 * Returns the last 20 messages for the given session belonging to the current user.
 */
export async function getChatHistory(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const sessionId = req.query.session_id as string;

        if (!sessionId) {
            return res.status(400).json({ message: "session_id is required" });
        }

        const rows = await prisma.chatMessage.findMany({
            where: { userId, sessionId },
            orderBy: { createdAt: "asc" },
            take: 20,
            select: { role: true, content: true },
        });

        return res.json({ messages: rows });
    } catch (error) {
        console.error("[Chat] history error:", error);
        return res.status(500).json({ message: "Failed to fetch chat history." });
    }
}

/**
 * POST /chat/save
 * Body: { session_id: string; role: 'user' | 'assistant'; content: string }
 * Inserts one chat message row for the current user.
 */
export async function saveChatMessage(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const { session_id, role, content } = req.body;

        if (!session_id || !role || !content) {
            return res.status(400).json({ message: "session_id, role, and content are required" });
        }

        if (!["user", "assistant"].includes(role)) {
            return res.status(400).json({ message: "role must be 'user' or 'assistant'" });
        }

        await prisma.chatMessage.create({
            data: {
                userId,
                sessionId: session_id,
                role,
                content,
            },
        });

        return res.json({ ok: true });
    } catch (error) {
        console.error("[Chat] save error:", error);
        return res.status(500).json({ message: "Failed to save chat message." });
    }
}
