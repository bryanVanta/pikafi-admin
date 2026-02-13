import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/grading';

export function AuthenticationStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    const [showFakeConfirmation, setShowFakeConfirmation] = useState(false);

    const handleAuthentic = () => {
        onUpdateStatus('Condition Inspection', 'Authentic');
    };

    const confirmFake = () => {
        onUpdateStatus('Rejected - Counterfeit', 'Fake');
    };

    return (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold">2</span>
                Authentication Verification
            </h2>

            {!showFakeConfirmation ? (
                <div>
                    <div className="text-center mb-8">
                        <p className="text-white text-lg font-medium">
                            Is this card authentic?
                        </p>
                        <p className="text-blue-400 font-medium mt-1">{grading.card_name}</p>
                        <p className="text-gray-400 text-sm mt-2">
                            This decision will determine whether the card proceeds to grading
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleAuthentic}
                            disabled={isUpdating}
                            className="group relative bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <CheckCircle size={48} className="text-white" />
                                <span className="text-xl font-bold">Authentic</span>
                                <span className="text-sm text-green-100">
                                    Proceed to Condition Inspection
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={() => setShowFakeConfirmation(true)}
                            disabled={isUpdating}
                            className="group relative bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <XCircle size={48} className="text-white" />
                                <span className="text-xl font-bold">Fake / Counterfeit</span>
                                <span className="text-sm text-red-100">
                                    Reject and terminate grading
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-6"
                >
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Confirm Rejection
                        </h3>
                        <p className="text-gray-300">
                            Are you sure you want to mark this card as counterfeit?
                        </p>
                    </div>

                    <div className="bg-black/20 rounded-lg p-4 mb-6">
                        <p className="text-red-400 text-sm font-medium mb-2">This action will:</p>
                        <ul className="text-gray-300 text-sm space-y-1 ml-4">
                            <li>• Set status to "Rejected - Counterfeit"</li>
                            <li>• Terminate the grading process immediately</li>
                            <li>• Prevent any further status updates</li>
                            <li>• Record the rejection on blockchain</li>
                        </ul>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowFakeConfirmation(false)}
                            disabled={isUpdating}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-3 px-4 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmFake}
                            disabled={isUpdating}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg py-3 px-4 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'Processing...' : 'Confirm Rejection'}
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
