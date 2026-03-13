import React, { useState, useEffect } from 'react';
import { Box, Truck, CheckCircle2, User, MapPin, Clock, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import type { StageProps } from '../../types/grading';
import axios from 'axios';
import { API_BASE } from '../../config';

interface TrackingData {
    status: string;
    status_details: string;
    eta?: string;
    tracking_status?: {
        status: string;
        status_details: string;
        status_date: string;
        location?: {
            city?: string;
            state?: string;
            country?: string;
        };
    };
    tracking_history: Array<{
        status: string;
        status_details: string;
        status_date: string;
        location?: {
            city?: string;
            state?: string;
        };
    }>;
}

export function ShippedStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [loadingTracking, setLoadingTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTrackingInfo = async () => {
        if (!grading.tracking_number || !grading.tracking_provider) return;
        setLoadingTracking(true);
        setError(null);
        try {
            const provider = grading.tracking_provider.toLowerCase();
            const res = await axios.get(`${API_BASE}/tracking/${provider}/${grading.tracking_number}`);
            if (res.data.success) {
                setTrackingData(res.data.tracking);
            }
        } catch (err: any) {
            console.error('Failed to fetch tracking:', err);
            setError('Could not fetch live tracking data. Please check carrier website.');
        } finally {
            setLoadingTracking(false);
        }
    };

    useEffect(() => {
        fetchTrackingInfo();
    }, [grading.tracking_number, grading.tracking_provider]);

    const getStatusColor = (status: string) => {
        const s = status?.toUpperCase();
        if (s === 'DELIVERED') return 'text-green-400';
        if (s === 'TRANSIT') return 'text-blue-400';
        if (s === 'FAILURE' || s === 'RETURNED') return 'text-red-400';
        return 'text-gray-400';
    };

    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <span className="text-blue-400 text-sm font-black">07</span>
                </div>
                <div className="flex-1">
                    <span className="text-white block">Shipped (In Transit)</span>
                    <span className="text-gray-500 text-xs font-normal mt-0.5 block">{grading.card_name}</span>
                </div>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Column 1: Core Info */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Tracking Information</h3>
                        <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5 uppercase font-bold">Carrier</p>
                                    <p className="text-white font-bold text-lg">{grading.tracking_provider || 'Not Specified'}</p>
                                </div>
                            </div>

                            <div className="h-px bg-white/5 w-full" />

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Box size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-0.5 uppercase font-bold">Tracking Number</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="text-gray-300 font-mono tracking-wide bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                            {grading.tracking_number || 'N/A'}
                                        </code>
                                        {grading.tracking_number && (
                                            <a
                                                href={grading.tracking_provider?.toLowerCase().includes('fedex')
                                                    ? `https://www.fedex.com/fedextrack/?trknbr=${grading.tracking_number}`
                                                    : `https://www.ups.com/track?tracknum=${grading.tracking_number}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-gray-500 hover:text-white transition-colors"
                                                title="View on carrier website"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Recipient</h3>
                        <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                            <div className="flex items-center gap-3">
                                <User size={16} className="text-gray-500" />
                                <span className="text-sm text-gray-300 font-bold">{grading.customer_name}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-gray-500 mt-1" />
                                <span className="text-sm text-gray-300 leading-relaxed">
                                    {grading.customer_address || 'No address provided'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Live Tracking Timeline */}
                <div className="lg:col-span-2 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Live Status</h3>
                        {loadingTracking ? (
                            <RefreshCw size={14} className="text-blue-400 animate-spin" />
                        ) : (
                            <button onClick={fetchTrackingInfo} className="text-gray-500 hover:text-white transition-colors">
                                <RefreshCw size={14} />
                            </button>
                        )}
                    </div>

                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 flex-1 overflow-hidden flex flex-col">
                        {error ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                                <AlertCircle size={32} className="text-gray-600" />
                                <p className="text-gray-500 text-sm max-w-xs">{error}</p>
                            </div>
                        ) : trackingData ? (
                            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                                {/* Current Status Summary */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-tight">Current Status</p>
                                        <p className={`text-lg font-black mt-1 ${getStatusColor(trackingData.status)}`}>
                                            {trackingData.status || 'UNKNOWN'}
                                        </p>
                                    </div>
                                    {trackingData.eta && (
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-tight">Est. Delivery</p>
                                            <p className="text-white font-bold">{new Date(trackingData.eta).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Timeline */}
                                <div className="relative pl-6 space-y-8">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-blue-500/20 to-transparent" />

                                    {trackingData.tracking_history.map((event, idx) => (
                                        <div key={idx} className="relative">
                                            {/* Dot */}
                                            <div className={`absolute -left-[23px] top-1.5 w-4 h-4 rounded-full border-2 border-gray-900 z-10 ${idx === 0 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-700'}`} />

                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm font-bold ${idx === 0 ? 'text-white' : 'text-gray-400'}`}>
                                                        {event.status_details}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {new Date(event.status_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </p>
                                                </div>
                                                {event.location && (
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <MapPin size={10} />
                                                        {event.location.city}, {event.location.state}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 animate-pulse">
                                <Truck size={32} className="text-gray-700" />
                                <p className="text-gray-600 text-sm">Synchronizing with carrier data...</p>
                            </div>
                        )}

                        <div className="mt-auto pt-6 border-t border-white/5">
                            <button
                                onClick={() => onUpdateStatus('Delivered')}
                                disabled={isUpdating}
                                className="w-full flex justify-center items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                            >
                                {isUpdating ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} />
                                        <span>Confirm Delivery Receipt</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
