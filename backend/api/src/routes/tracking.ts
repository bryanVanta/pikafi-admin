import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();
const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;

// Normalize carrier names for Shippo
const normalizeCarrier = (carrier: string) => {
    const c = carrier.toLowerCase();
    if (c.includes('fedex')) return 'fedex';
    if (c.includes('ups')) return 'ups';
    return c;
};

/**
 * GET /api/tracking/:carrier/:trackingNumber
 * Fetches real-time tracking information from Shippo
 */
router.get('/:carrier/:trackingNumber', async (req: Request, res: Response) => {
    try {
        const carrier = req.params.carrier as string;
        const trackingNumber = req.params.trackingNumber as string;
        const normalizedCarrier = normalizeCarrier(carrier);

        if (!SHIPPO_API_KEY) {
            // If no API key, return mockup data if in development, or error
            if (process.env.NODE_ENV !== 'production') {
                console.warn('⚠️ SHIPPO_API_KEY not found. Returning mock data.');
                return res.json({
                    success: true,
                    mock: true,
                    tracking: {
                        tracking_number: trackingNumber,
                        carrier: normalizedCarrier,
                        status: 'TRANSIT',
                        status_details: 'Your package is in transit.',
                        tracking_status: {
                            status: 'TRANSIT',
                            status_details: 'Arrived at FedEx Hub',
                            status_date: new Date().toISOString(),
                            location: {
                                city: 'Memphis',
                                state: 'TN',
                                country: 'US'
                            }
                        },
                        tracking_history: [
                            {
                                status: 'TRANSIT',
                                status_details: 'Arrived at Hub',
                                status_date: new Date(Date.now() - 3600000).toISOString(),
                                location: { city: 'Memphis', state: 'TN' }
                            },
                            {
                                status: 'TRANSIT',
                                status_details: 'In Transit',
                                status_date: new Date(Date.now() - 7200000).toISOString(),
                                location: { city: 'Dallas', state: 'TX' }
                            },
                            {
                                status: 'PRE_TRANSIT',
                                status_details: 'Label Created',
                                status_date: new Date(Date.now() - 86400000).toISOString(),
                                location: { city: 'Austin', state: 'TX' }
                            }
                        ],
                        eta: new Date(Date.now() + 86400000).toISOString()
                    }
                });
            }
            return res.status(500).json({ success: false, message: 'Tracking service not configured' });
        }

        const response = await axios.get(
            `https://api.goshippo.com/tracks/${normalizedCarrier}/${trackingNumber}`,
            {
                headers: {
                    'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            tracking: response.data
        });

    } catch (error: any) {
        console.error('Tracking API Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: 'Failed to fetch tracking information',
            error: error.response?.data || error.message
        });
    }
});

export default router;
