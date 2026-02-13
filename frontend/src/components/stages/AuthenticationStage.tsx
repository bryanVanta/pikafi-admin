import { useState } from 'react';
import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/grading';

export function AuthenticationStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    const [showFakeConfirmation, setShowFakeConfirmation] = useState(false);

    const handleAuthentic = () => {
        onUpdateStatus('Condition Inspection', 'Authentic');
    };

    const confirmFake = () => {
        onUpdateStatus('Rejected - Counterfeit', 'Fake');
    };

    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                    <span className="text-purple-400 text-sm font-black">02</span>
                </div>
                <span className="text-white">Authentication Verification</span>
            </h2>

            {!showFakeConfirmation ? (
                <div className="relative z-10">
                    <div className="text-center mb-10 bg-black/20 rounded-2xl p-6 border border-white/5">
                        <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">Decision Required</p>
                        <p className="text-2xl font-bold text-white mb-2">
                            Is this card authentic?
                        </p>
                        <p className="text-blue-400 font-medium text-lg">{grading.card_name}</p>
                        <p className="text-gray-500 text-sm mt-4 max-w-md mx-auto">
                            This is a critical checkpoint. Determining authenticity will either proceed to condition inspection or permanently reject this SKU.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={handleAuthentic}
                            disabled={isUpdating}
                            className="group relative overflow-hidden bg-gradient-to-br from-green-900/40 to-green-800/20 hover:from-green-600 hover:to-green-700 border border-green-500/30 hover:border-green-400 text-white rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-grid-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex flex-col items-center gap-4 relative z-10">
                                <div className="p-4 bg-green-500/20 rounded-full group-hover:bg-white/20 transition-colors">
                                    <ShieldCheck size={48} className="text-green-400 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-2xl font-black tracking-tight">Authentic</span>
                                <span className="text-sm text-green-200/70 font-medium bg-green-900/30 px-3 py-1 rounded-full border border-green-500/20">
                                    Proceed to Condition Inspection
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={() => setShowFakeConfirmation(true)}
                            disabled={isUpdating}
                            className="group relative overflow-hidden bg-gradient-to-br from-red-900/40 to-red-800/20 hover:from-red-600 hover:to-red-700 border border-red-500/30 hover:border-red-400 text-white rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-grid-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex flex-col items-center gap-4 relative z-10">
                                <div className="p-4 bg-red-500/20 rounded-full group-hover:bg-white/20 transition-colors">
                                    <ShieldAlert size={48} className="text-red-400 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-2xl font-black tracking-tight">Fake / Counterfeit</span>
                                <span className="text-sm text-red-200/70 font-medium bg-red-900/30 px-3 py-1 rounded-full border border-red-500/20">
                                    Reject and Terminate Grading
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                <AlertTriangle size={40} className="text-red-500" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-3">
                                Confirm Rejection
                            </h3>
                            <p className="text-gray-300 text-lg">
                                Are you sure you want to mark this card as <span className="text-red-400 font-bold">Counterfeit</span>?
                            </p>
                        </div>

                        <div className="bg-black/40 rounded-xl p-6 mb-8 border border-red-500/10 backdrop-blur-sm max-w-xl mx-auto">
                            <p className="text-red-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertTriangle size={14} />
                                Warning: Irreversible Action
                            </p>
                            <ul className="text-gray-300 space-y-3 pl-2">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                                    <span>Status will be permanently set to "Rejected - Counterfeit"</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                                    <span>Grading process will terminate immediately</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                                    <span>Rejection event will be recorded on the blockchain</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-4 max-w-xl mx-auto">
                            <button
                                onClick={() => setShowFakeConfirmation(false)}
                                disabled={isUpdating}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-4 px-6 font-bold transition-all border border-white/10 hover:border-white/20 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmFake}
                                disabled={isUpdating}
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl py-4 px-6 font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-[1.02] disabled:opacity-50"
                            >
                                {isUpdating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
