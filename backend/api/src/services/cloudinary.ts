
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryResponse {
    success: boolean;
    url?: string; // Secure HTTPS URL for display
    publicId?: string;
    error?: string;
}

export const uploadToCloudinary = async (file: Express.Multer.File): Promise<CloudinaryResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'vantatech-marketplace',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    resolve({
                        success: false,
                        error: error.message
                    });
                } else {
                    console.log('Cloudinary Upload Success:', result?.secure_url);
                    resolve({
                        success: true,
                        url: result?.secure_url,
                        publicId: result?.public_id
                    });
                }
            }
        );

        // Convert buffer to stream and pipe to Cloudinary
        const stream = Readable.from(file.buffer);
        stream.pipe(uploadStream);
    });
};
