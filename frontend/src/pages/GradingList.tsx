import { useEffect, useState } from 'react';
import { Plus, Loader2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { SubmitCardModal } from '../components/SubmitCardModal';
import { api } from '../api';

interface Grading {
    id: number;
    card_name: string;
    card_set: string;
    card_year: string;
    condition: string;
    image_url: string;
    status: string;
    submitted_at: string;
    grade?: number;
}

export function GradingList() {
    const [gradings, setGradings] = useState<Grading[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchGradings = async () => {
        try {
            const res = await api.get('/gradings');
            if (res.data.success) {
                setGradings(res.data.gradings);
            }
        } catch (error) {
            console.error("Failed to fetch gradings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGradings();
        const interval = setInterval(fetchGradings, 10000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            'Submitted': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'Authentication in Progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'Condition Inspection': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            'Grading Assigned': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'Encapsulation/Slabbing': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
            'Quality Control': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
            'Complete': 'bg-green-500/20 text-green-400 border-green-500/30',
            'Delivered': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        };
        return statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <header className="mb-8 flex justify-between items-center bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Grading Submissions
                    </h1>
                    <p className="text-gray-400">Track your card grading status</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all"
                >
                    <Plus size={20} />
                    Submit Card
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-blue-400" size={48} />
                </div>
            ) : gradings.length === 0 ? (
                <div className="text-center p-16 text-gray-500 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                    <Package size={64} className="mx-auto mb-4 opacity-20" />
                    <p className="text-xl font-semibold mb-2">No submissions yet</p>
                    <p className="text-sm">Click "Submit Card" to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gradings.map((grading) => (
                        <motion.div
                            key={grading.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all shadow-lg"
                        >
                            <div className="aspect-[3/4] bg-gray-900 relative overflow-hidden">
                                <img
                                    src={grading.image_url}
                                    alt={grading.card_name}
                                    className="w-full h-full object-contain"
                                />
                                {grading.grade && (
                                    <div className="absolute top-3 right-3 bg-blue-600 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg">
                                        {grading.grade}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 space-y-3">
                                <div>
                                    <h3 className="font-bold text-lg text-white mb-1">{grading.card_name}</h3>
                                    <div className="flex gap-2 text-sm text-gray-400">
                                        {grading.card_set && <span>{grading.card_set}</span>}
                                        {grading.card_year && <span>• {grading.card_year}</span>}
                                    </div>
                                </div>

                                {grading.condition && (
                                    <div className="text-sm">
                                        <span className="text-gray-500">Condition:</span>
                                        <span className="text-gray-300 ml-2">{grading.condition}</span>
                                    </div>
                                )}

                                <div className={`px-3 py-2 rounded-lg border text-xs font-bold text-center ${getStatusColor(grading.status)}`}>
                                    {grading.status}
                                </div>

                                <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
                                    Submitted {new Date(grading.submitted_at).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <SubmitCardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchGradings}
            />
        </div>
    );
}
