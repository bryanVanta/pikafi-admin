import { XCircle, AlertOctagon } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function RejectedStage({ grading }: StageProps) {
    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden text-center">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 mb-8 shadow-[0_0_30px_rgba(239,68,68,0.2)] border border-red-500/30 relative">
                    <div className="absolute inset-0 rounded-full border border-red-500/20 animate-pulse opacity-20" />
                    <XCircle size={56} className="text-red-500" strokeWidth={1.5} />
                </div>

                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-3 uppercase tracking-tight">Grading Terminated</h2>
                <div className="inline-block bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1 mb-10">
                    <p className="text-red-400 font-bold text-sm tracking-widest uppercase">Rejected - Counterfeit</p>
                </div>

                <div className="max-w-xl mx-auto bg-red-950/30 rounded-3xl p-8 border border-red-500/20 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-start gap-4 mb-6">
                        <AlertOctagon className="text-red-500 shrink-0 mt-1" size={24} />
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-white mb-2">Authenticity Check Failed</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                This card was flagged as counterfeit during the authentication process by our verification team.
                                The grading process was immediately terminated to maintain the integrity of our standards.
                            </p>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 border border-red-500/10 text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Immutable Record</p>
                        </div>
                        <p className="text-red-300/80 font-mono text-xs break-all leading-relaxed bg-red-950/30 p-3 rounded-lg border border-red-500/10">
                            {grading.tx_hash}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
