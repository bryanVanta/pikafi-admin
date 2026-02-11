import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import { uploadToIPFS, testConnection } from '../services/pinata';


import { uploadToCloudinary } from '../services/cloudinary';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Test Pinata Auth
router.get('/test', async (req: Request, res: Response) => {
    const isAuth = await testConnection();
    if (isAuth) {
        res.json({ success: true, message: 'Pinata authenticated successfully' });
    } else {
        res.status(401).json({ success: false, message: 'Pinata authentication failed' });
    }
});

// Upload File (Hybrid: IPFS + Cloudinary)
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }

        const metadata = req.body;

        // Upload to both services in parallel
        const [ipfsResult, cloudinaryResult] = await Promise.all([
            uploadToIPFS(req.file, metadata),
            uploadToCloudinary(req.file)
        ]);

        if (ipfsResult.success || cloudinaryResult.success) {
            res.json({
                success: true,
                pinataUrl: ipfsResult.pinataUrl,
                ipfsHash: ipfsResult.ipfsHash,
                cloudinaryUrl: cloudinaryResult.url,
                message: 'Upload successful'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Upload failed for both services',
                ipfsError: ipfsResult.error,
                cloudinaryError: cloudinaryResult.error
            });
        }
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
