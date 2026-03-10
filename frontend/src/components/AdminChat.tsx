import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Send, ShieldCheck, Loader2, User, Clock } from 'lucide-react';

// Adjust for your base api url - Assuming the `api` imported from '../api' is standard Axios
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Message {
    id: number;
    user_email: string;
    sender_type: 'user' | 'admin';
    message: string;
    timestamp: number;
}

interface Contact {
    email: string;
    name: string;
    latest_message: string;
    timestamp: number;
    sender_type: 'user' | 'admin';
}

export function AdminChat({ onClose }: { onClose: () => void }) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchContacts = async () => {
        try {
            const res = await axios.get(`${API_BASE}/messages/contacts`);
            if (res.data.success) {
                setContacts(res.data.contacts);
            }
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        } finally {
            setLoadingContacts(false);
        }
    };

    const fetchMessages = async (email: string) => {
        try {
            const res = await axios.get(`${API_BASE}/messages/${email}`);
            if (res.data.success) {
                setMessages(res.data.messages);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        fetchContacts();
        const interval = setInterval(fetchContacts, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedContact) {
            setLoadingMessages(true);
            fetchMessages(selectedContact.email);
            const interval = setInterval(() => fetchMessages(selectedContact.email), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedContact]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        setSending(true);
        try {
            await axios.post(`${API_BASE}/messages`, {
                user_email: selectedContact.email,
                sender_type: 'admin',
                message: newMessage.trim()
            });
            setNewMessage('');
            fetchMessages(selectedContact.email);
            fetchContacts(); // Update latest message in sidebar
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (ts: number | string) => {
        return new Date(Number(ts)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (ts: number | string) => {
        const d = new Date(Number(ts));
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return formatTime(ts);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#07070c]/90 backdrop-blur-md" />

            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-5xl h-[85vh] flex bg-[#0d0d16] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden">

                {/* Left Sidebar - Contacts List */}
                <div className="w-1/3 border-r border-white/5 flex flex-col bg-black/20">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2">
                            <ShieldCheck size={20} className="text-purple-400" />
                            Active Chats
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                        {loadingContacts ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500/50" /></div>
                        ) : contacts.length === 0 ? (
                            <div className="text-center p-8 text-white/30 text-sm">No active conversations.</div>
                        ) : (
                            contacts.map((contact) => (
                                <div
                                    key={contact.email}
                                    onClick={() => setSelectedContact(contact)}
                                    className={`p-4 mx-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 ${selectedContact?.email === contact.email ? 'bg-purple-500/20 shadow-inner border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 border border-white/10 uppercase font-bold text-gray-300">
                                        {contact.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="text-sm font-bold text-white truncate pr-2">{contact.name}</h4>
                                            <span className="text-[10px] text-white/40 whitespace-nowrap">{formatDate(contact.timestamp)}</span>
                                        </div>
                                        <p className="text-xs text-white/50 truncate">
                                            {contact.sender_type === 'admin' && <span className="text-purple-400 mr-1">You:</span>}
                                            {contact.latest_message}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Area - Selected Chat */}
                <div className="flex-1 flex flex-col relative">
                    {/* Header */}
                    <div className="flex-none p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between pointer-events-none">
                        {selectedContact ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-purple-500/30 shrink-0">
                                    <User size={18} className="text-white/70" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-md">{selectedContact.name}</h3>
                                    <p className="text-white/40 text-[10px] font-mono">{selectedContact.email}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-white/40 font-semibold text-sm">Select a chat to view messages</div>
                        )}
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all z-50 pointer-events-auto">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar flex flex-col bg-chat-pattern">
                        {!selectedContact ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                                <ShieldCheck size={48} className="text-white/20 mb-4" />
                                <p className="text-sm">VantaTech Secure Comms</p>
                            </div>
                        ) : loadingMessages ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/30">
                                <Loader2 size={30} className="animate-spin text-purple-500/50" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-white/30 text-sm">
                                No messages yet. Start the conversation.
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isAdmin = msg.sender_type === 'admin';
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={idx}
                                        className={`flex flex-col gap-1 max-w-[80%] ${isAdmin ? 'self-end' : 'self-start'}`}
                                    >
                                        <div className={`text-[10px] font-black uppercase tracking-widest px-2 ${isAdmin ? 'text-white/30 text-right' : 'text-blue-400'}`}>
                                            {isAdmin ? 'You (Admin)' : selectedContact.name}
                                        </div>
                                        <div className={`px-5 py-3.5 rounded-2xl text-sm font-medium leading-relaxed relative overflow-hidden ${isAdmin ? 'bg-purple-600/60 border border-purple-500/40 text-white shadow-xl shadow-purple-500/5 rounded-tr-sm' : 'bg-gray-800 text-white backdrop-blur-md border border-white/10 rounded-tl-sm'}`}>
                                            {msg.message}
                                        </div>
                                        <span className={`text-[9px] font-bold text-white/20 mt-1 flex items-center gap-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <Clock size={8} /> {formatTime(msg.timestamp)}
                                        </span>
                                    </motion.div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="flex-none p-4 bg-white/[0.02] border-t border-white/5 relative z-10">
                        <form onSubmit={handleSendMessage} className="relative flex items-center">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={selectedContact ? `Reply to ${selectedContact.name}...` : "Select a contact..."}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:border-purple-500/50 focus:bg-[#13131f] transition-all placeholder:text-white/20 text-white text-sm font-semibold disabled:opacity-50"
                                disabled={sending || !selectedContact}
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim() || !selectedContact}
                                className="absolute right-2 w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white disabled:opacity-50 disabled:grayscale transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95"
                            >
                                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-1" />}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
