import { Box, Truck, CheckCircle2, User, MapPin } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function ShippedStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <span className="text-blue-400 text-sm font-black">07</span>
                </div>
                <div className="flex-1">
                    <span className="text-white block">Shipped (In Transit)</span>
                    <span className="text-gray-500 text-xs font-normal mt-0.5 block">{grading.card_name}</span>
                </div>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Tracking Information</h3>
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Truck size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5 uppercase font-bold">Carrier</p>
                                <p className="text-white font-bold text-lg">{grading.tracking_provider || 'Not Specified'}</p>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 w-full" />

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Box size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5 uppercase font-bold">Tracking Number</p>
                                <p className="text-gray-300 font-mono tracking-wide bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 inline-block mt-1">
                                    {grading.tracking_number || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 mt-6">Recipient Details</h3>
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                        <div className="flex items-center gap-3">
                            <User size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-300">{grading.customer_name}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin size={16} className="text-gray-500 mt-1" />
                            <span className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                {grading.customer_address || 'No address provided'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Admin Action</h3>
                        <div className="bg-blue-500/5 rounded-2xl p-6 border border-blue-500/10 mb-6">
                            <p className="text-sm text-blue-200/80 leading-relaxed mb-4">
                                Once the courier confirms that the package has been delivered to the customer, click below to mark this shipment as Delivered.
                            </p>
                            <p className="text-xs text-gray-400 italic">
                                Note: This will transition the order to the final confirmation phase where the buyer has 3 days to confirm receipt.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => onUpdateStatus('Delivered')}
                        disabled={isUpdating}
                        className="w-full flex justify-center items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl mt-auto"
                    >
                        {isUpdating ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Updating...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={20} />
                                <span>Mark as Delivered</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
