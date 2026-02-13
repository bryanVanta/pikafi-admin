import { useState } from 'react';
import { Search } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function ConditionInspectionStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    // In a real app, we would enable saving these condition notes
    const [notes, setNotes] = useState('');

    return (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">3</span>
                Condition Inspection <span className="text-gray-500 text-sm font-normal ml-auto">{grading.card_name}</span>
            </h2>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-medium text-blue-400 mb-3">Inspection Checklist</h3>
                        <ul className="space-y-3">
                            {['Surface scratches or print lines', 'Edge wear or whitening', 'Corner dings or rounding', 'Centering (front and back)', 'Creases, bends, or indentations'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                    <div className="w-5 h-5 rounded border border-gray-500 flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Inspection Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter any specific notes about the card's condition..."
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-700">
                    <button
                        onClick={() => onUpdateStatus('Grading Assigned')}
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <Search size={20} />
                        {isUpdating ? 'Updating...' : 'Complete Inspection & Assign Grading'}
                    </button>
                </div>
            </div>
        </div>
    );
}
