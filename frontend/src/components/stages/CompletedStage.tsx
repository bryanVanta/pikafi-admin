import { CheckCircle2, Award, Sparkles, Truck, Store } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function CompletedStage({ grading }: StageProps) {
    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative overflow-hidden text-center">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

            <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-8 shadow-[0_0_30px_rgba(34,197,94,0.2)] border border-green-500/30 relative">
                    <div className="absolute inset-0 rounded-full border border-green-500/20 animate-ping opacity-20" />
                    <CheckCircle2 size={56} className="text-green-400" strokeWidth={1.5} />
                </div>

                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-3">Grading Completed!</h2>
                <p className="text-gray-400 mb-10 text-lg">This order has been fulfilled and delivered to the customer.</p>

                <div className="max-w-md mx-auto bg-black/40 rounded-3xl p-8 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-colors shadow-2xl">
                    {/* Holographic effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ transform: 'rotate(45deg) translate(-50%, -50%) scale(2)' }} />
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>

                    <div className="flex justify-between items-start mb-8">
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Certificate ID</p>
                            <p className="text-white font-mono text-xl tracking-wider">#{grading.uid}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                            <Award className="text-yellow-400" size={24} />
                        </div>
                    </div>

                    <div className="text-center py-6 border-t border-b border-white/5 mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50" />
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Sparkles size={16} className="text-yellow-400" />
                            <p className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{grading.grade}</p>
                            <Sparkles size={16} className="text-yellow-400" />
                        </div>
                        <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-sm">Gem Mint</p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                            { label: 'Corners', value: grading.grade_corners },
                            { label: 'Edges', value: grading.grade_edges },
                            { label: 'Surface', value: grading.grade_surface },
                            { label: 'Centering', value: grading.grade_centering }
                        ].map((item) => (
                            <div key={item.label} className="bg-white/5 rounded-lg p-2 border border-white/5">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{item.label}</p>
                                <p className="text-white font-bold text-lg">{item.value || '-'}</p>
                            </div>
                        ))}
                    </div>

                    {grading.return_method === 'delivery' && (
                        <div className="mt-8 text-left border-t border-white/10 pt-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Truck size={16} /> Delivery Tracking
                            </h3>
                            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5 relative">
                                    <div className="absolute bottom-0 left-0 w-1/3 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Carrier</p>
                                        <p className="text-white font-bold text-sm">{grading.tracking_provider}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Tracking ID</p>
                                        <p className="text-blue-400 font-mono text-sm tracking-wide">{grading.tracking_number}</p>
                                    </div>
                                </div>

                                <div className="relative border-l border-white/10 ml-[5px] pl-6 space-y-6">
                                    <div className="relative">
                                        <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                        <p className="text-green-400 text-xs font-bold mb-0.5">Shipped</p>
                                        <p className="text-gray-400 text-[11px]">Package handed over to {grading.tracking_provider}.</p>
                                    </div>
                                    <div className="relative opacity-40">
                                        <div className="absolute -left-[30px] top-0 w-3 h-3 bg-black border-2 border-white/20 rounded-full"></div>
                                        <p className="text-white text-xs font-bold mb-0.5">In Transit</p>
                                        <p className="text-gray-500 text-[11px]">Pending updates from carrier hub.</p>
                                    </div>
                                    <div className="relative opacity-40">
                                        <div className="absolute -left-[30px] top-0 w-3 h-3 bg-black border-2 border-white/20 rounded-full"></div>
                                        <p className="text-white text-xs font-bold mb-0.5">Delivered</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {grading.return_method === 'pickup' && (
                        <div className="mt-8 text-center border-t border-white/10 pt-6">
                            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 inline-block w-full">
                                <Store size={28} className="mx-auto text-blue-400 mb-2 opacity-80" />
                                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-1">Ready for Pickup</h3>
                                <p className="text-xs text-blue-200/70">The customer will pick up this card in-store.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
