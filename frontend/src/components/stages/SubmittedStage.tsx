import { Play } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function SubmittedStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    return (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">1</span>
                Submission Review <span className="text-gray-500 text-sm font-normal ml-auto">#{grading.uid}</span>
            </h2>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <p className="text-blue-200">
                    This card has been submitted and is waiting for authentication. Review the card details above ensuring they match the physical card.
                </p>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => onUpdateStatus('Authentication in Progress')}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <Play size={20} fill="currentColor" />
                    {isUpdating ? 'Starting...' : 'Start Authentication Process'}
                </button>
            </div>
        </div>
    );
}
