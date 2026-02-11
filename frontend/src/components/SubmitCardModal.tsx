import { useState, useCallback } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
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
    const [condition, setCondition] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadImage(file);
            if (res.data.success) {
                setImageUrl(res.data.url);
            } else {
                alert("Upload failed");
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("Upload error");
        } finally {
            setUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageUrl) {
            alert("Please upload an image first.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('/gradings', {
                card_name: cardName,
                card_set: cardSet,
                card_year: cardYear,
                condition: condition,
                image_url: imageUrl
            });

            if (res.data.success) {
                alert("Card submitted for grading successfully!");
                // Reset form
                setCardName('');
                setCardSet('');
                setCardYear('');
                setCondition('');
                setImageUrl('');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Submission failed", error);
            alert("Failed to submit card.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Submit Card for Grading
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Image Upload */}
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
                            }`}
                    >
                        <input {...getInputProps()} />
                        {imageUrl ? (
                            <div className="relative">
                                <img src={imageUrl} alt="Upload" className="h-40 mx-auto rounded object-contain" />
                                <div className="text-xs text-green-400 mt-2">✓ Image Uploaded</div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                {uploading ? <Loader2 className="animate-spin text-blue-400" size={32} /> : <Upload size={32} />}
                                <div>
                                    <p className="font-medium">Drag & drop card image here</p>
                                    <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card Details */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Card Name *</label>
                        <input
                            type="text"
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                            placeholder="e.g. Charizard"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Set</label>
                            <input
                                type="text"
                                value={cardSet}
                                onChange={e => setCardSet(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                placeholder="e.g. Base Set"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                            <input
                                type="text"
                                value={cardYear}
                                onChange={e => setCardYear(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                placeholder="e.g. 1999"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                        <select
                            value={condition}
                            onChange={e => setCondition(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Select Condition</option>
                            <option value="Mint">Mint</option>
                            <option value="Near Mint">Near Mint</option>
                            <option value="Excellent">Excellent</option>
                            <option value="Very Good">Very Good</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || uploading || !imageUrl}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-6"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : null}
                        Submit for Grading
                    </button>
                </form>
            </div>
        </div>
    );
}
