import { useState, useCallback } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import axios from 'axios';
import { uploadImage, api } from '../api';

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

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setImageFile(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            let imageUrl = '';
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/upload/cloudinary`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = uploadRes.data.url;
            }

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
            setCustomerName('');
            setCustomerIdType('NRIC');
            setCustomerIdNumber('');
            setCustomerContact('');
            setCustomerEmail('');
            window.location.reload();
        } catch (error) {
            console.error('Error submitting card:', error);
            alert('Failed to submit card');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-900 z-10">
                    <h2 className="text-xl font-bold text-white">Submit New Card</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Customer Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-zinc-300 border-b border-zinc-800 pb-2">Customer Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">ID Type</label>
                                <select
                                    value={customerIdType}
                                    onChange={(e) => setCustomerIdType(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                                >
                                    <option value="NRIC">NRIC</option>
                                    <option value="Passport">Passport</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">ID Number</label>
                                <input
                                    type="text"
                                    required
                                    value={customerIdNumber}
                                    onChange={(e) => setCustomerIdNumber(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                                    placeholder="e.g. S1234567A"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Contact Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={customerContact}
                                    onChange={(e) => setCustomerContact(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                                    placeholder="+65 9123 4567"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-zinc-300 border-b border-zinc-800 pb-2">Card Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Card Name</label>
                            <input
                                type="text"
                                required
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                                placeholder="e.g. Charizard Base Set"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Set</label>
                                <input
                                    type="text"
                                    value={cardSet}
                                    onChange={(e) => setCardSet(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                                    placeholder="e.g. Base Set"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Year</label>
                                <input
                                    type="text"
                                    value={cardYear}
                                    onChange={(e) => setCardYear(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                                    placeholder="e.g. 1999"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Condition</label>
                            <select
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
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
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 hover:border-zinc-600'}`}
                    >
                        <input {...getInputProps()} />
                        {imageFile ? (
                            <div className="relative">
                                {/* Create a fake URL for preview if it's a File object */}
                                <img src={URL.createObjectURL(imageFile)} alt="Upload" className="h-40 mx-auto rounded object-contain" />
                                <div className="text-xs text-green-400 mt-2">✓ Image Selected: {imageFile.name}</div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-zinc-400">
                                {uploading ? <Loader2 className="animate-spin text-blue-400" size={32} /> : <Upload size={32} />}
                                <div>
                                    <p className="font-medium">Drag & drop card image here</p>
                                    <p className="text-sm text-zinc-500 mt-1">or click to browse</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={uploading || !imageFile}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-6 text-white"
                    >
                        {uploading ? <Loader2 className="animate-spin" size={20} /> : null}
                        {uploading ? 'Processing...' : 'Submit for Grading'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
