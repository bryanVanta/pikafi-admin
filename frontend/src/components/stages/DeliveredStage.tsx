import { Box, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function DeliveredStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                    <span className="text-teal-400 text-sm font-black">08</span>
                </div>
                <div className="flex-1">
                    <span className="text-white block">Delivered (Awaiting Confirmation)</span>
                    <span className="text-gray-500 text-xs font-normal mt-0.5 block">{grading.card_name}</span>
                </div>
            </h2>

            <div className="grid grid-cols-1 gap-8 relative z-10">
                <div className="bg-teal-500/5 rounded-2xl p-6 border border-teal-500/10 flex flex-col items-center justify-center text-center space-y-4">
                    <Box size={48} className="text-teal-500/80 mb-2" />
                    <h3 className="text-lg font-bold text-teal-400">Package Delivered</h3>
                    <p className="text-sm text-teal-200/80 max-w-md">
                        This order has been marked as delivered by the courier. We are currently waiting for the buyer to confirm receipt of the item.
                    </p>

                    <div className="flex items-start gap-3 bg-black/40 p-4 rounded-xl border border-white/5 text-left w-full max-w-md mt-4">
                        <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-blue-400 mb-1">Buyer Grace Period</p>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                The buyer has 3 days to verify the contents and confirm receipt. If they do not respond within this window, the system or admin can finalize the order.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center pt-6 border-t border-white/5">
                    <p className="text-sm text-gray-400 mb-4 text-center">
                        Need to force complete this order? (e.g., buyer confirmed via direct message or grace period ended)
                    </p>
                    <button
                        onClick={() => onUpdateStatus('Completed')}
                        disabled={isUpdating}
                        className="flex justify-center items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                    >
                        {isUpdating ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="text-sm">Updating...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                <span className="text-sm">Force Complete Order</span>
                            </>
                        )}
                    </button>
                    <p className="text-xs text-red-400/80 mt-3 flex items-center gap-1.5">
                        <AlertTriangle size={12} /> Only do this if you are absolutely sure.
                    </p>
                </div>
            </div>
        </div>
    );
}
