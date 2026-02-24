import { useState, useCallback } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import axios from 'axios';
import { uploadImage, api } from '../api';
import { createPortal } from 'react-dom';

interface SubmitCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function SubmitCardModal({ isOpen, onClose, onSuccess }: SubmitCardModalProps) {
    const [cardName, setCardName] = useState('');
    const [cardSet, setCardSet] = useState('');
    const [cardYear, setCardYear] = useState('');
    const [condition, setCondition] = useState('Near Mint');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Customer Info
    const [customerName, setCustomerName] = useState('');
    const [customerIdType, setCustomerIdType] = useState('NRIC');
    const [customerIdNumber, setCustomerIdNumber] = useState('');
    const [customerContact, setCustomerContact] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');

    const [imageUrl, setImageUrl] = useState('');
    const [isIdentifying, setIsIdentifying] = useState(false);

    const handleIdentify = async (url: string) => {
        setIsIdentifying(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/ai/identify`, { imageUrl: url });
            if (res.data.success && res.data.data) {
                const { card_name, card_set } = res.data.data;
                setCardName(card_name || '');

                // Parse card_set which may include year (e.g., "Paldean Fates 2024")
                const setMatch = card_set?.match(/^(.+?)\s+(\d{4})$/);
                if (setMatch) {
                    setCardSet(setMatch[1].trim());
                    setCardYear(setMatch[2]);
                } else {
                    setCardSet(card_set || '');
                }
            }
        } catch (error: any) {
            console.error('Identification failed:', error);
            const errorMessage = error.response?.data?.message || 'Failed to identify card';
            alert(`AI Identification Failed: ${errorMessage}`);
        } finally {
            setIsIdentifying(false);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/upload/cloudinary`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = uploadRes.data.url;
            setImageUrl(url);

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setImageFile(file);
            await handleUpload(file);
        }
    }, [import.meta.env.VITE_API_URL]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl) {
            alert("Please wait for the image to finish uploading.");
            return;
        }

        setUploading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/gradings`, {
                card_name: cardName,
                card_set: cardSet,
                card_year: cardYear,
                condition: condition,
                image_url: imageUrl,
                // Customer Data
                customer_name: customerName,
                customer_id_type: customerIdType,
                customer_id_number: customerIdNumber,
                customer_contact: customerContact,
                customer_email: customerEmail
            });

            alert("Card submitted for grading successfully!");
            onClose();
            // Reset form
            setCardName('');
            setCardSet('');
            setCardYear('');
            setCondition('Near Mint');
            setImageFile(null);
            setImageUrl('');
            setCustomerName('');
            setCustomerIdType('NRIC');
            setCustomerIdNumber('');
            setCustomerContact('');
            setCustomerEmail('');
            onSuccess?.(); // Use the callback if provided
            window.location.reload();
        } catch (error) {
            console.error('Error submitting card:', error);
            alert('Failed to submit card');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] transition-all"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl shadow-purple-500/10 relative"
            >
                {/* Header with Glass Effect */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-gray-900/80 backdrop-blur-md z-10">
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Submit New Card</h2>
                        <p className="text-xs text-gray-500 mt-1">Enter details or use AI to identify</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Customer Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Customer Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">ID Type</label>
                                <select
                                    value={customerIdType}
                                    onChange={(e) => setCustomerIdType(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium appearance-none"
                                >
                                    <option value="NRIC">NRIC</option>
                                    <option value="Passport">Passport</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">ID Number</label>
                                <input
                                    type="text"
                                    required
                                    value={customerIdNumber}
                                    onChange={(e) => setCustomerIdNumber(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium font-mono"
                                    placeholder="e.g. S1234567A"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Contact Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={customerContact}
                                    onChange={(e) => setCustomerContact(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium font-mono"
                                    placeholder="+65 9123 4567"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card Information Section */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Card Details</h3>
                            </div>
                            {isIdentifying && (
                                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold animate-pulse bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                    <Loader2 className="animate-spin" size={12} />
                                    AI IDENTIFYING...
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Card Name</label>
                            <input
                                type="text"
                                required
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className={`w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium ${isIdentifying ? 'opacity-50' : ''}`}
                                placeholder={isIdentifying ? "Identifying..." : "e.g. Charizard Base Set"}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Set</label>
                                <input
                                    type="text"
                                    value={cardSet}
                                    onChange={(e) => setCardSet(e.target.value)}
                                    className={`w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium ${isIdentifying ? 'opacity-50' : ''}`}
                                    placeholder={isIdentifying ? "Identifying..." : "e.g. Base Set"}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Year</label>
                                <input
                                    type="text"
                                    value={cardYear}
                                    onChange={(e) => setCardYear(e.target.value)}
                                    className={`w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium ${isIdentifying ? 'opacity-50' : ''}`}
                                    placeholder={isIdentifying ? "Identifying..." : "e.g. 1999"}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Condition (Declared)</label>
                            <select
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium appearance-none"
                            >
                                <option value="Mint">Mint</option>
                                <option value="Near Mint">Near Mint</option>
                                <option value="Excellent">Excellent</option>
                                <option value="Very Good">Very Good</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                            </select>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Card Image</label>
                        <div
                            {...getRootProps()}
                            className={`group border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                        >
                            <input {...getInputProps()} />

                            {/* Animated Background Gradient on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            {imageFile ? (
                                <div className="relative z-10">
                                    <div className="w-full h-48 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center p-2 mb-3">
                                        <img src={URL.createObjectURL(imageFile)} alt="Upload" className="h-full object-contain rounded shadow-lg" />
                                    </div>
                                    <div className="text-xs text-green-400 font-bold bg-green-500/10 inline-block px-3 py-1 rounded-full border border-green-500/20">
                                        ✓ Ready to Submit
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">{imageFile.name}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 py-4 relative z-10">
                                    <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                                        {uploading ? <Loader2 className="animate-spin text-blue-400" size={32} /> : <Upload size={32} className="text-gray-400 group-hover:text-white transition-colors" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-300 group-hover:text-white transition-colors">Click to upload or drag & drop</p>
                                        <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">Supports JPG, PNG (Max 10MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {imageFile && imageUrl && (
                            <button
                                type="button"
                                onClick={() => handleIdentify(imageUrl)}
                                disabled={isIdentifying}
                                className="w-full py-2.5 bg-black/40 border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 rounded-lg text-xs font-bold text-gray-300 hover:text-purple-300 flex items-center justify-center gap-2 transition-all disabled:opacity-50 uppercase tracking-wide group"
                            >
                                {isIdentifying ? (
                                    <Loader2 size={14} className="animate-spin text-purple-400" />
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-purple-500 mb-0.5 group-hover:animate-pulse"></span>
                                )}
                                {isIdentifying ? 'Analyzing Card...' : 'Auto-Identify Card with AI'}
                            </button>
                        )}
                    </div>

                    <div className="pt-4 mt-8 border-t border-white/5">
                        <button
                            type="submit"
                            disabled={uploading || !imageFile}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center gap-3 text-white transition-all duration-300 text-lg"
                        >
                            {uploading ? <Loader2 className="animate-spin" size={24} /> : null}
                            {uploading ? 'Processing Submission...' : 'Submit Card for Grading'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>,
        document.body
    );
}
