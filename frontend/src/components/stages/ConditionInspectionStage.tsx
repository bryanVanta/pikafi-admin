import { useState } from 'react';
import { Search, ClipboardList } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function ConditionInspectionStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    // In a real app, we would enable saving these condition notes
    const [notes, setNotes] = useState('');

    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <span className="text-blue-400 text-sm font-black">03</span>
                </div>
                <div className="flex-1">
                    <span className="text-white block">Condition Inspection</span>
                    <span className="text-gray-500 text-xs font-normal mt-0.5 block">{grading.card_name}</span>
                </div>
            </h2>

            <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-blue-400 mb-4 flex items-center gap-2">
                            <ClipboardList size={18} />
                            Inspection Checklist
                        </h3>
                        <ul className="space-y-3">
                            {['Surface scratches or print lines', 'Edge wear or whitening', 'Corner dings or rounding', 'Centering (front and back)', 'Creases, bends, or indentations'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 group hover:text-white transition-colors">
                                    <div className="w-5 h-5 rounded-md border border-gray-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-colors">
                                        <div className="w-2.5 h-2.5 bg-gray-600 rounded-sm group-hover:bg-blue-400 transition-colors"></div>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
                            Inspection Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-full min-h-[200px] bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 placeholder:text-gray-600 resize-none transition-all"
                            placeholder="Enter any specific notes about the card's condition..."
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/5">
                    <button
                        onClick={() => onUpdateStatus('Grading Assigned')}
                        disabled={isUpdating}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                        {isUpdating ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Updating...</span>
                            </>
                        ) : (
                            <>
                                <Search size={20} strokeWidth={2.5} />
                                <span>Complete Inspection & Assign Grading</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
