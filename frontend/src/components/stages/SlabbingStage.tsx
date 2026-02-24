import { useState, useCallback } from 'react';
import { Package, SmartphoneNfc, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import type { StageProps } from '../../types/grading';

export function SlabbingStage({ grading, onUpdateStatus, isUpdating }: StageProps) {
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('image', file);
                const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/upload/cloudinary`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setImageUrl(uploadRes.data.url);
            } catch (error) {
                console.error('Upload failed:', error);
                alert('Image upload failed');
            } finally {
                setUploading(false);
            }
        }
    }, [import.meta.env.VITE_API_URL]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const handleProceed = () => {
        onUpdateStatus('Ready for Return', undefined, { slabbing_proof_image: imageUrl });
    };
    return (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <span className="text-blue-400 text-sm font-black">05</span>
                </div>
                <div className="flex-1">
                    <span className="text-white block">Slabbing & Encapsulation</span>
                    <span className="text-gray-500 text-xs font-normal mt-0.5 block">{grading.card_name}</span>
                </div>
            </h2>

            <div className="flex flex-col items-center justify-center py-4 relative z-10">
                <div className="text-center max-w-lg w-full">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/10 relative group">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-50" />
                        <Package size={48} className="text-blue-400 relative z-10" strokeWidth={1.5} />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3">Ready for Encapsulation</h3>
                    <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                        Generate label, print NFC certificate, and encapsulate the card in the slab.
                    </p>

                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-8 backdrop-blur-sm">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Label Specifications</h4>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <span className="text-gray-400 text-left">Card Identity</span>
                            <span className="text-white font-medium text-right truncate">{grading.card_name}</span>

                            <span className="text-gray-400 text-left">Expansion Set</span>
                            <span className="text-white font-medium text-right">{grading.card_set}</span>

                            <span className="text-gray-400 text-left">Assigned Grade</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-black text-right">{grading.grade}</span>

                            {grading.grade_surface !== undefined && grading.grade_edges !== undefined && grading.grade_corners !== undefined && grading.grade_centering !== undefined && (
                                <div className="col-span-2 grid grid-cols-4 gap-2 my-2 pt-3 border-t border-white/5 text-center">
                                    <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Surface</div>
                                        <div className="text-base font-bold text-white">{grading.grade_surface}</div>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Edges</div>
                                        <div className="text-base font-bold text-white">{grading.grade_edges}</div>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Corners</div>
                                        <div className="text-base font-bold text-white">{grading.grade_corners}</div>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Centering</div>
                                        <div className="text-base font-bold text-white">{grading.grade_centering}</div>
                                    </div>
                                </div>
                            )}

                            <span className="text-gray-400 text-left self-center">Cert ID</span>
                            <span className="text-white font-mono text-right bg-black/30 px-2 py-0.5 rounded border border-white/5 self-center">#{grading.uid.toString().padStart(8, '0')}</span>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-8 backdrop-blur-sm">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Proof of Slabbing</h4>
                        {imageUrl ? (
                            <div className="relative rounded-xl overflow-hidden aspect-[3/4] w-64 mx-auto border border-white/10 group shadow-2xl">
                                <img src={imageUrl} alt="Slabbing Proof" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => setImageUrl('')}
                                        className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm font-bold backdrop-blur-sm transition-colors"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 aspect-[3/4] w-64 mx-auto flex flex-col justify-center
                                ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500 hover:bg-white/5'}`}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center gap-4 text-gray-400">
                                    {uploading ? (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center -mb-2">
                                                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-blue-400">Uploading...</p>
                                                <p className="text-sm mt-1">Please wait</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center -mb-2 transition-colors ${isDragActive ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                                                <Upload size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white mb-1">Upload Photo Proof</p>
                                                <p className="text-sm">Drag & drop or click to select</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleProceed}
                        disabled={isUpdating || !imageUrl || uploading}
                        className="w-full flex justify-center items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                    >
                        {isUpdating ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <SmartphoneNfc size={20} />
                                <span>Confirm Encapsulation Complete</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
