import { Truck } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function ReadyForReturnStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    return (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">6</span>
                Ready for Return
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-medium text-white mb-4">Customer Details</h3>
                    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Name</span>
                            <span className="text-white font-medium">{grading.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Contact</span>
                            <span className="text-white">{grading.customer_contact}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Email</span>
                            <span className="text-white">{grading.customer_email}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-600 mt-2">
                            <p className="text-xs text-gray-500 mb-1">Return Address</p>
                            <p className="text-gray-300 text-sm">
                                {/* Placeholder for address - would come from DB */}
                                123 Pokemon Center Way<br />
                                Palette Town, Kanto 12345
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-white mb-4">Shipping Info</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Tracking Number</label>
                                <input
                                    type="text"
                                    placeholder="Enter tracking number"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Carrier</label>
                                <select className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500">
                                    <option>DHL</option>
                                    <option>FedEx</option>
                                    <option>UPS</option>
                                    <option>Local Post</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onUpdateStatus('Completed')}
                        disabled={isUpdating}
                        className="mt-8 flex justify-center items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <Truck size={20} />
                        {isUpdating ? 'Completing...' : 'Mark Order as Complete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
