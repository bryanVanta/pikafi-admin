import { Store, User, CheckCircle2 } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function ReadyForPickupStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                    <span className="text-yellow-400 text-sm font-black">07</span>
                </div>
                <div className="flex-1">
                    <span className="text-white block">Ready for In-Store Pickup</span>
                    <span className="text-gray-500 text-xs font-normal mt-0.5 block">{grading.card_name}</span>
                </div>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Pickup Instructions</h3>
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                                <Store size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5 uppercase font-bold">Store Location</p>
                                <p className="text-white font-bold text-lg">Pokemon Center</p>
                                <p className="text-gray-400 text-sm leading-relaxed mt-1">
                                    Palette Town branch
                                </p>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 w-full" />

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <span className="text-blue-400 text-xs font-bold">1</span>
                            </div>
                            <p className="text-sm text-gray-300">Customer will receive an email notification</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <span className="text-blue-400 text-xs font-bold">2</span>
                            </div>
                            <p className="text-sm text-gray-300">Customer must present the grading UID and photo ID</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Admin Action</h3>
                        <div className="bg-yellow-500/5 rounded-2xl p-6 border border-yellow-500/10 mb-6">
                            <p className="text-sm text-yellow-200/80 leading-relaxed mb-4">
                                Once the customer has visited the store and safely collected their card, click below to finalize this order.
                            </p>
                            <User size={32} className="mx-auto text-yellow-500/50 mb-2" />
                            <p className="text-xs text-center text-gray-400 font-bold">
                                Awaiting {grading.customer_name}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => onUpdateStatus('Completed')}
                        disabled={isUpdating}
                        className="w-full flex justify-center items-center gap-3 px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl mt-auto"
                    >
                        {isUpdating ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Updating...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={20} />
                                <span>Mark as Collected</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
