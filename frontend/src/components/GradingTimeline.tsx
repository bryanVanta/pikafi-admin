import { Check, Clock, Shield, Search, Award, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface GradingTimelineProps {
    currentStatus: string;
}

const stages = [
    { name: 'Submitted', icon: Clock },
    { name: 'Authentication in Progress', icon: Shield },
    { name: 'Condition Inspection', icon: Search },
    { name: 'Grading Assigned', icon: Award },
    { name: 'Slabbing', icon: Package },
    { name: 'Ready for Return', icon: Truck },
    { name: 'Completed', icon: CheckCircle2 },
];

export function GradingTimeline({ currentStatus }: GradingTimelineProps) {
    // Handle rejected status
    const isRejected = currentStatus === 'Rejected - Counterfeit';

    // Find current stage index
    const currentIndex = stages.findIndex(s => s.name === currentStatus);

    const getStageStatus = (index: number) => {
        if (isRejected && index === 1) return 'rejected'; // Show rejection at Authentication stage
        if (currentIndex === -1) return 'pending'; // Unknown status
        if (index < currentIndex) return 'completed';
        if (index === currentIndex) return 'current';
        return 'pending';
    };

    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
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

            {/* Timeline */}
            <div className="relative py-4">
                {/* Progress Track (Background) */}
                <div className="absolute top-12 left-0 right-0 h-1 bg-white/5 rounded-full hidden md:block" />

                {/* Active Progress Track (Foreground) */}
                {!isRejected && currentIndex > 0 && (
                    <div
                        className="absolute top-12 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hidden md:block transition-all duration-1000 ease-out"
                        style={{ width: `${((currentIndex + 0.5) / stages.length) * 100}%` }}
                    />
                )}

                {/* Stages */}
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4 md:gap-0 relative">
                    {stages.map((stage, index) => {
                        const status = getStageStatus(index);
                        const Icon = stage.icon;
                        const isActive = status === 'current';
                        const isCompleted = status === 'completed';
                        const isRejectedStage = status === 'rejected';

                        return (
                            <div key={stage.name} className="flex flex-col items-center relative z-10">
                                {/* Stage Icon */}
                                <motion.div
                                    initial={false}
                                    animate={isActive ? { scale: [1, 1.1, 1], boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" } : { scale: 1 }}
                                    transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                                    className={`relative z-10 w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300
                                        ${isCompleted ? 'bg-gray-900 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                                            isActive ? 'bg-gray-900 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]' :
                                                isRejectedStage ? 'bg-gray-900 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' :
                                                    'bg-gray-900/80 border-white/5 text-gray-600'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <Check size={24} strokeWidth={3} />
                                    ) : (
                                        <Icon size={24} />
                                    )}
                                </motion.div>

                                {/* Stage Name */}
                                <div className="mt-4 text-center px-1">
                                    <p className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-purple-400' :
                                        isCompleted ? 'text-blue-400' :
                                            isRejectedStage ? 'text-red-400' :
                                                'text-gray-600'
                                        }`}>
                                        {stage.name}
                                    </p>
                                </div>

                                {/* Mobile Connector Line */}
                                {index < stages.length - 1 && (
                                    <div className="md:hidden absolute bottom-[-1rem] h-4 w-0.5 bg-white/5" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Current Status Text Display */}
            <div className="mt-10 text-center relative z-10">
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
        </div>
    );
}
