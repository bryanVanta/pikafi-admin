import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Clock, ExternalLink, Shield, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { GradingTimeline } from '../components/GradingTimeline';
import type { Grading } from '../types/grading';
import { SubmittedStage } from '../components/stages/SubmittedStage';
import { AuthenticationStage } from '../components/stages/AuthenticationStage';
import { ConditionInspectionStage } from '../components/stages/ConditionInspectionStage';
import { GradingStage } from '../components/stages/GradingStage';
import { SlabbingStage } from '../components/stages/SlabbingStage';
import { ReadyForReturnStage } from '../components/stages/ReadyForReturnStage';
import { CompletedStage } from '../components/stages/CompletedStage';
import { RejectedStage } from '../components/stages/RejectedStage';
import { ShippedStage } from '../components/stages/ShippedStage';
import { ReadyForPickupStage } from '../components/stages/ReadyForPickupStage';
import { DeliveredStage } from '../components/stages/DeliveredStage';

interface HistoryEvent {
    type: 'Submitted' | 'Approved' | 'Status Update';
    status?: string;
    hash: string;
    timestamp: number;
    blockNumber: number | null;
}

export function GradingWorkflowPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [grading, setGrading] = useState<Grading | null>(null);
    const [history, setHistory] = useState<HistoryEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchGrading = async () => {
        try {
            // Use transactions/:uid/grading endpoint as it exists and supports UID
            const res = await api.get(`/transactions/${id}/grading`);
            if (res.data.success) {
                setGrading(res.data.grading);
            }
        } catch (error) {
            console.error('Failed to fetch grading:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/transactions/${id}/history`);
            if (res.data.success) {
                setHistory(res.data.history);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchGrading(), fetchHistory()]);
            setLoading(false);
        };
        loadData();
    }, [id]);

    const updateStatus = async (newStatus: string, authResult?: 'Authentic' | 'Fake', data?: any) => {
        if (!grading) return false;

        setUpdating(true);
        try {
            const payload: any = { status: newStatus, ...data };
            if (authResult) {
                payload.authentication_result = authResult;
            }

            const res = await api.patch(`/gradings/${grading.id}/status`, payload);
            if (res.data.success) {
                await fetchGrading();
                await fetchHistory();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
            return false;
        } finally {
            setUpdating(false);
        }
    };

    const renderStageContent = () => {
        if (!grading) return null;

        if (grading.status === 'Rejected - Counterfeit') {
            return <RejectedStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
        }

        switch (grading.status) {
            case 'Submitted':
                return <SubmittedStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
            case 'Authentication in Progress':
                return <AuthenticationStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
            case 'Condition Inspection':
                return <ConditionInspectionStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
            case 'Grading Assigned':
                return <GradingStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
            case 'Slabbing':
                return <SlabbingStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
            case 'Encapsulation/Slabbing': // Handle legacy status name if needed, or map it
                return <SlabbingStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
            case 'Ready for Return':
                return <ReadyForReturnStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
            case 'Shipped':
                return <ShippedStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
            case 'Ready for Pickup':
                return <ReadyForPickupStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
            case 'Delivered':
                return <DeliveredStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
            case 'Completed':
                return <CompletedStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
            default:
                return (
                    <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 text-center">
                        <p className="text-gray-400">Current status: {grading.status}</p>
                        <p className="text-sm text-gray-500 mt-2">No specific workflow action for this status.</p>
                    </div>
                );
        }
    };

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
                <div className="text-center">
                    <p className="text-gray-400 text-xl font-bold">Grading not found</p>
                    <button
                        onClick={() => navigate('/admin')}
                        className="mt-6 px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white"
                    >
                        Back to Dashboard
                    </button>
                </div>
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
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="p-2.5 bg-gray-900/50 border border-white/10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group hover:-translate-x-1"
                        >
                            <ArrowLeft size={20} className="group-hover:text-purple-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Grading Workflow</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-500 text-sm">Managing Grade for</span>
                                <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs font-mono font-bold">#{grading.uid}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <GradingTimeline currentStatus={grading.status} returnMethod={grading.return_method} />

                {/* Card Info & Customer Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Visual Card Display - Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-2xl shadow-purple-900/10 border border-white/5 p-6 relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            <div className="aspect-[3/4] relative rounded-xl overflow-hidden flex items-center justify-center bg-black/20">
                                {grading.image_url ? (
                                    <img
                                        src={grading.image_url}
                                        alt={grading.card_name}
                                        className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="text-gray-600">No Image</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details - Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card Details Card */}
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
                                    <Shield size={20} />
                                </div>
                                Card Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold mb-1.5">Card Name</p>
                                    <p className="text-white font-bold text-lg">{grading.card_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold mb-1.5">Set</p>
                                    <p className="text-white text-base">{grading.card_set}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold mb-1.5">Year</p>
                                    <p className="text-white text-base">{grading.card_year}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold mb-1.5">Condition</p>
                                    <p className="text-white text-base">{grading.condition}</p>
                                </div>
                                {grading.grade && (
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase font-bold mb-1.5">Grade</p>
                                        <p className="text-white font-black text-3xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{grading.grade}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Customer Info Card */}
                        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
                                    <User size={20} />
                                </div>
                                Customer Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold mb-1.5">Full Name</p>
                                    <p className="text-white">{grading.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold mb-1.5">Contact</p>
                                    <p className="text-white">{grading.customer_contact}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold mb-1.5">Email</p>
                                    <p className="text-white">{grading.customer_email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold mb-1.5">ID Document</p>
                                    <p className="text-white flex items-center gap-2">
                                        <span className="text-gray-400">{grading.customer_id_type}</span>
                                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs font-mono">{grading.customer_id_number}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stage-Specific Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-8"
                >
                    {renderStageContent()}
                </motion.div>

                {/* Audit Log */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20 text-green-400">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Audit Log & Blockchain History</h3>
                    </div>

                    <div className="relative pl-8 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-purple-500/50 before:to-transparent">
                        {history.length > 0 ? (
                            history.map((event, index) => (
                                <div key={index} className="relative group">
                                    <div className={`absolute -left-[2.35rem] w-[18px] h-[18px] rounded-full border-[3px] z-10 box-content transition-all duration-300
                                                ${index === history.length - 1
                                            ? 'bg-purple-500 border-gray-900 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-110'
                                            : 'bg-gray-800 border-gray-900 group-hover:bg-purple-900/50 group-hover:border-purple-500/50'}`}
                                    ></div>

                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 group-hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-white font-bold text-lg">{event.status || event.type}</p>
                                                <p className="text-gray-400 text-xs flex items-center gap-2 mt-1">
                                                    <Clock size={12} />
                                                    {new Date(event.timestamp * 1000).toLocaleString()}
                                                </p>
                                            </div>
                                            {event.hash && (
                                                <a
                                                    href={`https://sepolia.arbiscan.io/tx/${event.hash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/30 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 text-gray-400 text-xs rounded-lg transition-all border border-white/5"
                                                >
                                                    <ExternalLink size={12} />
                                                    View TX
                                                </a>
                                            )}
                                        </div>
                                        {event.hash && (
                                            <div className="font-mono text-xs text-gray-400 break-all select-all bg-black/30 p-2.5 rounded-lg border border-white/10 mt-2 shadow-inner">
                                                {event.hash}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 italic">No history available</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
