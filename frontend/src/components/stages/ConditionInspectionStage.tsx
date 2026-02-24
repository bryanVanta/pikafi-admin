import React, { useState, useEffect } from 'react';
import { InspectionGrid } from '../inspection/InspectionGrid';
import { EdgeSegments, CornerSegments } from '../inspection/DetailedSegments';

interface ConditionInspectionStageProps {
    grading: any;
    onUpdateStatus: (status: string, authResult?: 'Authentic' | 'Fake', data?: any) => void;
    isUpdating?: boolean;
}

// Initial Metadata Structure
const INITIAL_METADATA = {
    front: {
        surface: {} as Record<string, number>,
        edges: {} as Record<string, number>,
        corners: {} as Record<string, number>,
        centering: {} as Record<string, number>
    },
    back: {
        surface: {} as Record<string, number>,
        edges: {} as Record<string, number>,
        corners: {} as Record<string, number>,
        centering: {} as Record<string, number>
    }
};

const STEPS = [
    { id: 'surface', title: 'Surface Inspection', description: 'Check for scratches, print lines, and imperfections.' },
    { id: 'edges', title: 'Edge Analysis', description: 'Inspect edges for whitening and wear.' },
    { id: 'corners', title: 'Corner Detail', description: 'Examine corners for dings and rounding.' },
    { id: 'centering', title: 'Centering', description: 'Measure card centering precision.' },
    { id: 'summary', title: 'Final Summary', description: 'Review all inspection results.' }
];

export const ConditionInspectionStage: React.FC<ConditionInspectionStageProps> = ({ grading, onUpdateStatus, isUpdating }) => {
    // Stage State
    const [currentStep, setCurrentStep] = useState(0);
    const [view, setView] = useState<'Front' | 'Back'>('Front');

    // Data State
    const [metadata, setMetadata] = useState(INITIAL_METADATA);
    const [subGrades, setSubGrades] = useState({
        surface: 0,
        edges: 0,
        corners: 0,
        centering: 0,
        total: 0
    });
    const [validationError, setValidationError] = useState<string | null>(null);

    // Helper to safely update nested state
    const updateValue = (category: 'surface' | 'edges' | 'corners' | 'centering', id: string, val: number) => {
        setMetadata(prev => ({
            ...prev,
            [view.toLowerCase()]: {
                ...prev[view.toLowerCase() as 'front' | 'back'],
                [category]: {
                    ...prev[view.toLowerCase() as 'front' | 'back'][category],
                    [id]: val
                }
            }
        }));
    };

    // Calculation Logic
    useEffect(() => {
        const calculateAvg = (frontVals: Record<string, number>, backVals: Record<string, number>, countPerSide: number) => {
            const fVals = Object.values(frontVals).filter(v => v !== null && v !== undefined && !isNaN(v));
            const bVals = Object.values(backVals).filter(v => v !== null && v !== undefined && !isNaN(v));

            const totalSum = fVals.reduce((a, b) => a + b, 0) + bVals.reduce((a, b) => a + b, 0);
            const totalEntries = fVals.length + bVals.length;

            if (totalEntries === 0) return 0;
            return totalSum / totalEntries;
        };

        const sAvg = calculateAvg(metadata.front.surface, metadata.back.surface, 9);
        const eAvg = calculateAvg(metadata.front.edges, metadata.back.edges, 12);
        const cAvg = calculateAvg(metadata.front.corners, metadata.back.corners, 4);
        const ceAvg = calculateAvg(metadata.front.centering, metadata.back.centering, 4);

        // Simple weighted average for Total Grade (Mock Logic)
        const totalScore100 = (sAvg + eAvg + cAvg + ceAvg) / 4;
        const finalGrade10 = totalScore100 / 10;

        setSubGrades({
            surface: sAvg,
            edges: eAvg,
            corners: cAvg,
            centering: ceAvg,
            total: finalGrade10
        });

    }, [metadata]);

    const handleSubmit = () => {
        onUpdateStatus('Grading Assigned', undefined, {
            inspection_metadata: metadata,
            grade: parseFloat(subGrades.total.toFixed(1)),
            grade_surface: parseFloat(subGrades.surface.toFixed(1)),
            grade_edges: parseFloat(subGrades.edges.toFixed(1)),
            grade_corners: parseFloat(subGrades.corners.toFixed(1)),
            grade_centering: parseFloat(subGrades.centering.toFixed(1))
        });
    };

    const validateCurrentStep = () => {
        const stepId = STEPS[currentStep].id as 'surface' | 'edges' | 'corners' | 'centering' | 'summary';
        if (stepId === 'summary') return true;

        const counts = {
            surface: 9,
            edges: 12,
            corners: 4,
            centering: 4
        };

        const reqCount = counts[stepId];

        const frontFilled = Object.values(metadata.front[stepId]).filter(v => v !== null && v !== undefined && !isNaN(v as number)).length;
        const backFilled = Object.values(metadata.back[stepId]).filter(v => v !== null && v !== undefined && !isNaN(v as number)).length;

        if (frontFilled < reqCount || backFilled < reqCount) {
            setValidationError(`Please complete all ${reqCount} inputs for both Front and Back sides before proceeding. (Front: ${frontFilled}/${reqCount}, Back: ${backFilled}/${reqCount})`);
            return false;
        }

        setValidationError(null);
        return true;
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1));
            setValidationError(null);
        }
    };
    const prevStep = () => {
        setCurrentStep(prev => Math.max(0, prev - 1));
        setValidationError(null);
    };

    return (
        <div className="space-y-6">
            {/* Step Progress Bar */}
            <div className="flex justify-between items-center mb-6 px-4">
                {STEPS.map((step, idx) => (
                    <div
                        key={step.id}
                        className={`flex flex-col items-center gap-2 cursor-pointer transition-colors ${idx === currentStep ? 'text-blue-400' :
                            idx < currentStep ? 'text-green-400' : 'text-gray-600'
                            }`}
                        onClick={() => setCurrentStep(idx)}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${idx === currentStep ? 'bg-blue-500/20 border-blue-500 text-blue-400' :
                            idx < currentStep ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-gray-800 border-gray-700'
                            }`}>
                            {idx + 1}
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-medium hidden md:block">
                            {step.title.split(' ')[0]}
                        </span>
                    </div>
                ))}
            </div>

            {/* View Toggles (Global) */}
            {currentStep < STEPS.length - 1 && (
                <div className="flex justify-center bg-gray-900/50 p-1 rounded-lg w-fit mx-auto border border-white/5 mb-8">
                    <button
                        onClick={() => { setView('Front'); setValidationError(null); }}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${view === 'Front'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Front View
                    </button>
                    <button
                        onClick={() => { setView('Back'); setValidationError(null); }}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${view === 'Back'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Back View
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="min-h-[400px]">
                {/* Step 1: Surface */}
                {currentStep === 0 && (
                    <div className="flex flex-col items-center animate-fadeIn">
                        {/* WIDER CONTAINER: max-w-2xl */}
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-white/5 w-full max-w-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-white font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-400" /> {view} Surface
                                </h4>
                                <span className="text-xs text-gray-500">3x3 Grid Matrix</span>
                            </div>
                            <InspectionGrid
                                side={view}
                                values={metadata[view.toLowerCase() as 'front' | 'back'].surface}
                                onChange={(id, val) => updateValue('surface', id, val)}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Edges */}
                {currentStep === 1 && (
                    <div className="flex flex-col items-center animate-fadeIn">
                        {/* WIDER CONTAINER: max-w-2xl */}
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-white/5 w-full max-w-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-white font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400" /> {view} Edges
                                </h4>
                                <span className="text-xs text-gray-500">12-Point Frame</span>
                            </div>
                            <EdgeSegments
                                side={view}
                                values={metadata[view.toLowerCase() as 'front' | 'back'].edges}
                                onChange={(id, val) => updateValue('edges', id, val)}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Corners */}
                {currentStep === 2 && (
                    <div className="flex flex-col items-center animate-fadeIn">
                        {/* WIDER CONTAINER: max-w-2xl */}
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-white/5 w-full max-w-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-white font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-400" /> {view} Corners
                                </h4>
                                <span className="text-xs text-gray-500">4-Point Precision</span>
                            </div>
                            <CornerSegments
                                side={view}
                                values={metadata[view.toLowerCase() as 'front' | 'back'].corners}
                                onChange={(id, val) => updateValue('corners', id, val)}
                            />
                        </div>
                    </div>
                )}


                {/* Step 4: Centering */}
                {currentStep === 3 && (
                    <div className="flex flex-col items-center animate-fadeIn">
                        {/* WIDER CONTAINER: max-w-2xl */}
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-white/5 w-full max-w-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-white font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400" /> {view} Centering
                                </h4>
                            </div>

                            {/* Centering Card Container */}
                            <div className="flex flex-col items-center">
                                {/* Main Container */}
                                <div className="relative w-[550px] h-[680px] select-none flex items-center justify-center mt-2">
                                    {/* The Card */}
                                    <div className="w-[320px] h-[448px] border-2 border-white/5 rounded-2xl bg-gray-900/30 relative shadow-2xl flex items-center justify-center">
                                        <span className="text-gray-600 text-sm">Card Outline</span>
                                    </div>

                                    {/* Centering Inputs - Positioned around the card */}
                                    {/* Top */}
                                    <div className="absolute top-[60px] left-1/2 -translate-x-1/2">
                                        <div className="bg-gray-900 rounded-lg p-3 border border-yellow-500/30 min-w-[140px]">
                                            <div className="text-[10px] text-yellow-400 mb-1 font-medium uppercase text-center">Top</div>
                                            <div className="flex items-center gap-2 justify-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="w-16 bg-transparent text-white font-bold text-lg focus:outline-none text-center"
                                                    placeholder="-"
                                                    value={metadata[view.toLowerCase() as 'front' | 'back'].centering['CE1'] ?? ''}
                                                    onChange={(e) => {
                                                        const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                                        updateValue('centering', 'CE1', val);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right */}
                                    <div className="absolute right-[60px] top-1/2 -translate-y-1/2">
                                        <div className="bg-gray-900 rounded-lg p-3 border border-yellow-500/30 min-w-[140px]">
                                            <div className="text-[10px] text-yellow-400 mb-1 font-medium uppercase text-center">Right</div>
                                            <div className="flex items-center gap-2 justify-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="w-16 bg-transparent text-white font-bold text-lg focus:outline-none text-center"
                                                    placeholder="-"
                                                    value={metadata[view.toLowerCase() as 'front' | 'back'].centering['CE2'] ?? ''}
                                                    onChange={(e) => {
                                                        const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                                        updateValue('centering', 'CE2', val);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom */}
                                    <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2">
                                        <div className="bg-gray-900 rounded-lg p-3 border border-yellow-500/30 min-w-[140px]">
                                            <div className="text-[10px] text-yellow-400 mb-1 font-medium uppercase text-center">Bottom</div>
                                            <div className="flex items-center gap-2 justify-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="w-16 bg-transparent text-white font-bold text-lg focus:outline-none text-center"
                                                    placeholder="-"
                                                    value={metadata[view.toLowerCase() as 'front' | 'back'].centering['CE3'] ?? ''}
                                                    onChange={(e) => {
                                                        const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                                        updateValue('centering', 'CE3', val);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Left */}
                                    <div className="absolute left-[60px] top-1/2 -translate-y-1/2">
                                        <div className="bg-gray-900 rounded-lg p-3 border border-yellow-500/30 min-w-[140px]">
                                            <div className="text-[10px] text-yellow-400 mb-1 font-medium uppercase text-center">Left</div>
                                            <div className="flex items-center gap-2 justify-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="w-16 bg-transparent text-white font-bold text-lg focus:outline-none text-center"
                                                    placeholder="-"
                                                    value={metadata[view.toLowerCase() as 'front' | 'back'].centering['CE4'] ?? ''}
                                                    onChange={(e) => {
                                                        const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                                        updateValue('centering', 'CE4', val);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm text-gray-500 font-mono">
                                    {(() => {
                                        const vals = metadata[view.toLowerCase() as 'front' | 'back'].centering;
                                        const filled = ['CE1', 'CE2', 'CE3', 'CE4'].map(k => vals[k]).filter(v => v !== null && v !== undefined && !isNaN(v as number)) as number[];
                                        return filled.length > 0 ? `Avg: ${(filled.reduce((a, b) => a + b, 0) / filled.length).toFixed(1)}` : 'Avg: 0';
                                    })()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Final Summary */}
                {currentStep === 4 && (
                    <div className="flex flex-col items-center animate-fadeIn">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-white/10 shadow-xl max-w-2xl w-full">
                            <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-3 text-center">
                                Inspection Summary
                            </h3>
                            <div className="space-y-5">
                                <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <span className="text-gray-300 font-medium">Surface</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all" style={{ width: `${subGrades.surface}%` }} />
                                        </div>
                                        <span className="font-mono text-blue-400 font-bold w-12 text-right text-lg">{subGrades.surface.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <span className="text-gray-300 font-medium">Edges</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 transition-all" style={{ width: `${subGrades.edges}%` }} />
                                        </div>
                                        <span className="font-mono text-green-400 font-bold w-12 text-right text-lg">{subGrades.edges.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <span className="text-gray-300 font-medium">Corners</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 transition-all" style={{ width: `${subGrades.corners}%` }} />
                                        </div>
                                        <span className="font-mono text-red-400 font-bold w-12 text-right text-lg">{subGrades.corners.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <span className="text-gray-300 font-medium">Centering</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-500 transition-all" style={{ width: `${subGrades.centering}%` }} />
                                        </div>
                                        <span className="font-mono text-yellow-400 font-bold w-12 text-right text-lg">{subGrades.centering.toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="pt-6 mt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-white font-bold text-2xl">Final Grade</span>
                                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                        {subGrades.total.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Validation Error */}
            {validationError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm animate-fadeIn shadow-lg">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {validationError}
                </div>
            )}

            {/* Navigation Footer */}
            <div className="flex justify-between pt-6 border-t border-white/5">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 0
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-white hover:bg-white/10'
                        }`}
                >
                    Back
                </button>

                {currentStep === STEPS.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2"
                    >
                        <span>Finalize Grading</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                ) : (
                    <button
                        onClick={nextStep}
                        className="px-8 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2"
                    >
                        <span>Next Step</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
};
