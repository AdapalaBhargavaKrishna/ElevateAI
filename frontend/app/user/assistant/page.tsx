// Environment variables needed:
// NEXT_PUBLIC_AI_URL=http://localhost:8000   # FastAPI base URL
// NEXT_PUBLIC_INTERNAL_KEY=your_internal_key_here  # must match INTERNAL_API_KEY in FastAPI .env

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from "framer-motion";
import { Send, Sparkles, Plus, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';
import { getAnalyticsReport } from '@/app/lib/dashboard.api';
import { api } from '@/app/lib/axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input
            className={`flex h-12 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
            {...props}
        />
    );
};

const PageHeader = ({ title, description }: { title: string; description: string }) => {
    return (
        <div>
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                {title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
    );
};

const suggestions = [
    "How should I prepare for a system design interview?",
    "What skills are most in-demand for full-stack roles?",
    "Help me improve my resume summary",
    "Create a 30-day interview prep plan",
];

export default function AssistantPage() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [sessionId] = useState<string>(() => crypto.randomUUID());
    const [userContext, setUserContext] = useState<object | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // On mount: load user context + chat history
    useEffect(() => {
        const init = async () => {
            try {
                const data = await getAnalyticsReport();
                const ctx = {
                    fullName: data.fullName,
                    avgInterviewScore: data.avgInterviewScore,
                    roadmapProgress: data.roadmapProgress,
                    skills: [],
                    careerGoal: '',
                };
                setUserContext(ctx);
                const greeting = {
                    role: 'assistant',
                    content: `Hi ${data.fullName.split(' ')[0]}! I'm your AI Career Assistant. How can I help you accelerate your career today?`,
                };
                try {
                    const histRes = await api.get(`/chat/history?session_id=${sessionId}`);
                    const history = histRes.data?.messages ?? [];
                    setMessages(history.length > 0 ? history : [greeting]);
                } catch {
                    setMessages([greeting]);
                }
            } catch {
                setMessages([{
                    role: 'assistant',
                    content: "Hi! I'm your AI Career Assistant. How can I help you today?",
                }]);
            }
        };
        init();
    }, [sessionId]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isStreaming) return;
        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsStreaming(true);

        // Save user message (fire and forget)
        api.post('/chat/save', { session_id: sessionId, role: 'user', content: text }).catch(() => { });

        // Add empty assistant bubble
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            const AI_URL = process.env.NEXT_PUBLIC_AI_URL;
            const INTERNAL_KEY = process.env.NEXT_PUBLIC_INTERNAL_KEY ?? '';
            const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') ?? '' : '';
            const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') ?? '' : '';

            const response = await fetch(`${AI_URL}/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-User-Id': userId,
                    'X-Internal-Key': INTERNAL_KEY,
                },
                body: JSON.stringify({
                    messages: [...messages, userMsg].slice(-20),
                    userContext,
                }),
            });

            if (!response.ok) throw new Error('Stream failed');

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let assistantContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const lines = decoder.decode(value, { stream: true }).split('\n');
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const tokenText = line.slice(6);
                    if (tokenText.trim() === '[DONE]') {
                        reader.cancel();
                        break;
                    }
                    assistantContent += tokenText;
                    setMessages(prev => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                        return updated;
                    });
                }
            }

            // Save assistant message (fire and forget)
            api.post('/chat/save', { session_id: sessionId, role: 'assistant', content: assistantContent }).catch(() => { });
        } catch {
            toast.error('Failed to get a response. Please try again.');
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <div className="h-[calc(100vh-0rem)] md:h-[calc(100vh-4rem)] w-full flex max-w-7xl mx-auto flex-col">
            <div className="flex-1 flex flex-col bg-background overflow-hidden">
                {/* Header */}
                <div className="p-4 md:px-6 md:py-4 border-b border-border flex items-center justify-between bg- z-10 shrink-0">
                    <PageHeader title="AI Career Assistant" description="Powered by advanced language models" />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="text-xs h-8 flex items-center gap-2 rounded-full"
                    >
                        <Plus className="h-3.5 w-3.5" /> New chat
                    </Button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin bg-background/50">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                {/* Avatar */}
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-primary/10 text-primary border border-primary/20"
                                    }`}>
                                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>

                                {/* Message Bubble */}
                                <div className={`px-5 py-3.5 rounded-2xl text-sm ${msg.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                    : "bg-card border border-border shadow-sm text-foreground rounded-tl-sm"
                                    }`}>
                                    {msg.role === "assistant" ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Streaming Indicator */}
                    {isStreaming && messages.at(-1)?.content === '' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start w-full"
                        >
                            <div className="flex max-w-[80%] gap-3 flex-row">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-primary/10 text-primary border border-primary/20">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-card border border-border shadow-sm px-5 py-3.5 rounded-2xl rounded-tl-sm flex gap-1 items-center h-[52px]">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-1.5 h-1.5 rounded-full bg-primary"
                                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} className="h-1" />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 shrink-0">
                    {messages.length <= 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap gap-2 mb-4 justify-center"
                        >
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => sendMessage(s)}
                                    className="text-xs px-3 py-1.5 rounded-full bg-muted/50 border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                                >
                                    {s}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    <div className="flex gap-2 max-w-4xl mx-auto items-center">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage(input);
                                }
                            }}
                            placeholder="Message the AI Career Assistant..."
                            className="flex-1 shadow-sm"
                        />
                        <Button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isStreaming}
                            className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 shadow-sm transition-transform active:scale-95"
                            size="icon"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="mt-3 text-center">
                        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                            <Sparkles className="h-3 w-3 text-primary" />
                            AI can make mistakes. Consider verifying important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}