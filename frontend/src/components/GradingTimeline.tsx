import { Check, Clock, Shield, Search, Award, Package, Truck, CheckCircle2, XCircle, Store, Box, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

interface GradingTimelineProps {
    currentStatus: string;
    returnMethod?: 'pickup' | 'delivery'; // Add returnMethod prop
}

const mainSequence = [
    { name: 'Submitted', id: 'Submitted', icon: Clock },
    { name: 'Authentication in Progress', id: 'Authentication in Progress', icon: Shield },
    { name: 'Condition Inspection', id: 'Condition Inspection', icon: Search },
    { name: 'Grading Assigned', id: 'Grading Assigned', icon: Award },
    { name: 'Slabbing', id: 'Slabbing', icon: Package },
    { name: 'Ready for return', id: 'Ready for Return', icon: Truck },
    { name: 'Shipped', id: 'Shipped', icon: Navigation },
    { name: 'Delivered', id: 'Delivered', icon: Box },
    { name: 'Completed', id: 'Completed', icon: CheckCircle2 }
];

const pickupStage = { name: 'Ready for Pickup', id: 'Ready for Pickup', icon: Store };

export function GradingTimeline({ currentStatus, returnMethod }: GradingTimelineProps) {
    // Handle rejected status
    const isRejected = currentStatus === 'Rejected - Counterfeit';

    // Figure out the "active" flat sequence of stages to determine completed vs pending easily
    let activeSequence: string[] = [];
    if (returnMethod === 'delivery') {
        activeSequence = mainSequence.map(s => s.id);
    } else if (returnMethod === 'pickup') {
        activeSequence = [
            ...mainSequence.slice(0, 6).map(s => s.id), // Up to Ready for Return
            pickupStage.id,
            'Completed'
        ];
    } else {
        // If no return method chosen yet
        activeSequence = mainSequence.slice(0, 6).map(s => s.id);
        if (currentStatus === 'Completed') activeSequence.push('Completed');
    }

    const currentIndex = activeSequence.indexOf(currentStatus);

    const getStageStatus = (stageId: string, isDeliveryNode: boolean, isPickupNode: boolean) => {
        if (isRejected && stageId === 'Authentication in Progress') return 'rejected';

        // Check if this branch is even active.
        if (isDeliveryNode && returnMethod === 'pickup') return 'inactive';
        if (isPickupNode && returnMethod === 'delivery') return 'inactive';

        const stageIndexInSequence = activeSequence.indexOf(stageId);

        // If stage is in the active sequence
        if (stageIndexInSequence !== -1) {
            if (currentIndex === -1) return 'pending';
            if (stageIndexInSequence < currentIndex) return 'completed';
            if (stageIndexInSequence === currentIndex) return 'current';
            return 'pending';
        }

        // It's in an inactive branch or not in the sequence at all
        return 'inactive'; // meaning pending but greyed out
    };

    const renderStageNode = (stage: any, isDeliveryNode: boolean = false, isPickupNode: boolean = false) => {
        const rawStatus = getStageStatus(stage.id, isDeliveryNode, isPickupNode);
        const isActive = rawStatus === 'current';
        const isCompleted = rawStatus === 'completed';
        const isRejectedStage = rawStatus === 'rejected';
        const isInactive = rawStatus === 'inactive';

        const Icon = stage.icon;

        return (
            <div key={stage.id} className={`flex flex-col items-center relative z-20 w-[100px] shrink-0 ${isInactive ? 'opacity-40 grayscale' : ''} transition-all duration-500`}>
                <motion.div
                    initial={false}
                    animate={isActive ? { scale: [1, 1.1, 1], boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" } : { scale: 1 }}
                    transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                    className={`relative z-20 w-14 h-14 md:w-16 md:h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 bg-gray-900
                        ${isCompleted ? 'border-blue-500 text-blue-400' :
                            isActive ? 'border-purple-500 text-purple-400' :
                                isRejectedStage ? 'border-red-500 text-red-500' :
                                    isInactive ? 'border-white/5 text-gray-700 bg-gray-900/50' : 'border-white/10 text-gray-500'
                        }`}
                    style={
                        isCompleted ? { boxShadow: '0 0 10px rgba(59,130,246,0.5), 0 0 20px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.15)' } :
                            isActive ? { boxShadow: '0 0 10px rgba(147,51,234,0.6), 0 0 25px rgba(147,51,234,0.4), 0 0 50px rgba(147,51,234,0.2)' } :
                                isRejectedStage ? { boxShadow: '0 0 10px rgba(239,68,68,0.5), 0 0 20px rgba(239,68,68,0.3)' } :
                                    {}
                    }
                >
                    {isCompleted ? (
                        <Check size={24} strokeWidth={3} />
                    ) : (
                        <Icon size={20} className="md:w-6 md:h-6" />
                    )}
                </motion.div>

                <div className="mt-4 text-center px-1">
                    <p className={`text-[9px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-purple-400' :
                        isCompleted ? 'text-blue-400' :
                            isRejectedStage ? 'text-red-400' :
                                isInactive ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                        {stage.name}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-6 lg:p-8 border border-white/5 shadow-xl relative overflow-hidden">
            {/* Ambient Background for Timeline */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            {/* Rejected Banner */}
            {isRejected && (
                <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <div className="p-2 bg-red-500/20 rounded-full">
                        <XCircle size={24} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-red-400 font-bold text-lg">Card Rejected - Counterfeit</p>
                        <p className="text-red-400/70 text-sm">This card has been marked as fake and cannot proceed further.</p>
                    </div>
                </div>
            )}

            <div className="relative py-4 w-full overflow-x-auto hide-scrollbar pb-8">
                {/* 
                  To achieve the exact layout from the image:
                  Top row: empty empty empty empty empty                 [Ready for Pickup]
                  Bot row: Submit, Auth, Cond, Grad, Slab, Ready for Return, Shipped, Delivered, Completed
                */}
                <div className="relative min-w-[1200px] h-[220px]">

                    {/* SVG Background Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minWidth: '1200px' }}>
                        {/* Starting Tail (background) */}
                        <line x1="0" y1="150" x2="50" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                        {/* Ending Tail (background) */}
                        <line x1={50 + 8 * 132} y1="150" x2={50 + 8 * 132 + 50} y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                        {/* Bottom Main Line (background track) */}
                        <line x1="50" y1="150" x2={50 + 8 * 132} y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                        {/* Pickup Branch (background track - rounded corners) */}
                        <path d={`M ${50 + 5 * 132} 150 L ${50 + 5 * 132} ${50 + 20} Q ${50 + 5 * 132} 50 ${50 + 5 * 132 + 20} 50 L ${50 + 8 * 132 - 20} 50 Q ${50 + 8 * 132} 50 ${50 + 8 * 132} ${50 + 20} L ${50 + 8 * 132} 150`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" strokeLinecap="round" />
                    </svg>

                    {/* Active Gradient Line (CSS div overlay) */}
                    {!isRejected && currentIndex >= 0 && (() => {
                        // Calculate the end X position of the active line
                        let endX: number;
                        if (returnMethod === 'pickup') {
                            endX = 50 + Math.min(5, currentIndex) * 132;
                        } else {
                            endX = 50 + Math.min(8, currentIndex) * 132;
                        }
                        // Include the starting tail
                        const startX = 0;
                        const width = endX - startX;

                        if (width <= 0) return null;

                        return (
                            <div
                                className="absolute z-[1] rounded-full"
                                style={{
                                    top: '148px',
                                    left: `${startX}px`,
                                    width: `${width}px`,
                                    height: '4px',
                                    background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                                    filter: 'drop-shadow(0 0 6px #7c3aed) drop-shadow(0 0 3px #3b82f6)',
                                }}
                            />
                        );
                    })()}

                    {/* Active Ending Tail */}
                    {!isRejected && currentIndex >= 8 && (
                        <div
                            className="absolute z-[1] rounded-full"
                            style={{
                                top: '148px',
                                left: `${50 + 8 * 132}px`,
                                width: '50px',
                                height: '4px',
                                background: '#9333ea',
                                filter: 'drop-shadow(0 0 6px #9333ea)',
                            }}
                        />
                    )}

                    {/* Pickup Branch Active Paths (SVG for the curves) */}
                    {!isRejected && returnMethod === 'pickup' && currentIndex >= 6 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]" style={{ minWidth: '1200px' }}>
                            <path d={`M ${50 + 5 * 132} 150 L ${50 + 5 * 132} ${50 + 20} Q ${50 + 5 * 132} 50 ${50 + 5 * 132 + 20} 50 L ${50 + 6.5 * 132} 50`} fill="none" stroke={currentIndex > 6 ? "#3b82f6" : "#9333ea"} strokeWidth="4" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${currentIndex > 6 ? '#3b82f6' : '#9333ea'})` }} />
                            {currentIndex >= 7 && (
                                <path d={`M ${50 + 6.5 * 132} 50 L ${50 + 8 * 132 - 20} 50 Q ${50 + 8 * 132} 50 ${50 + 8 * 132} ${50 + 20} L ${50 + 8 * 132} 150`} fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px #3b82f6)' }} />
                            )}
                        </svg>
                    )}

                    {/* Render The Nodes using absolute positions */}
                    {mainSequence.map((stage, idx) => (
                        <div key={stage.id} className="absolute" style={{ left: `${idx * 132}px`, top: '118px' }}>
                            {renderStageNode(stage, idx > 5, false)}
                        </div>
                    ))}

                    {/* Render Pickup Node (Centered between Shipped (6) and Delivered (7), so X = 6.5 * 132) */}
                    <div className="absolute" style={{ left: `${6.5 * 132}px`, top: '18px' }}>
                        {renderStageNode(pickupStage, false, true)}
                    </div>

                </div>

            </div>

            {/* Current Status Text Display */}
            <div className="mt-8 text-center relative z-10 w-full flex justify-center">
                <div className="inline-block px-6 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Current Status</p>
                    <p className={`text-xl font-black mt-1 bg-clip-text text-transparent bg-gradient-to-r 
                        ${isRejected ? 'from-red-400 to-red-600' :
                            currentIndex >= 0 ? 'from-white via-blue-200 to-purple-200' :
                                'from-gray-500 to-gray-700'
                        }`}>
                        {currentStatus}
                    </p>
                </div>
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
