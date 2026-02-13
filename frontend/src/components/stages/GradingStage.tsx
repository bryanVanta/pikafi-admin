import { useState } from 'react';
import { Calculator, Sparkles } from 'lucide-react';
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
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <span className="text-blue-400 text-sm font-black">04</span>
                </div>
                <div className="flex-1">
                    <span className="text-white block">Grading Assignment</span>
                    <span className="text-gray-500 text-xs font-normal mt-0.5 block">{grading.card_name}</span>
                </div>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Sub-grades */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h3 className="font-bold text-gray-300">Sub-Grades</h3>
                        <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">1 - 10 Scale</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Corners', value: corners, setter: setCorners },
                            { label: 'Edges', value: edges, setter: setEdges },
                            { label: 'Surface', value: surface, setter: setSurface },
                            { label: 'Centering', value: centering, setter: setCentering }
                        ].map((item) => (
                            <div key={item.label} className="bg-black/20 rounded-xl p-4 border border-white/5 transition-colors hover:border-blue-500/30 group">
                                <label className="block text-xs font-bold text-gray-500 mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-wider">{item.label}</label>
                                <input
                                    type="number" step="0.5" min="1" max="10"
                                    value={item.value}
                                    onChange={(e) => item.setter(e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-gray-700 text-white font-bold text-xl py-1 focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-800"
                                    placeholder="-"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAutoCalc}
                        className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/20 flex items-center justify-center gap-2 text-sm font-bold transition-all hover:scale-[1.02]"
                    >
                        <Calculator size={16} />
                        Auto-calculate final grade
                    </button>
                </div>

                {/* Final Grade */}
                <div className="flex flex-col">
                    <div className="flex-1 bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-50" />

                        <label className="block text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest z-10">Final Grade</label>

                        <div className="relative z-10 mb-8">
                            <input
                                type="number" step="0.5" min="1" max="10"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                className="w-40 text-center text-7xl font-black bg-transparent text-white focus:outline-none placeholder-gray-800 tracking-tighter"
                                placeholder="-"
                            />
                            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 z-10">
                            {[10, 9.5, 9, 8.5, 8].map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGrade(g.toString())}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all border ${grade === g.toString()
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-110'
                                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isUpdating || !isValid}
                        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform duration-300" />
                        {isUpdating ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Finalizing...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} fill="currentColor" className="text-yellow-300" />
                                <span>Finalize & Assign Grade</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
