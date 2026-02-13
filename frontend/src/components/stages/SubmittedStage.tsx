import { Play, CreditCard, Info } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function SubmittedStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <span className="text-blue-400 text-sm font-black">01</span>
                </div>
                <div className="flex-1">
                    <span className="text-white block">Submission Review</span>
                    <span className="text-gray-500 text-xs font-normal mt-0.5 block flex items-center gap-1">
                        <CreditCard size={10} />
                        UID: #{grading.uid}
                    </span>
                </div>
            </h2>

            <div className="relative z-10">
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6 mb-8 flex gap-4 backdrop-blur-sm">
                    <div className="p-3 bg-blue-500/10 rounded-full h-fit shrink-0 border border-blue-500/10">
                        <Info size={24} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-blue-100 font-bold mb-1">Ready for Processing</h3>
                        <p className="text-blue-300/80 text-sm leading-relaxed">
                            This card has been submitted and is currently in the queue.
                            Please verify the card details match the physical card before proceeding to authentication.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => onUpdateStatus('Authentication in Progress')}
                        disabled={isUpdating}
                        className="group flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                        {isUpdating ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Starting...</span>
                            </>
                        ) : (
                            <>
                                <div className="p-1 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                                    <Play size={16} fill="currentColor" />
                                </div>
                                <span>Start Authentication Process</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
