import express, { Request, Response, Router } from 'express';
import { query } from '../db';

const router = Router();

// GET /api/messages/contacts - Fetch distinct chat contacts with their latest message
router.get('/contacts', async (req: Request, res: Response) => {
    try {
        const result = await query(
            `WITH RankedMessages AS (
                SELECT 
                    m.user_email,
                    m.message,
                    m.timestamp,
                    m.sender_type,
                    ROW_NUMBER() OVER(PARTITION BY m.user_email ORDER BY m.timestamp DESC) as rn
                FROM chat_messages m
            )
            SELECT 
                r.user_email as email,
                r.message as latest_message,
                r.timestamp,
                r.sender_type,
                COALESCE(c.name, split_part(r.user_email, '@', 1)) as name
            FROM RankedMessages r
            LEFT JOIN customers c ON LOWER(c.email) = LOWER(r.user_email)
            WHERE r.rn = 1
            ORDER BY r.timestamp DESC`
        );
        res.json({ success: true, contacts: result.rows });
    } catch (err: any) {
        console.error('Error fetching chat contacts:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch chat contacts' });
    }
});

// GET /api/messages/:email - Fetch chat history for a specific user
router.get('/:email', async (req: Request, res: Response) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email required' });
        }

        const result = await query(
            'SELECT * FROM chat_messages WHERE LOWER(user_email) = LOWER($1) ORDER BY timestamp ASC',
            [email]
        );

        res.json({ success: true, messages: result.rows });
    } catch (err: any) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
});

// POST /api/messages - Send a new message
router.post('/', async (req: Request, res: Response) => {
    try {
        const { user_email, sender_type, message } = req.body;

        if (!user_email || !sender_type || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const result = await query(
            `INSERT INTO chat_messages (user_email, sender_type, message, timestamp) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [user_email, sender_type, message, Date.now()]
        );

        res.status(201).json({ success: true, message: result.rows[0] });
    } catch (err: any) {
        console.error('Error sending message:', err);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

export default router;
