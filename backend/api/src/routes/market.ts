
import express, { Request, Response, Router } from 'express';
import { query } from '../db';

const router = Router();

// POST /list - Create a new listing
router.post('/list', async (req: Request, res: Response) => {
    try {
        const { name, description, price, imageUrl, seller, grade, ipfsHash } = req.body;

        if (!name || !price || !imageUrl) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }

        const text = `
            INSERT INTO listings (name, description, price, image_url, seller, status, grade, ipfs_hash)
            VALUES ($1, $2, $3, $4, $5, 'active', $6, $7)
            RETURNING *
        `;
        const values = [
            name,
            description || '',
            price,
            imageUrl,
            seller || 'Anonymous',
            grade || 'Ungraded',
            ipfsHash || null
        ];

        const result = await query(text, values);

        res.status(201).json({
            success: true,
            message: 'Listing created successfully',
            data: result.rows[0]
        });

    } catch (error: any) {
        console.error('Error creating listing:', error);
        res.status(500).json({ success: false, message: 'Failed to create listing' });
    }
});

router.get('/listings', async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT * FROM listings WHERE status = $1 ORDER BY created_at DESC', ['active']);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error: any) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch listings' });
    }
});

// GET /listings/:id - Fetch a single listing by ID
router.get('/listings/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // The instruction snippet changed this to directly use the query and removed 'text' and 'values'.
        const result = await query('SELECT * FROM listings WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Listing not found' });
            return;
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error: any) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch listing' });
    }
});

// PUT /listings/:id/status - Update listing status (e.g., to 'sold')
router.put('/listings/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, txHash } = req.body;

        if (!status) {
            res.status(400).json({ success: false, message: 'Status is required' });
            return;
        }

        const text = `
            UPDATE listings 
            SET status = $1, tx_hash = $2
            WHERE id = $3
            RETURNING *
        `;
        const values = [status, txHash || null, id];

        const result = await query(text, values);

        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Listing not found' });
            return;
        }

        res.json({
            success: true,
            message: 'Listing updated successfully',
            data: result.rows[0]
        });

    } catch (error: any) {
        console.error('Error updating listing:', error);
        res.status(500).json({ success: false, message: 'Failed to update listing' });
    }
});

export default router;
