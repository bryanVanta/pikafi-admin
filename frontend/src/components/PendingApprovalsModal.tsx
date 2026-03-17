import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { createPortal } from 'react-dom';

interface PendingGrading {
    id: number;
    card_name: string;
    card_set: string;
    card_year: string;
    condition: string;
    image_url: string;
    customer_name: string;
    customer_email: string;
    customer_contact: string;
    submitted_at: string;
}

interface PendingApprovalsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprovalChange?: () => void;
}

export function PendingApprovalsModal({ isOpen, onClose, onApprovalChange }: PendingApprovalsModalProps) {
    const [pendingGradings, setPendingGradings] = useState<PendingGrading[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchPendingGradings();
        }
    }, [isOpen]);

    const fetchPendingGradings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/gradings/pending`);
            if (res.data.success) {
                setPendingGradings(res.data.gradings);
            }
        } catch (error) {
            console.error('Failed to fetch pending gradings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        setProcessingId(id);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/gradings/${id}/approve-submission`);
            setPendingGradings(pendingGradings.filter(g => g.id !== id));
            onApprovalChange?.();
        } catch (error) {
            console.error('Failed to approve:', error);
            alert('Failed to approve submission');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: number) => {
        if (confirm('Are you sure you want to reject this submission?')) {
            setProcessingId(id);
            try {
                await axios.post(`${import.meta.env.VITE_API_URL}/gradings/${id}/reject-submission`);
                setPendingGradings(pendingGradings.filter(g => g.id !== id));
                onApprovalChange?.();
            } catch (error) {
                console.error('Failed to reject:', error);
                alert('Failed to reject submission');
            } finally {
                setProcessingId(null);
            }
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-4xl max-h-[80vh] bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">📧 Pending Approvals</h2>
                        <p className="text-gray-400 text-sm mt-1">
                            {pendingGradings.length} submission{pendingGradings.length !== 1 ? 's' : ''} waiting for review
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-400 hover:text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-purple-400" size={32} />
                        </div>
                    )}

                    {!loading && pendingGradings.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="text-purple-400" size={32} />
                            </div>
                            <p className="text-gray-300 font-medium">All submissions approved! 🎉</p>
                            <p className="text-gray-500 text-sm mt-1">No pending approvals at the moment</p>
                        </div>
                    )}

                    {!loading && pendingGradings.length > 0 && (
                        <div className="space-y-4">
                            {pendingGradings.map((grading) => (
                                <motion.div
                                    key={grading.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-800/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all"
                                >
                                    <div className="flex gap-4">
                                        {/* Card Image */}
                                        <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
                                            <img
                                                src={grading.image_url}
                                                alt={grading.card_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Card Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-bold text-lg truncate">
                                                {grading.card_name}
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                {grading.card_set} {grading.card_year && `(${grading.card_year})`}
                                            </p>
                                            <p className="text-gray-500 text-sm mt-2">
                                                Condition: <span className="text-gray-300">{grading.condition}</span>
                                            </p>

                                            {/* Customer Info */}
                                            <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                                                <p className="text-gray-500 text-xs">
                                                    Customer: <span className="text-gray-300">{grading.customer_name}</span>
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    {grading.customer_email} • {grading.customer_contact}
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    Submitted: {new Date(grading.submitted_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-2 justify-start">
                                            <button
                                                onClick={() => handleApprove(grading.id)}
                                                disabled={processingId === grading.id}
                                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
                                            >
                                                {processingId === grading.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <CheckCircle size={16} />
                                                )}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(grading.id)}
                                                disabled={processingId === grading.id}
                                                className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-300 hover:text-red-200 font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
                                            >
                                                {processingId === grading.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <XCircle size={16} />
                                                )}
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
