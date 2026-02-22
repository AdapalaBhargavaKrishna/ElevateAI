'use client';

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input
            className={`flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    );
};

const PageHeader = ({ title, description }: { title: string; description: string }) => {
    return (
        <div className="mb-4">
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground mt-0">{description}</p>
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
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([
        { role: "assistant", content: "Hi Bhargava! I'm your AI Career Assistant. How can I help you today?" },
    ]);
    const [input, setInput] = useState("");

    const sendMessage = (text: string) => {
        if (!text.trim()) return;
        setMessages((prev) => [
            ...prev,
            { role: "user", content: text },
            { role: "assistant", content: "Demo mode - Connect to Elevate Cloud for AI responses! 🚀" },
        ]);
        setInput("");
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-5rem)]">
                <PageHeader title="AI Career Assistant" description="Your personal career advisor" />

                <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                                }`}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {messages.length <= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap gap-1 mb-3"
                    >
                        {suggestions.map((s) => (
                            <button
                                key={s}
                                onClick={() => sendMessage(s)}
                                className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </motion.div>
                )}

                <div className="flex gap-1">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                        placeholder="Ask me anything..."
                        className="bg-muted/50 text-xs h-8"
                    />
                    <Button
                        onClick={() => sendMessage(input)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                        size="icon"
                    >
                        <Send className="h-3 w-3" />
                    </Button>
                </div>

                <p className="text-[8px] text-muted-foreground text-center mt-2">
                    <Sparkles className="h-2 w-2 inline mr-1" />
                    Demo mode
                </p>
            </div>
        </div>
    );
}