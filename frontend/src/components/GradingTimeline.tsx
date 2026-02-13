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

    const getStageColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500 border-green-500 text-green-500';
            case 'current':
                return 'bg-blue-500 border-blue-500 text-blue-500';
            case 'rejected':
                return 'bg-red-500 border-red-500 text-red-500';
            default:
                return 'bg-gray-700 border-gray-600 text-gray-500';
        }
    };

    const getLineColor = (index: number) => {
        const status = getStageStatus(index);
        if (status === 'completed') return 'bg-green-500';
        if (status === 'rejected') return 'bg-red-500';
        return 'bg-gray-700';
    };

    return (
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700/50">
            {/* Rejected Banner */}
            {isRejected && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                    <XCircle size={24} className="text-red-500" />
                    <div>
                        <p className="text-red-500 font-bold">Card Rejected - Counterfeit</p>
                        <p className="text-gray-400 text-sm">This card has been marked as fake and cannot proceed further.</p>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-gray-700 hidden md:block" />

                {/* Stages */}
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4 md:gap-2 relative">
                    {stages.map((stage, index) => {
                        const status = getStageStatus(index);
                        const Icon = stage.icon;
                        const colorClass = getStageColor(status);
                        const isActive = status === 'current';
                        const isCompleted = status === 'completed';
                        const isRejectedStage = status === 'rejected';

                        return (
                            <div key={stage.name} className="flex flex-col items-center relative">
                                {/* Progress Line Segment (Desktop) */}
                                {index < stages.length - 1 && (
                                    <div className={`absolute top-8 left-1/2 w-full h-1 hidden md:block ${getLineColor(index)}`} />
                                )}

                                {/* Stage Icon */}
                                <motion.div
                                    initial={false}
                                    animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                    transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                                    className={`relative z-10 w-16 h-16 rounded-full border-4 flex items-center justify-center ${colorClass} ${isCompleted || isActive || isRejectedStage ? 'bg-opacity-100' : 'bg-opacity-20'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <Check size={28} className="text-white" />
                                    ) : isRejectedStage ? (
                                        <XCircle size={28} className="text-white" />
                                    ) : (
                                        <Icon size={28} className={isActive ? 'text-white' : ''} />
                                    )}
                                </motion.div>

                                {/* Stage Name */}
                                <div className="mt-3 text-center">
                                    <p className={`text-xs font-medium ${isActive ? 'text-blue-400' :
                                            isCompleted ? 'text-green-400' :
                                                isRejectedStage ? 'text-red-400' :
                                                    'text-gray-500'
                                        }`}>
                                        {stage.name}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Current Status Text */}
            <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">Current Status</p>
                <p className={`text-2xl font-bold mt-1 ${isRejected ? 'text-red-500' :
                        currentIndex >= 0 ? 'text-blue-400' :
                            'text-gray-400'
                    }`}>
                    {currentStatus}
                </p>
            </div>
        </div>
    );
}
