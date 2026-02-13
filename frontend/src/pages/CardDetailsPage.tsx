import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Link as LinkIcon, Clock } from 'lucide-react';
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
    type: 'Submitted' | 'Approved';
    hash: string;
    timestamp: number;
    blockNumber: number;
    // other fields omitted for brevity as we just need type/time
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
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-400" size={48} />
            </div>
        );
    }

    if (!grading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">Grading Not Found</h2>
                <button
                    onClick={() => navigate('/submissions')}
                    className="text-blue-400 hover:underline flex items-center gap-2"
                >
                    <ArrowLeft size={20} /> Back to dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
            <button
                onClick={() => navigate('/')}
                className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {/* Left Column: Card Image */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 p-4"
                    >
                        <div className="aspect-[3/4] relative rounded-xl overflow-hidden bg-gray-900">
                            <img
                                src={grading.image_url}
                                alt={grading.card_name}
                                className="w-full h-full object-contain"
                            />
                            {grading.grade && (
                                <div className="absolute top-4 right-4 bg-blue-600 text-white font-bold text-2xl px-4 py-2 rounded-lg shadow-lg border-2 border-white/20">
                                    {grading.grade}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
                            <div className="text-gray-400 text-sm mb-1">Population</div>
                            <div className="text-xl font-bold text-white">389</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
                            <div className="text-gray-400 text-sm mb-1">Pop Higher</div>
                            <div className="text-xl font-bold text-white">129</div>
                        </div>
                    </div>
                </div>

                {/* Middle Column: Details & Customer */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Card Metadata */}
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-lg">
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            {grading.card_year} {grading.card_set} {grading.card_name}
                        </h1>
                        <div className="text-gray-400 mb-8 flex items-center gap-2">
                            <span className="px-3 py-1 bg-gray-700 rounded-full text-xs font-mono">
                                Cert #{grading.uid.toString().padStart(8, '0')}
                            </span>
                            <span className="px-3 py-1 bg-gray-700 rounded-full text-xs">
                                {grading.condition}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Item Grade</span>
                                <span className="font-bold">{grading.grade || 'PENDING'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Cert Number</span>
                                <span className="font-bold">{grading.uid}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Primary Subject</span>
                                <span className="font-bold">{grading.card_name.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Set / Brand</span>
                                <span className="font-bold">{grading.card_set.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Label Type</span>
                                <span className="font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    Standard
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">PSA Estimate</span>
                                <span className="font-bold">$5,493 <span className="text-xs text-gray-500 font-normal">(Mock)</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info (Admin View) */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700/50">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <div className="text-gray-500 mb-1">Full Name</div>
                                <div className="font-medium text-white">{grading.customer_name}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 mb-1">ID Document</div>
                                <div className="font-medium text-white">
                                    {grading.customer_id_type} — <span className="font-mono bg-gray-900 px-2 py-0.5 rounded">{grading.customer_id_number}</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-500 mb-1">Contact</div>
                                <div className="font-medium text-white">{grading.customer_contact}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 mb-1">Email</div>
                                <div className="font-medium text-white">{grading.customer_email}</div>
                            </div>
                        </div>
                    </div>

                    {/* Audit Log / Blockchain History */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700/50">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                            Audit Log & Blockchain History
                        </h3>

                        <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-700">
                            {history.length === 0 ? (
                                <div className="text-gray-500 italic ml-[-1rem]">No history found yet.</div>
                            ) : (
                                history.map((event, index) => (
                                    <div key={event.hash} className="relative">
                                        <div className={`absolute -left-[2.15rem] w-4 h-4 rounded-full border-2 
                                            ${index === 0 ? 'bg-purple-500 border-purple-500' : 'bg-gray-900 border-gray-600'}`}
                                        ></div>

                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                            <div>
                                                <div className="font-bold text-white text-lg">
                                                    {event.type === 'Submitted' ? 'Submission Recorded' : 'Grading Completed'}
                                                </div>
                                                <div className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                                                    <Clock size={14} />
                                                    {new Date(event.timestamp * 1000).toLocaleString()}
                                                </div>
                                            </div>

                                            <a
                                                href={`https://sepolia.arbiscan.io/tx/${event.hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-blue-400 text-xs rounded-lg transition-colors border border-gray-600"
                                            >
                                                <LinkIcon size={12} />
                                                View on Arbiscan
                                            </a>
                                        </div>

                                        <div className="mt-3 bg-gray-900/50 rounded-lg p-3 text-xs font-mono text-gray-500 break-all border border-gray-800">
                                            Tx Hash: {event.hash}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
