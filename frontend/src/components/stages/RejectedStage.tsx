import { XCircle } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function RejectedStage({ grading }: StageProps) {
    return (
        <div className="bg-gray-800 rounded-2xl p-8 border border-red-500/30 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 mb-6">
                <XCircle size={48} className="text-red-500" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Grading Terminated</h2>
            <p className="text-red-400 mb-8 font-medium">REJECTED - COUNTERFEIT</p>

            <div className="max-w-md mx-auto bg-red-900/10 rounded-xl p-6 border border-red-500/30">
                <h3 className="text-lg font-bold text-white mb-2">Authenticity Check Failed</h3>
                <p className="text-gray-400 text-sm">
                    This card was flagged as counterfeit during the authentication process.
                    The grading process was immediately terminated and the rejection has been recorded on the blockchain.
                </p>

                <div className="mt-6 pt-6 border-t border-red-500/20 text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Transaction Hash</p>
                    <p className="text-red-300 font-mono text-xs break-all">{grading.tx_hash}</p>
                </div>
            </div>
        </div>
    );
}
