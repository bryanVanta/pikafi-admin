import * as React from 'react';

interface InspectionGridProps {
    side: 'Front' | 'Back';
    values: Record<string, number | null>;
    onChange: (zone: string, value: number) => void;
}

const ROWS = ['A', 'B', 'C'];
const COLS = ['1', '2', '3'];

export const InspectionGrid: React.FC<InspectionGridProps> = ({ values, onChange }) => {
    // Upsized Card Dimensions:
    // Container: 550px x 680px (To fit screen comfortably but much larger)
    // Card: 320px x 448px (Standard Aspect Ratio ~2.5/3.5, Scaled up)

    return (
        <div className="flex flex-col items-center">
            {/* Main Container - Larger - Transparent Wrapper */}
            <div className="relative w-[550px] h-[680px] select-none flex items-center justify-center mt-2">

                {/* The Card - Larger Grid */}
                <div className="w-[320px] h-[448px] grid grid-cols-3 gap-1 bg-gray-800 p-1.5 rounded-sm border-2 border-gray-600/50 relative overflow-hidden shadow-2xl">

                    {/* Background tint */}
                    <div className="absolute inset-0 bg-gray-900/40 pointer-events-none" />

                    {ROWS.map((row) => (
                        <React.Fragment key={row}>
                            {COLS.map((col) => {
                                const zoneId = `${col}${row}`; // e.g., 1A
                                const value = values[zoneId] ?? null;

                                return (
                                    <div
                                        key={zoneId}
                                        className={`
                                            relative z-10 border border-white/5 rounded overflow-hidden transition-all duration-200
                                            flex flex-col items-center justify-center p-2 group
                                            ${value === 100 ? 'bg-green-500/10 border-green-500/30' :
                                                value && value < 90 ? 'bg-red-500/10 border-red-500/30' :
                                                    value ? 'bg-blue-500/10 border-blue-500/30' : 'bg-gray-800/60 hover:bg-gray-700/80'}
                                        `}
                                    >
                                        <div className="absolute top-1 left-2 text-[9px] text-gray-500 font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                                            {zoneId}
                                        </div>

                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="-"
                                            className="w-full h-full bg-transparent text-center text-lg font-bold focus:outline-none focus:ring-0 p-0 text-white placeholder-gray-600 appearance-none pt-1"
                                            value={value ?? ''}
                                            onChange={(e) => {
                                                const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                                onChange(zoneId, val);
                                            }}
                                            step="0.5"
                                        />
                                        <div className="text-[8px] text-gray-600 font-mono mt-[-2px]">
                                            /100
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="mt-4 text-sm text-gray-500 font-mono">
                {(() => { const avg = calculateAverage(values); return avg > 0 ? `Avg: ${avg.toFixed(1)}` : 'Avg: 0'; })()}
            </div>
        </div>
    );
};

const calculateAverage = (values: Record<string, number | null>) => {
    let sum = 0;
    let definedCount = 0;
    ROWS.forEach(r => COLS.forEach(c => {
        const id = `${c}${r}`;
        if (values[id] !== null && values[id] !== undefined && !isNaN(values[id]!)) {
            sum += values[id]!;
            definedCount++;
        }
    }));
    if (definedCount === 0) return 0;
    return sum / Math.max(1, definedCount);
};
