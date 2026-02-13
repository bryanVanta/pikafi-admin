import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Clock, Play, ExternalLink, ShieldCheck, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api';

interface Grading {
    id: number;
    uid: number;
    blockchain_uid: number;
    card_name: string;
    card_set: string;
    card_year: string;
    condition: string;
    image_url: string;
    status: string;
    grade?: number;
    tx_hash: string;
    submitted_at: string;
    customer_name: string;
    customer_id_type: string;
    customer_id_number: string;
    customer_contact: string;
    customer_email: string;
}

interface HistoryEvent {
    type: 'Submitted' | 'Approved' | 'Status Update';
    status?: string;
    hash: string;
    timestamp: number;
    blockNumber: number | null;
}

export function CardDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [grading, setGrading] = useState<Grading | null>(null);
    const [history, setHistory] = useState<HistoryEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch grading details
                const res = await api.get(`/transactions/${id}/grading`);
                if (res.data.success) {
                    setGrading(res.data.grading);
                }

                // Fetch audit log history
                const histRes = await api.get(`/transactions/${id}/history`);
                if (histRes.data.success) {
                    setHistory(histRes.data.history);
                }
            } catch (error) {
                console.error("Failed to fetch details", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

    if (!grading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">Grading Not Found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-2 hover:underline"
                >
                    <ArrowLeft size={20} /> Back to dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-6 font-sans selection:bg-purple-500/30 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-all hover:-translate-x-1 group"
                >
                    <ArrowLeft size={20} className="group-hover:text-purple-400 transition-colors" />
                    <span>Back to Dashboard</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Card Image & Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-2xl shadow-purple-900/10 border border-white/5 p-6 relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            <div className="aspect-[3/4] relative rounded-xl overflow-hidden flex items-center justify-center bg-black/20">
                                <img
                                    src={grading.image_url}
                                    alt={grading.card_name}
                                    className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                />
                                {grading.grade && (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-black font-black text-3xl w-16 h-16 flex items-center justify-center rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] transform -rotate-6 border-2 border-white/50 z-10">
                                        {grading.grade}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-900/40 backdrop-blur-xl p-5 rounded-2xl border border-white/5 text-center group hover:border-white/10 transition-colors">
                                <div className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Population</div>
                                <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">389</div>
                            </div>
                            <div className="bg-gray-900/40 backdrop-blur-xl p-5 rounded-2xl border border-white/5 text-center group hover:border-white/10 transition-colors">
                                <div className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Pop Higher</div>
                                <div className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">129</div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/grading/${grading.uid || grading.id}`)}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40"
                        >
                            <Play size={20} fill="currentColor" />
                            Open Grading Workflow
                        </button>
                    </div>

                    {/* Middle Column: Details & Customer */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card Metadata */}
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight relative z-10">
                                {grading.card_name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 mb-8 relative z-10">
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 font-medium">
                                    {grading.card_year}
                                </span>
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 font-medium">
                                    {grading.card_set}
                                </span>
                                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                                    {grading.condition}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm relative z-10">
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <span className="text-gray-500 font-medium">Item Grade</span>
                                    <span className="font-bold text-white text-lg">{grading.grade || <span className="text-yellow-500">PENDING</span>}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <span className="text-gray-500 font-medium">Cert Number</span>
                                    <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{grading.uid}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <span className="text-gray-500 font-medium">Primary Subject</span>
                                    <span className="font-bold text-white">{grading.card_name}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <span className="text-gray-500 font-medium">Set / Brand</span>
                                    <span className="font-bold text-white">{grading.card_set}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <span className="text-gray-500 font-medium">PSA Estimate</span>
                                    <span className="font-bold text-green-400">$5,493 <span className="text-xs text-gray-500 font-normal ml-1">(Mock)</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info (Admin View) */}
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
                                    <User size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Customer Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                <div>
                                    <div className="text-gray-500 text-xs uppercase font-bold mb-1.5">Full Name</div>
                                    <div className="font-medium text-white text-base">{grading.customer_name}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs uppercase font-bold mb-1.5">ID Document</div>
                                    <div className="font-medium text-white text-base flex items-center gap-2">
                                        <span className="text-gray-400">{grading.customer_id_type}</span>
                                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">{grading.customer_id_number}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs uppercase font-bold mb-1.5">Contact</div>
                                    <div className="font-medium text-white text-base">{grading.customer_contact}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs uppercase font-bold mb-1.5">Email</div>
                                    <div className="font-medium text-white text-base">{grading.customer_email}</div>
                                </div>
                            </div>
                        </div>

                        {/* Audit Log / Blockchain History */}
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Audit Log & Blockchain History</h3>
                            </div>

                            <div className="relative pl-8 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-purple-500/50 before:to-transparent">
                                {history.length === 0 ? (
                                    <div className="text-gray-500 italic">No history found yet.</div>
                                ) : (
                                    history.map((event, index) => (
                                        <div key={event.hash} className="relative group">
                                            <div className={`absolute -left-[2.35rem] w-[18px] h-[18px] rounded-full border-[3px] z-10 box-content transition-all duration-300
                                                ${index === history.length - 1
                                                    ? 'bg-purple-500 border-gray-900 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-110'
                                                    : 'bg-gray-800 border-gray-900 group-hover:bg-purple-900/50 group-hover:border-purple-500/50'}`}
                                            ></div>

                                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 group-hover:border-white/10 transition-colors">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                                    <div>
                                                        <div className="font-bold text-white text-lg">
                                                            {event.status || event.type}
                                                        </div>
                                                        <div className="text-gray-400 text-xs flex items-center gap-2 mt-1">
                                                            <Clock size={12} />
                                                            {new Date(event.timestamp * 1000).toLocaleString()}
                                                        </div>
                                                    </div>

                                                    <a
                                                        href={`https://sepolia.arbiscan.io/tx/${event.hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/30 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 text-gray-400 text-xs rounded-lg transition-all border border-white/5"
                                                    >
                                                        <ExternalLink size={12} />
                                                        View on Arbiscan
                                                    </a>
                                                </div>

                                                <div className="font-mono text-xs text-gray-400 break-all select-all bg-black/30 p-2.5 rounded-lg border border-white/10 mt-2 shadow-inner">
                                                    {event.hash}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
