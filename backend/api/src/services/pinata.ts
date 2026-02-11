import pinataSDK from '@pinata/sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

const pinata = new pinataSDK(
    process.env.PINATA_API_KEY,
    process.env.PINATA_SECRET_KEY
);

interface PinataResponse {
    success: boolean;
    ipfsHash?: string;
    pinataUrl?: string;
    error?: string;
}

export const uploadToIPFS = async (file: Express.Multer.File, metadata?: any): Promise<PinataResponse> => {
    try {
        console.log(`Starting upload for file: ${file.originalname}`);

        // Convert buffer to readable stream for Pinata
        const stream = Readable.from(file.buffer);
        // Add path property which is required by Pinata SDK for streams but not on standard Readable
        (stream as any).path = file.originalname;

        const options = {
            pinataMetadata: {
                name: metadata?.name || file.originalname,
                keyvalues: metadata?.keyvalues || {}
            },
            pinataOptions: {
                cidVersion: 0 as 0 | 1
            }
        };

        const result = await pinata.pinFileToIPFS(stream, options);

        console.log('Pinata Upload Success:', result);

        return {
            success: true,
            ipfsHash: result.IpfsHash,
            pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
        };

    } catch (error: any) {
        console.error('Pinata Upload Error Message:', error.message);
        if (error.details) console.error('Pinata Error Details:', error.details);
        if (error.response) {
            console.error('Pinata API Status:', error.response.status);
            console.error('Pinata API Data:', JSON.stringify(error.response.data, null, 2));
        }
        return {
            success: false,
            error: error.message || 'Unknown Pinata Error'
        };
    }
};

export const testConnection = async () => {
    try {
        const result = await pinata.testAuthentication();
        console.log('Pinata Auth Test:', result);
        return result.authenticated;
    } catch (error) {
        console.error('Pinata Auth Failed:', error);
        return false;
    }
}
