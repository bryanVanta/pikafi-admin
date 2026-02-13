import { Package } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function SlabbingStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    return (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">5</span>
                Slabbing & Encapsulation
            </h2>

            <div className="flex items-center justify-center py-8">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package size={40} className="text-blue-400" />
                    </div>

                    <h3 className="text-lg font-medium text-white mb-2">Ready for Encapsulation</h3>
                    <p className="text-gray-400 mb-6">
                        Generate label, print certificate, and encapsulate the card in the slab.
                        Ensure the label matches the grading details below:
                    </p>

                    <div className="bg-white/5 rounded-lg p-4 text-left border border-white/10 mb-8">
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <span className="text-gray-400">Card:</span>
                            <span className="text-white font-medium text-right">{grading.card_name}</span>

                            <span className="text-gray-400">Set:</span>
                            <span className="text-white font-medium text-right">{grading.card_set}</span>

                            <span className="text-gray-400">Grade:</span>
                            <span className="text-blue-400 font-bold text-right">{grading.grade}</span>

                            <span className="text-gray-400">Cert ID:</span>
                            <span className="text-white font-mono text-right">#{grading.uid.toString().padStart(8, '0')}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onUpdateStatus('Ready for Return')}
                        disabled={isUpdating}
                        className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <Package size={20} />
                        {isUpdating ? 'Processing...' : 'Confirm Encapsulation Complete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
