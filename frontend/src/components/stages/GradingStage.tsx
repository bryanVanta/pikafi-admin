import { useState } from 'react';
import { Award, Calculator } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function GradingStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    const [grade, setGrade] = useState(grading.grade?.toString() || '');
    const [corners, setCorners] = useState(grading.grade_corners?.toString() || '');
    const [edges, setEdges] = useState(grading.grade_edges?.toString() || '');
    const [surface, setSurface] = useState(grading.grade_surface?.toString() || '');
    const [centering, setCentering] = useState(grading.grade_centering?.toString() || '');

    const calculateAverage = () => {
        const c = parseFloat(corners) || 0;
        const e = parseFloat(edges) || 0;
        const s = parseFloat(surface) || 0;
        const ct = parseFloat(centering) || 0;
        if (c && e && s && ct) {
            const avg = (c + e + s + ct) / 4;
            // Round to nearest 0.5
            return (Math.round(avg * 2) / 2).toString();
        }
        return '';
    };

    const handleAutoCalc = () => {
        const avg = calculateAverage();
        if (avg) setGrade(avg);
    };

    const handleSubmit = () => {
        // Collect grading data
        const data = {
            grade: parseFloat(grade),
            grade_corners: parseFloat(corners),
            grade_edges: parseFloat(edges),
            grade_surface: parseFloat(surface),
            grade_centering: parseFloat(centering)
        };

        onUpdateStatus('Slabbing', undefined, data);
    };

    const isValid = grade && corners && edges && surface && centering;

    return (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">4</span>
                Grading Assignment
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sub-grades */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-300 border-b border-gray-700 pb-2">Sub-Grades (1-10)</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Corners</label>
                            <input
                                type="number" step="0.5" min="1" max="10"
                                value={corners}
                                onChange={(e) => setCorners(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Edges</label>
                            <input
                                type="number" step="0.5" min="1" max="10"
                                value={edges}
                                onChange={(e) => setEdges(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Surface</label>
                            <input
                                type="number" step="0.5" min="1" max="10"
                                value={surface}
                                onChange={(e) => setSurface(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Centering</label>
                            <input
                                type="number" step="0.5" min="1" max="10"
                                value={centering}
                                onChange={(e) => setCentering(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAutoCalc}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                        <Calculator size={14} />
                        Auto-calculate final grade
                    </button>
                </div>

                {/* Final Grade */}
                <div className="flex flex-col justify-center items-center bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Final Grade</label>
                    <input
                        type="number" step="0.5" min="1" max="10"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-32 text-center text-4xl font-bold bg-transparent border-b-2 border-blue-500 text-white focus:outline-none mb-2"
                        placeholder="--"
                    />
                    <div className="flex gap-2 mt-4">
                        {[10, 9.5, 9, 8.5, 8].map(g => (
                            <button
                                key={g}
                                onClick={() => setGrade(g.toString())}
                                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${grade === g.toString() ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-gray-700">
                <button
                    onClick={handleSubmit}
                    disabled={isUpdating || !isValid}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <Award size={20} />
                    {isUpdating ? 'Saving...' : 'Finalize Grades'}
                </button>
            </div>
        </div>
    );
}
