import { X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AuthenticationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (result: 'Authentic' | 'Fake') => void;
    cardName: string;
}

export function AuthenticationModal({ isOpen, onClose, onConfirm, cardName }: AuthenticationModalProps) {
    const [showFakeConfirmation, setShowFakeConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAuthentic = async () => {
        setIsSubmitting(true);
        await onConfirm('Authentic');
        setIsSubmitting(false);
        onClose();
    };

    const handleFake = () => {
        setShowFakeConfirmation(true);
    };

    const confirmFake = async () => {
        setIsSubmitting(true);
        await onConfirm('Fake');
        setIsSubmitting(false);
        setShowFakeConfirmation(false);
        onClose();
    };

    const cancelFake = () => {
        setShowFakeConfirmation(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-gray-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                                    Authentication Verification
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
                                    disabled={isSubmitting}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {!showFakeConfirmation ? (
                            <div className="p-8">
                                {/* Card Name */}
                                <div className="mb-6 text-center">
                                    <p className="text-gray-400 text-sm mb-2">Verifying Card</p>
                                    <p className="text-white text-xl font-bold">{cardName}</p>
                                </div>

                                {/* Question */}
                                <div className="text-center mb-8">
                                    <p className="text-white text-lg font-medium">
                                        Is this card authentic?
                                    </p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        This decision will determine whether the card proceeds to grading
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Authentic Button */}
                                    <button
                                        onClick={handleAuthentic}
                                        disabled={isSubmitting}
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

                                    {/* Fake Button */}
                                    <button
                                        onClick={handleFake}
                                        disabled={isSubmitting}
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

                                {/* Warning */}
                                <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                                    <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-yellow-500 font-medium mb-1">Important</p>
                                        <p className="text-gray-300">
                                            Marking a card as fake will permanently reject it and prevent any further grading steps.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8">
                                {/* Confirmation Screen */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-4">
                                        <AlertTriangle size={40} className="text-red-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        Confirm Rejection
                                    </h3>
                                    <p className="text-gray-400">
                                        Are you sure you want to mark this card as counterfeit?
                                    </p>
                                </div>

                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                                    <p className="text-red-400 text-sm font-medium mb-2">This action will:</p>
                                    <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                        <li>• Set status to "Rejected - Counterfeit"</li>
                                        <li>• Terminate the grading process</li>
                                        <li>• Prevent any further status updates</li>
                                        <li>• Record the decision on blockchain</li>
                                    </ul>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={cancelFake}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-3 px-4 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmFake}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg py-3 px-4 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Processing...' : 'Confirm Rejection'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
