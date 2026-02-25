import React from 'react';

import { MiniImageUploader } from './MiniImageUploader';

// --- Edge Segments ---
interface EdgeSegmentsProps {
    side: 'Front' | 'Back';
    values: Record<string, number | null>;
    images: Record<string, string>;
    onChange: (id: string, value: number) => void;
    onImageChange: (id: string, url: string) => void;
}

const calculateEdgeAverage = (values: Record<string, number | null>) => {
    const ids = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12'];
    const filled = ids.map(id => values[id]).filter(v => v !== null && v !== undefined && !isNaN(v)) as number[];
    if (filled.length === 0) return null;
    return filled.reduce((a, b) => a + b, 0) / filled.length;
};

export const EdgeSegments: React.FC<EdgeSegmentsProps> = ({ values, images, onChange, onImageChange }) => {
    // Upsized Dimensions:
    // Container: 550px x 680px
    // Card: 320px x 448px (Centered)

    const renderInput = (id: string, positionClass: string) => (
        <div className={`absolute flex flex-col items-center group z-10 ${positionClass}`}>
            <div className="bg-gray-800 border border-gray-600 group-hover:border-blue-500 rounded w-20 h-16 shadow-lg flex flex-col items-center justify-center transition-all overflow-hidden relative">
                <span className="text-[10px] text-gray-500 font-mono absolute top-1 left-1.5">{id}</span>
                <div className="absolute top-1 right-1 z-20">
                    <MiniImageUploader
                        value={images[id]}
                        onChange={(url) => onImageChange(id, url)}
                    />
                </div>
                <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full h-full bg-transparent text-center text-xl font-bold text-white focus:outline-none pt-4 pb-1"
                    value={values[id] ?? ''}
                    placeholder="-"
                    onChange={(e) => {
                        const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                        onChange(id, val);
                    }}
                />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center">
            {/* Main Container - Standardized - Transparent Wrapper */}
            <div className="relative w-[550px] h-[680px] select-none flex items-center justify-center mt-2">

                {/* The Card - Larger */}
                <div className="w-[320px] h-[448px] border-2 border-gray-600/50 bg-gray-900/40 backdrop-blur-sm overflow-hidden z-0 rounded-sm grid grid-cols-3 grid-rows-3 relative shadow-2xl">
                    {/* Internal Grid Lines */}
                    {/* Row 1 */}
                    <div className="border-r border-b border-gray-700/50 border-dashed" />
                    <div className="border-r border-b border-gray-700/50 border-dashed" />
                    <div className="border-b border-gray-700/50 border-dashed" />
                    {/* Row 2 */}
                    <div className="border-r border-b border-gray-700/50 border-dashed" />
                    <div className="border-r border-b border-gray-700/50 border-dashed" />
                    <div className="border-b border-gray-700/50 border-dashed" />
                    {/* Row 3 */}
                    <div className="border-r border-gray-700/50 border-dashed" />
                    <div className="border-r border-gray-700/50 border-dashed" />
                    <div />

                    {/* Background hint */}
                    <div className="absolute inset-0 bg-gray-900/20 pointer-events-none z-[-1]" />
                </div>

                {/* SATELLITE INPUTS */}
                {/* Updated Distribution for 320x448 Card */}

                {/* --- TOP ROW (E1, E2, E3) --- */}
                {renderInput('E1', 'top-6 left-[30%] -translate-x-1/2')}
                {renderInput('E2', 'top-6 left-1/2 -translate-x-1/2')}
                {renderInput('E3', 'top-6 left-[70%] -translate-x-1/2')}

                {/* --- RIGHT COL (E4, E5, E6) --- */}
                {renderInput('E4', 'top-[28%] right-4 -translate-y-1/2')}
                {renderInput('E5', 'top-1/2 right-4 -translate-y-1/2')}
                {renderInput('E6', 'bottom-[20%] right-4 -translate-y-1/2')}

                {/* --- BOTTOM ROW (E7, E8, E9) --- */}
                {renderInput('E7', 'bottom-6 left-[30%] -translate-x-1/2')}
                {renderInput('E8', 'bottom-6 left-1/2 -translate-x-1/2')}
                {renderInput('E9', 'bottom-6 left-[70%] -translate-x-1/2')}

                {/* --- LEFT COL (E10, E11, E12) --- */}
                {renderInput('E10', 'top-[28%] left-4 -translate-y-1/2')}
                {renderInput('E11', 'top-1/2 left-4 -translate-y-1/2')}
                {renderInput('E12', 'bottom-[20%] left-4 -translate-y-1/2')}

            </div>

            <p className="mt-4 text-sm text-gray-500 font-mono">
                {(() => { const avg = calculateEdgeAverage(values); return avg !== null ? `Avg: ${avg.toFixed(1)}` : 'Avg: 0'; })()}
            </p>
        </div>
    );
};

// --- Corner Segments ---
interface CornerSegmentsProps {
    side: 'Front' | 'Back';
    values: Record<string, number | null>;
    images: Record<string, string>;
    onChange: (id: string, value: number) => void;
    onImageChange: (id: string, url: string) => void;
}

export const CornerSegments: React.FC<CornerSegmentsProps> = ({ values, images, onChange, onImageChange }) => {
    // Upsized Dimensions

    const calculateCornerAverage = (values: Record<string, number | null>) => {
        const ids = ['CO1', 'CO2', 'CO3', 'CO4'];
        const filled = ids.map(id => values[id]).filter(v => v !== null && v !== undefined && !isNaN(v)) as number[];
        if (filled.length === 0) return null;
        return filled.reduce((a, b) => a + b, 0) / filled.length;
    };

    const renderInput = (id: string, label: string) => (
        <div className="flex flex-col items-center relative z-10">
            <span className="text-[10px] text-gray-500 absolute -top-5 w-max bg-gray-900 px-2 py-0.5 rounded border border-gray-800 z-20">{label}</span>
            <div className="bg-gray-800 border border-gray-700 hover:border-blue-500/50 transition-colors rounded w-28 h-20 shadow-lg relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute top-1.5 left-2 text-[10px] text-gray-500 font-mono">{id}</div>
                <div className="absolute top-1.5 right-1.5 z-20">
                    <MiniImageUploader
                        value={images[id]}
                        onChange={(url) => onImageChange(id, url)}
                    />
                </div>
                <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full h-full bg-transparent text-center text-3xl font-bold text-white focus:outline-none pt-4 pb-1"
                    value={values[id] ?? ''}
                    placeholder="-"
                    onChange={(e) => {
                        const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                        onChange(id, val);
                    }}
                />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center">
            {/* Main Container - Standardized - Transparent Wrapper */}
            <div className="relative w-[550px] h-[680px] select-none flex items-center justify-center mt-2">

                {/* The Card - Larger */}
                <div className="w-[320px] h-[448px] border-2 border-white/5 rounded-2xl bg-gray-900/30 relative shadow-2xl">
                    <div className="absolute inset-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-lg border border-white/5" />

                    {/* Corner Inputs - Positioned relative to the CARD */}
                    <div className="absolute -top-6 -left-6">
                        {renderInput('CO1', 'Top Left')}
                    </div>
                    <div className="absolute -top-6 -right-6">
                        {renderInput('CO2', 'Top Right')}
                    </div>
                    <div className="absolute -bottom-6 -right-6">
                        {renderInput('CO3', 'Btm Right')}
                    </div>
                    <div className="absolute -bottom-6 -left-6">
                        {renderInput('CO4', 'Btm Left')}
                    </div>

                    {/* Center Guidelines */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <div className="w-full h-px bg-blue-500" />
                        <div className="h-full w-px bg-blue-500 absolute" />
                    </div>
                </div>
            </div>

            <p className="mt-4 text-sm text-gray-500 font-mono">
                {(() => { const avg = calculateCornerAverage(values); return avg !== null ? `Avg: ${avg.toFixed(1)}` : 'Avg: 0'; })()}
            </p>
        </div>
    );
};
