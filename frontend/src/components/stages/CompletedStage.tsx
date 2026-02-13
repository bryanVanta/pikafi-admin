import { CheckCircle2, Award } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function CompletedStage({ grading }: StageProps) {
    return (
        <div className="bg-gray-800 rounded-2xl p-8 border border-green-500/30 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-6">
                <CheckCircle2 size={48} className="text-green-500" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Grading Completed!</h2>
            <p className="text-gray-400 mb-8">This order has been fulfilled and delivered to the customer.</p>

            <div className="max-w-md mx-auto bg-gray-900 rounded-xl p-6 border border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                <div className="flex justify-between items-start mb-6">
                    <div className="text-left">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Certificate ID</p>
                        <p className="text-white font-mono text-lg">{grading.uid}</p>
                    </div>
                    <Award className="text-yellow-500" size={32} />
                </div>

                <div className="text-center py-4 border-t border-b border-gray-800 mb-4">
                    <p className="text-6xl font-black text-white">{grading.grade}</p>
                    <p className="text-blue-400 font-medium uppercase tracking-widest text-sm mt-1">Gem Mint</p>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                        <p className="text-gray-500 mb-1">Corners</p>
                        <p className="text-white font-bold">{grading.grade_corners || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Edges</p>
                        <p className="text-white font-bold">{grading.grade_edges || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Surface</p>
                        <p className="text-white font-bold">{grading.grade_surface || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">Centering</p>
                        <p className="text-white font-bold">{grading.grade_centering || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
