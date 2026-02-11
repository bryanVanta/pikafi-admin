
import express, { Request, Response, Router } from 'express';
import { identifyCard } from '../services/ai';

const router = Router();

// Identify Card
router.post('/identify', async (req: Request, res: Response) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            res.status(400).json({ success: false, message: 'Image URL is required' });
            return;
        }

        const cardDetails = await identifyCard(imageUrl);
        res.json({ success: true, data: cardDetails });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
