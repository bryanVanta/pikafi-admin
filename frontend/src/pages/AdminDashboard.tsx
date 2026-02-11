import { useEffect, useState, useCallback } from 'react';
import { getTransactions, api, type Transaction, getGradingDetails, uploadImage } from '../api';
import { Check, Loader2, Search, Upload, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { SubmitCardModal } from '../components/SubmitCardModal';

export function AdminDashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [gradings, setGradings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [gradingDetails, setGradingDetails] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Grading Form State
    const [cardName, setCardName] = useState('');
    const [cardSet, setCardSet] = useState('');
    const [cardYear, setCardYear] = useState('');
    const [condition, setCondition] = useState('');
    const [grade, setGrade] = useState('');

    // Sub-grades
    const [gradeCorners, setGradeCorners] = useState('');
    const [gradeEdges, setGradeEdges] = useState('');
    const [gradeSurface, setGradeSurface] = useState('');
    const [gradeCentering, setGradeCentering] = useState('');

    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);

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

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 });

    const fetchTransactions = async () => {
        try {
            const res = await getTransactions();
            if (res.success) {
                setTransactions(res.transactions);
            }
        } catch (error) {
            console.error("Failed to fetch", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGradings = async () => {
        try {
            const res = await api.get('/gradings');
            if (res.data.success) {
                setGradings(res.data.gradings);
            }
        } catch (error) {
            console.error("Failed to fetch gradings", error);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchGradings();
        const interval = setInterval(() => {
            fetchTransactions();
            fetchGradings();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Fetch details when selectedTx changes
    useEffect(() => {
        if (selectedTx && selectedTx.status === 1) { // If Approved/Graded
            getGradingDetails(selectedTx.id).then(res => {
                if (res.success) {
                    setGradingDetails(res.grading);
                } else {
                    setGradingDetails(null);
                }
            });
        } else {
            setGradingDetails(null);
            // Reset form if starting new
            setCardName('');
            setCardSet('');
            setCardYear('');
            setCondition('');
            setGrade('');
            setGradeCorners('');
            setGradeEdges('');
            setGradeSurface('');
            setGradeCentering('');
            setImageUrl('');
        }
    }, [selectedTx]);

    const handleGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTx) return;

        if (!imageUrl) {
            alert("Please upload an image first.");
            return;
        }

        setProcessing(true);
        try {
            // Send everything to backend
            const extraData = {
                card_name: cardName,
                card_set: cardSet,
                card_year: cardYear,
                condition: condition,
                image_url: imageUrl,
                grade: parseFloat(grade),
                grade_corners: parseFloat(gradeCorners),
                grade_edges: parseFloat(gradeEdges),
                grade_surface: parseFloat(gradeSurface),
                grade_centering: parseFloat(gradeCentering)
            };

            const newData = JSON.stringify({ status: "Graded", grade, ref: "db" });

            const res = await api.post(`/transactions/${selectedTx.id}/approve`, {
                newRecipient: selectedTx.recipient, // Keep same recipient
                newAmount: selectedTx.amount,       // Keep same amount
                newData: newData,
                ...extraData
            });

            if (res.data.success) {
                alert("Graded successfully!");
                setSelectedTx(null);
                fetchTransactions();
            }
        } catch (error) {
            console.error("Grading failed", error);
            alert("Failed to submit grade.");
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0: return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-bold">Pending</span>;
            case 1: return <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-bold">Graded (Approved)</span>;
            case 2: return <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs font-bold">Rejected</span>;
            default: return <span className="px-2 py-1 bg-gray-500/20 text-gray-500 rounded text-xs font-bold">Unknown</span>;
        }
    };

    const getGradingStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            'Submitted': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'Authentication in Progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'Condition Inspection': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            'Grading Assigned': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'Encapsulation/Slabbing': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
            'Quality Control': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
            'Complete': 'bg-green-500/20 text-green-400 border-green-500/30',
            'Delivered': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        };
        return statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    // Parse data field if it looks like JSON
    const parseData = (dataHex: string) => {
        if (!dataHex || dataHex === '0x') return 'No Data';
        try {
            // Remove 0x prefix
            const hex = dataHex.startsWith('0x') ? dataHex.slice(2) : dataHex;
            // Convert hex to string
            let str = '';
            for (let i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }
            // Remove null bytes if any
            str = str.replace(/\0/g, '');
            return str;
        } catch (e) {
            console.error("Failed to parse data:", e);
            return dataHex;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <header className="mb-8 flex justify-between items-center bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400">Manage and Grade Client Requests</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all"
                >
                    <Plus size={20} />
                    Submit Card
                </button>
            </header>

            {/* Grading Cards Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-300">Grading Submissions</h2>
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin text-blue-400" size={48} />
                    </div>
                ) : gradings.length === 0 ? (
                    <div className="text-center p-12 text-gray-500 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                        No grading submissions yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {gradings.map((grading) => (
                            <motion.div
                                key={grading.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-800 rounded-xl border border-gray-700 overflow-visible hover:border-blue-500/50 transition-all shadow-lg relative pt-6"
                            >
                                {/* Circular ID Badge at top center */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-gray-900 flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-sm">{grading.uid || grading.id}</span>
                                    </div>
                                </div>

                                <div className="aspect-[3/4] bg-gray-900 relative overflow-hidden rounded-t-xl">
                                    <img
                                        src={grading.image_url}
                                        alt={grading.card_name}
                                        className="w-full h-full object-contain"
                                    />
                                    {grading.grade && (
                                        <div className="absolute top-2 right-2 bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded-lg shadow-lg">
                                            {grading.grade}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-white mb-1">{grading.card_name}</h3>
                                        <div className="flex gap-2 text-sm text-gray-400">
                                            {grading.card_set && <span>{grading.card_set}</span>}
                                            {grading.card_year && <span>• {grading.card_year}</span>}
                                        </div>
                                    </div>

                                    {grading.condition && (
                                        <div className="text-sm">
                                            <span className="text-gray-500 font-medium">Condition:</span>
                                            <span className="text-gray-200 ml-2 font-semibold">{grading.condition}</span>
                                        </div>
                                    )}

                                    <div className={`px-3 py-2 rounded-lg border text-sm font-bold text-center uppercase tracking-wide ${getGradingStatusColor(grading.status)}`}>
                                        {grading.status}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Transaction List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold mb-4 text-gray-300">Incoming Requests</h2>
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center p-12 text-gray-500 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                            No transactions found.
                        </div>
                    ) : (
                        transactions.map((tx) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTx?.id === tx.id ? 'bg-blue-500/10 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
                                onClick={() => setSelectedTx(tx)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-gray-500">ID: #{tx.id}</span>
                                    {getStatusBadge(tx.status)}
                                </div>
                                <div className="mb-2">
                                    <p className="text-sm text-gray-400">Sender</p>
                                    <p className="font-mono text-xs text-blue-300 truncate">{tx.sender}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Client Note:</p>
                                    <p className="text-sm bg-black/30 p-2 rounded mt-1 break-all font-mono text-xs">{parseData(tx.data)}</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Grading Panel */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        {selectedTx ? (
                            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl overflow-y-auto max-h-screen">
                                <h3 className="text-xl font-bold mb-6">Request #{selectedTx.id}</h3>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Status</label>
                                        <div className="mt-1">{getStatusBadge(selectedTx.status)}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Recipient</label>
                                        <p className="font-mono text-xs truncate text-gray-300">{selectedTx.recipient}</p>
                                    </div>
                                </div>

                                {selectedTx.status === 1 && gradingDetails ? (
                                    <div className="space-y-4 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                        <h4 className="text-green-400 font-bold flex items-center gap-2"><Check size={16} /> Grading Complete</h4>
                                        <img src={gradingDetails.image_url} alt="Graded Card" className="w-full rounded-lg border border-gray-600 shadow-lg" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Card Name</p>
                                                <p className="font-bold">{gradingDetails.card_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Set</p>
                                                <p>{gradingDetails.card_set}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Grade</p>
                                                <p className="text-2xl font-bold text-blue-400">{gradingDetails.grade}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Condition</p>
                                                <p>{gradingDetails.condition}</p>
                                            </div>
                                            <div className="col-span-2 mt-2">
                                                <p className="text-xs text-gray-500">Graded Date</p>
                                                <p className="text-sm">{new Date(gradingDetails.graded_at).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs bg-black/20 p-2 rounded">
                                            <p>Corners: <span className="text-white">{gradingDetails.grade_corners}</span></p>
                                            <p>Edges: <span className="text-white">{gradingDetails.grade_edges}</span></p>
                                            <p>Surface: <span className="text-white">{gradingDetails.grade_surface}</span></p>
                                            <p>Centering: <span className="text-white">{gradingDetails.grade_centering}</span></p>
                                        </div>
                                    </div>
                                ) : selectedTx.status === 0 ? (
                                    <form onSubmit={handleGrade} className="space-y-4">

                                        {/* Image Upload */}
                                        <div
                                            {...getRootProps()}
                                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
                                                }`}
                                        >
                                            <input {...getInputProps()} />
                                            {imageUrl ? (
                                                <div className="relative">
                                                    <img src={imageUrl} alt="Upload" className="h-32 mx-auto rounded object-contain" />
                                                    <div className="text-xs text-green-400 mt-2">Image Uploaded Successfully</div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    {uploading ? <Loader2 className="animate-spin text-blue-400" /> : <Upload />}
                                                    <span className="text-sm">Drag & drop card image here</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-400">Card Name</label>
                                                <input value={cardName} onChange={e => setCardName(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm" required />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">Set</label>
                                                <input value={cardSet} onChange={e => setCardSet(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm" required />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">Year</label>
                                                <input value={cardYear} onChange={e => setCardYear(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm" placeholder="e.g. 1999" required />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">Condition</label>
                                                <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm" required >
                                                    <option value="">Select</option>
                                                    <option value="Raw">Raw</option>
                                                    <option value="Graded">Graded</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-700">
                                            <h4 className="font-bold mb-3 text-sm">Grading Scores (1-10)</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-400 text-blue-300">Overall Grade</label>
                                                    <input type="number" step="0.5" max="10" value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-gray-900 border border-blue-600 rounded p-2 text-sm font-bold" required />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">Corners</label>
                                                    <input type="number" step="0.5" max="10" value={gradeCorners} onChange={e => setGradeCorners(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm" required />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">Edges</label>
                                                    <input type="number" step="0.5" max="10" value={gradeEdges} onChange={e => setGradeEdges(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm" required />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">Surface</label>
                                                    <input type="number" step="0.5" max="10" value={gradeSurface} onChange={e => setGradeSurface(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm" required />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">Centering</label>
                                                    <input type="number" step="0.5" max="10" value={gradeCentering} onChange={e => setGradeCentering(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm" required />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={processing || uploading}
                                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
                                        >
                                            {processing ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                            Finalize Grading
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-gray-900/50 p-4 rounded-lg text-center text-gray-400 text-sm">
                                        This transaction has most likely been rejected or is in an unknown state.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-dashed border-gray-700 text-center text-gray-500 flex flex-col items-center justify-center h-64">
                                <Search size={48} className="mb-4 opacity-20" />
                                <p>Select a transaction to view details or grade.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <SubmitCardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchGradings();
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}
