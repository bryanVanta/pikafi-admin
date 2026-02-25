import React, { useState, useRef } from 'react';
import { Camera, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface MiniImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
}

export const MiniImageUploader: React.FC<MiniImageUploaderProps> = ({ value, onChange }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/upload/cloudinary`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onChange(uploadRes.data.url);
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Image upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            {uploading ? (
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-500/20 text-blue-400">
                    <Loader2 size={12} className="animate-spin" />
                </div>
            ) : value ? (
                <button
                    onClick={() => window.open(value, '_blank')}
                    title="View uploaded image"
                    className="flex justify-center items-center focus:outline-none"
                >
                    <div className="relative w-6 h-6 rounded border border-green-500/50 hover:border-green-400 transition-colors shadow-lg">
                        <img src={value} alt="Proof" className="w-full h-full object-cover rounded-[3px]" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-[3px]">
                            <CheckCircle2 size={10} className="text-green-400" />
                        </div>
                    </div>
                </button>
            ) : (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload proof image"
                    className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/20"
                >
                    <Camera size={12} />
                </button>
            )}
        </div>
    );
};
