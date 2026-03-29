'use client';

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Search, MessageSquare, Send, ArrowLeft, Paperclip, Building2 } from "lucide-react";

interface Message {
    id: string;
    sender: "user" | "recruiter";
    text: string;
    time: string;
}

interface RecruiterContact {
    id: string;
    name: string;
    initials: string;
    company: string;
    lastActive: string;
    unread: number;
}

const recruiterContacts: RecruiterContact[] = [
    { id: "1", name: "Alice Thompson", initials: "AT", company: "TechCorp Inc.", lastActive: "2h ago", unread: 0 },
    { id: "2", name: "David Park", initials: "DP", company: "InnovateLabs", lastActive: "1d ago", unread: 0 },
    { id: "3", name: "Rachel Kim", initials: "RK", company: "CloudScale", lastActive: "3h ago", unread: 0 },
];

const initialConversations: Record<string, Message[]> = {
    "1": [
        { id: "m1", sender: "recruiter", text: "Hi! We were really impressed by your profile on ElevateAI. We have a Full Stack Developer role that matches your skills perfectly.", time: "10:30 AM" },
        { id: "m2", sender: "user", text: "Hi Alice! Thank you for reaching out. I'd love to hear more about the role.", time: "11:15 AM" },
        { id: "m3", sender: "recruiter", text: "Great! The team is 8 engineers working on React, TypeScript, Node.js, and PostgreSQL. Available for a quick call this week?", time: "11:20 AM" },
    ],
    "2": [
        { id: "m1", sender: "recruiter", text: "Hello! Your portfolio caught our attention. We're looking for a senior developer to lead our frontend team.", time: "Yesterday" },
    ],
    "3": [
        { id: "m1", sender: "recruiter", text: "Hi there! CloudScale is expanding and your profile is a great fit.", time: "5:00 PM" },
        { id: "m2", sender: "recruiter", text: "We offer competitive compensation, remote-first culture, and equity. Let me know if you'd like to chat!", time: "5:02 PM" },
    ],
};

export default function UserMessages() {
    const [activeChat, setActiveChat] = useState<RecruiterContact | null>(null);
    const [messageInput, setMessageInput] = useState("");
    const [conversations, setConversations] = useState(initialConversations);
    const [searchQuery, setSearchQuery] = useState("");

    // ── Auto-scroll ──────────────────────────────────────────────────────────
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!activeChat) return;
        // Small timeout lets the DOM paint the new message before scrolling
        const t = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
        return () => clearTimeout(t);
    }, [conversations, activeChat]);

    // Also scroll immediately when switching chats
    useEffect(() => {
        const t = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        }, 50);
        return () => clearTimeout(t);
    }, [activeChat]);
    // ─────────────────────────────────────────────────────────────────────────

    const filteredContacts = recruiterContacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalUnread = recruiterContacts.reduce((sum, c) => sum + c.unread, 0);

    const sendMessage = () => {
        if (!messageInput.trim() || !activeChat) return;

        const newMsg: Message = {
            id: `m${Date.now()}`,
            sender: "user",
            text: messageInput,
            time: "Just now",
        };

        setConversations((prev) => ({
            ...prev,
            [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
        }));
        setMessageInput("");

        setTimeout(() => {
            const reply: Message = {
                id: `m${Date.now() + 1}`,
                sender: "recruiter",
                text: "Thanks for your response! I'll follow up with more details shortly.",
                time: "Just now",
            };
            setConversations((prev) => ({
                ...prev,
                [activeChat.id]: [...(prev[activeChat.id] || []), reply],
            }));
        }, 2000);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Messages</h2>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                    Conversations with recruiters
                    {totalUnread > 0 && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            {totalUnread} new
                        </Badge>
                    )}
                </p>
            </div>

            <div className="flex gap-3 sm:gap-4 h-[calc(100vh-200px)] sm:h-[calc(100vh-220px)] min-h-[400px]">

                {/* Contact List */}
                <div className={`w-full md:w-80 shrink-0 border border-border/50 rounded-xl bg-card overflow-hidden flex flex-col ${activeChat ? "hidden md:flex" : "flex"}`}>
                    <div className="p-3 border-b border-border/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        {filteredContacts.length > 0 ? (
                            filteredContacts.map((c, index) => {
                                const msgs = conversations[c.id] || [];
                                const lastMsg = msgs[msgs.length - 1];
                                return (
                                    <div key={c.id}>
                                        <button
                                            onClick={() => setActiveChat(c)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${activeChat?.id === c.id ? "bg-muted/70" : ""}`}
                                        >
                                            <div className="relative shrink-0">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                                        {c.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {c.unread > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                                                        {c.unread}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm truncate text-foreground ${c.unread > 0 ? "font-bold" : "font-medium"}`}>
                                                        {c.name}
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                                                        {lastMsg?.time}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <Building2 className="h-3 w-3 shrink-0" /> {c.company}
                                                </p>
                                                <p className={`text-xs truncate mt-0.5 ${c.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                                    {lastMsg?.text}
                                                </p>
                                            </div>
                                        </button>
                                        {index < filteredContacts.length - 1 && <Separator />}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No messages found</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 border border-border/50 rounded-xl bg-card overflow-hidden flex flex-col ${!activeChat ? "hidden md:flex" : "flex"}`}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden h-8 w-8 shrink-0"
                                    onClick={() => setActiveChat(null)}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <Avatar className="h-9 w-9 shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                        {activeChat.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{activeChat.name}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                        <Building2 className="h-3 w-3 shrink-0" />
                                        {activeChat.company} · Active {activeChat.lastActive}
                                    </p>
                                </div>
                            </div>

                            {/* Messages — scrollable, ref on inner div so scrollIntoView works */}
                            <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
                                <div className="p-4 space-y-3">
                                    {(conversations[activeChat.id] || []).map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === "user"
                                                    ? "bg-primary text-primary-foreground rounded-br-md"
                                                    : "bg-muted text-foreground rounded-bl-md"
                                                }`}>
                                                <p>{msg.text}</p>
                                                <p className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                                    {msg.time}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {/* ↓ Invisible anchor — always sits below the last message */}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Input */}
                            <div className="shrink-0 p-3 border-t border-border/50">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                    className="flex items-center gap-2"
                                >
                                    <Button type="button" variant="ghost" size="icon" className="shrink-0 h-9 w-9 hidden sm:flex">
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        placeholder="Type a message..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        className="flex-1 h-9"
                                    />
                                    <Button type="submit" size="icon" className="shrink-0 h-9 w-9">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center p-8">
                            <div>
                                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">Your Inbox</h3>
                                <p className="text-sm text-muted-foreground">
                                    Select a conversation to view messages
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}