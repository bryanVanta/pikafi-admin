import { ShieldCheck, Package } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function GradingStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    const handleSubmit = () => {
        onUpdateStatus('Slabbing', undefined, undefined);
    };

    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden text-center">
            {/* Background Gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center py-8 space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)] mb-4">
                    <ShieldCheck size={40} className="text-blue-400" />
                </div>

                <div>
                    <h2 className="text-3xl font-black text-white mb-2">Grade Successfully Assigned</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        The inspection data has been finalized and recorded. The card is now ready to be securely preserved in a custom slab.
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-sm mt-8">
                    <p className="text-gray-500 text-sm uppercase tracking-widest font-bold mb-2">Final Grade</p>
                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        {grading.grade || '-'}
                    </p>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isUpdating}
                    className="mt-8 w-full max-w-sm flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUpdating ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <Package size={20} />
                            <span>Proceed to Slabbing</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
