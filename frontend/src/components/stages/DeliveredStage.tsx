import { Box, CheckCircle2, AlertTriangle, AlertCircle, Truck, MapPin } from 'lucide-react';
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-6">
                    <div className="bg-teal-500/5 rounded-2xl p-8 border border-teal-500/10 flex flex-col items-center justify-center text-center space-y-4 h-full">
                        <div className="p-4 bg-teal-500/10 rounded-full mb-2">
                            <CheckCircle2 size={48} className="text-teal-500" />
                        </div>
                        <h3 className="text-lg font-bold text-teal-400">Package Delivered</h3>
                        <p className="text-sm text-teal-200/80 max-w-sm">
                            The courier has confirmed delivery. We are waiting for the customer to finalize the transaction.
                        </p>

                        <div className="flex items-start gap-3 bg-black/40 p-4 rounded-xl border border-white/5 text-left w-full mt-4">
                            <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-blue-400 mb-1">3-Day Grace Period</p>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Customer has 72 hours to verify the card contents before the order auto-finalizes or you can force-complete it.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Shipment Details</h3>
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                                <Truck size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5 uppercase font-bold">Carrier</p>
                                <p className="text-white font-bold">{grading.tracking_provider}</p>
                            </div>
                        </div>
                        <div className="h-px bg-white/5 w-full" />
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                                <Box size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5 uppercase font-bold">Tracking ID</p>
                                <p className="text-gray-300 font-mono text-sm">{grading.tracking_number}</p>
                            </div>
                        </div>
                        <div className="h-px bg-white/5 w-full" />
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5 uppercase font-bold">Delivered To</p>
                                <p className="text-gray-300 text-sm">{grading.customer_address}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col items-center">
                        <button
                            onClick={() => onUpdateStatus('Completed')}
                            disabled={isUpdating}
                            className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                        >
                            {isUpdating ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    <span>Force Finalize Order</span>
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-red-400/60 mt-3 flex items-center gap-1.5 uppercase font-bold tracking-widest">
                            <AlertTriangle size={10} /> Use only for manual confirmation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
