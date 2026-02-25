import { useState } from 'react';
import { Truck, MapPin, Mail, User, BoxSelect, Store } from 'lucide-react';
import type { StageProps } from '../../types/grading';

export function ReadyForReturnStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    const [returnMethod, setReturnMethod] = useState<'pickup' | 'delivery'>('delivery');
    const [trackingProvider, setTrackingProvider] = useState('FedEx Priority');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState(grading.customer_address || '');
    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                    <span className="text-green-400 text-sm font-black">06</span>
                </div>
                <div className="flex-1">
                    <span className="text-white block">Ready for Return</span>
                    <span className="text-gray-500 text-xs font-normal mt-0.5 block">{grading.card_name}</span>
                </div>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Shipping Destination</h3>
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5 uppercase font-bold">Recipient</p>
                                <p className="text-white font-bold text-lg">{grading.customer_name}</p>
                                <p className="text-gray-400 text-sm">{grading.customer_contact}</p>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 w-full" />

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5 uppercase font-bold">Address</p>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {grading.customer_address || '—'}
                                </p>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 w-full" />

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5 uppercase font-bold">Contact Email</p>
                                <p className="text-gray-300 text-sm">{grading.customer_email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Logistics Details</h3>
                        <div className="bg-gray-800/30 rounded-2xl p-6 border border-white/5 space-y-6">
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                <button
                                    onClick={() => setReturnMethod('pickup')}
                                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${returnMethod === 'pickup' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Store size={18} /> In-Store Pickup
                                </button>
                                <button
                                    onClick={() => setReturnMethod('delivery')}
                                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${returnMethod === 'delivery' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Truck size={18} /> Delivery
                                </button>
                            </div>

                            {returnMethod === 'delivery' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Delivery Address</label>
                                        <textarea
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            placeholder="Enter full delivery address..."
                                            rows={3}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-green-500/50 placeholder-gray-700 transition-all resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Carrier Service</label>
                                        <div className="relative">
                                            <BoxSelect className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <select
                                                value={trackingProvider}
                                                onChange={(e) => setTrackingProvider(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-green-500/50 appearance-none"
                                            >
                                                <option value="FedEx Priority">FedEx Priority</option>
                                                <option value="UPS Worldwide">UPS Worldwide</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Tracking Number</label>
                                        <input
                                            type="text"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            placeholder="Enter tracking ID..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-green-500/50 font-mono tracking-wide placeholder-gray-700 transition-all"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-6 bg-black/20 rounded-xl border border-white/5">
                                    <Store size={32} className="mx-auto text-blue-400 mb-3 opacity-80" />
                                    <p className="text-white font-bold">Ready for Pickup</p>
                                    <p className="text-sm text-gray-400 mt-1 px-4">The customer will be notified to collect their card at the store.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            const newStatus = returnMethod === 'delivery' ? 'Shipped' : 'Ready for Pickup';
                            onUpdateStatus(newStatus, undefined, {
                                return_method: returnMethod,
                                tracking_provider: returnMethod === 'delivery' ? trackingProvider : undefined,
                                tracking_number: returnMethod === 'delivery' ? trackingNumber : undefined,
                                customer_address: returnMethod === 'delivery' ? deliveryAddress : undefined
                            });
                        }}
                        disabled={isUpdating}
                        className="mt-8 w-full flex justify-center items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl"
                    >
                        {isUpdating ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Truck size={20} />
                                <span>{returnMethod === 'delivery' ? 'Mark as Shipped' : 'Mark Ready for Pickup'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
