import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
            case 'Completed':
            case 'Delivered': // Handle 'Delivered' as Completed
                return <CompletedStage grading={grading} onUpdateStatus={updateStatus} isUpdating={updating} />;
            default:
                return (
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700/50">
                        <p className="text-gray-400">Current status: {grading.status}</p>
                        <p className="text-sm text-gray-500 mt-2">No specific workflow action for this status.</p>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    if (!grading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 text-xl">Grading not found</p>
                    <button
                        onClick={() => navigate('/admin')}
                        className="mt-4 text-blue-400 hover:text-blue-300"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">Grading Workflow</h1>
                        <p className="text-gray-400 mt-1">Card #{grading.uid}</p>
                    </div>
                </div>

                {/* Timeline */}
                <GradingTimeline currentStatus={grading.status} />

                {/* Card Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-gray-800 rounded-2xl p-6 border border-gray-700/50"
                >
                    <h2 className="text-xl font-bold mb-4">Card Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card Image */}
                        <div>
                            {grading.image_url && (
                                <img
                                    src={grading.image_url}
                                    alt={grading.card_name}
                                    className="w-full rounded-lg border border-gray-700 max-h-96 object-contain bg-gray-900"
                                />
                            )}
                        </div>

                        {/* Card Details */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-gray-400 text-sm">Card Name</p>
                                <p className="text-white font-bold text-lg">{grading.card_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Set</p>
                                <p className="text-white">{grading.card_set}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Year</p>
                                <p className="text-white">{grading.card_year}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Condition</p>
                                <p className="text-white">{grading.condition}</p>
                            </div>
                            {grading.grade && (
                                <div>
                                    <p className="text-gray-400 text-sm">Grade</p>
                                    <p className="text-white font-bold text-2xl">{grading.grade}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <h3 className="text-lg font-bold mb-3">Customer Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <p className="text-gray-400 text-sm">Name</p>
                                <p className="text-white">{grading.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Contact</p>
                                <p className="text-white">{grading.customer_contact}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Email</p>
                                <p className="text-white">{grading.customer_email}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">ID Type</p>
                                <p className="text-white">{grading.customer_id_type}: {grading.customer_id_number}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stage-Specific Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-6"
                >
                    {renderStageContent()}
                </motion.div>

                {/* Audit Log */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 bg-gray-800 rounded-2xl p-6 border border-gray-700/50"
                >
                    <h2 className="text-xl font-bold mb-4">Audit Log</h2>
                    <div className="space-y-3">
                        {history.length > 0 ? (
                            history.map((event, index) => (
                                <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-white font-medium">{event.status || event.type}</p>
                                            <p className="text-gray-400 text-sm mt-1">
                                                {new Date(event.timestamp * 1000).toLocaleString()}
                                            </p>
                                        </div>
                                        {event.hash && (
                                            <a
                                                href={`https://sepolia.arbiscan.io/tx/${event.hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 text-sm"
                                            >
                                                View TX
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">No history available</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
