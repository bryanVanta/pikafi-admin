import express, { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import stream from 'stream';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No image file provided' });
            return;
        }

        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'pikafi-gradings' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            bufferStream.pipe(uploadStream);
        });

        res.json({
            success: true,
            // @ts-ignore
            url: uploadResult.secure_url,
            // @ts-ignore
            public_id: uploadResult.public_id
        });

    } catch (error: any) {
        console.error('Upload failed:', error);
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
});

export default router;
