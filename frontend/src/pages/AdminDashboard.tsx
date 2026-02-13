import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions, api, type Transaction, getGradingDetails, uploadImage } from '../api';
import { Check, Loader2, Search, Upload, Plus, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { SubmitCardModal } from '../components/SubmitCardModal';


export function AdminDashboard() {
    const navigate = useNavigate();
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
            case 0: return <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-md text-xs font-bold shadow-[0_0_10px_rgba(234,179,8,0.1)]">Pending</span>;
            case 1: return <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md text-xs font-bold shadow-[0_0_10px_rgba(34,197,94,0.1)]">Graded</span>;
            case 2: return <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-xs font-bold shadow-[0_0_10px_rgba(239,68,68,0.1)]">Rejected</span>;
            default: return <span className="px-2.5 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-md text-xs font-bold">Unknown</span>;
        }
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
        <div className="min-h-screen bg-[#0a0a0b] text-white font-sans selection:bg-purple-500/30">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 p-8 max-w-[1600px] mx-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400 text-sm font-medium tracking-wide">
                            OVERVIEW & GRADING
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 flex items-center gap-2 overflow-hidden shadow-lg shadow-purple-900/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <Plus size={18} />
                        <span>Submit Card</span>
                    </button>
                </header>

                {/* Grading Cards Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px bg-gradient-to-r from-gray-700 to-transparent flex-1" />
                        <h2 className="text-xl font-semibold text-gray-200 tracking-tight">Active Submissions</h2>
                        <div className="h-px bg-gradient-to-l from-gray-700 to-transparent flex-1" />
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-20">
                            <Loader2 className="animate-spin text-purple-500" size={48} />
                        </div>
                    ) : gradings.length === 0 ? (
                        <div className="text-center p-20 text-gray-600 bg-gray-900/30 rounded-3xl border border-dashed border-gray-800 backdrop-blur-sm">
                            No submissions found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {gradings.map((grading) => (
                                <motion.div
                                    key={grading.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="relative bg-gray-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 overflow-hidden group hover:border-white/10 hover:shadow-2xl hover:shadow-purple-900/20"
                                    onClick={() => navigate(`/card/${grading.uid || grading.id}`)}
                                >
                                    {/* Image Section */}
                                    <div className="aspect-[3/4] relative p-8 flex items-center justify-center bg-gradient-to-b from-gray-800/20 to-transparent">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-30 mix-blend-overlay" />

                                        <img
                                            src={grading.image_url}
                                            alt={grading.card_name}
                                            className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Status Badge - Top Left with Pulsing Dot */}
                                        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
                                            <div className={`w-2 h-2 rounded-full ${['Complete', 'Graded', 'Delivered'].includes(grading.status) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                                                ['Rejected'].includes(grading.status) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                                                    'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                                                }`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${['Complete', 'Graded', 'Delivered'].includes(grading.status) ? 'text-green-400' :
                                                ['Rejected'].includes(grading.status) ? 'text-red-400' :
                                                    'text-blue-400'
                                                }`}>
                                                {grading.status}
                                            </span>
                                        </div>

                                        {/* ID - Top Right Technical Look */}
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 text-[10px] font-mono text-gray-300 shadow-lg tracking-widest">
                                            #{String(grading.uid || grading.id).padStart(4, '0')}
                                        </div>

                                        {/* Grade Badge - Bottom Right (only if graded) */}
                                        {grading.grade && (
                                            <div className="absolute bottom-4 right-4 bg-white text-black font-black text-xl w-12 h-12 flex items-center justify-center rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] transform -rotate-6 border-2 border-white/20 z-10">
                                                {grading.grade}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-5 relative border-t border-white/5">

                                        <div className="mb-5">
                                            <h3 className="font-bold text-lg text-white leading-tight truncate mb-1">
                                                {grading.card_name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                <span>{grading.card_set}</span>
                                                <span className="text-gray-700">•</span>
                                                <span>{grading.card_year}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/grading/${grading.uid || grading.id}`);
                                                }}
                                                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-sm hover:from-blue-500 hover:to-purple-500 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all duration-200 shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                                            >
                                                <Play size={14} fill="currentColor" />
                                                <span>Grade</span>
                                            </button>

                                            {grading.tx_hash && (
                                                <a
                                                    href={`https://sepolia.arbiscan.io/tx/${grading.tx_hash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="View on Arbiscan"
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                                                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                                                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content Grid - Transaction List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-semibold text-gray-200 tracking-tight">Recent Transactions</h2>
                            <div className="h-px bg-gray-800 flex-1" />
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center p-12 text-gray-600 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
                                No recent transactions.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((tx) => (
                                    <motion.div
                                        key={tx.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`group relative p-5 rounded-2xl border transition-all cursor-pointer overflow-hidden ${selectedTx?.id === tx.id
                                            ? 'bg-blue-500/10 border-blue-500/50'
                                            : 'bg-gray-900/40 border-gray-800 hover:border-gray-700 hover:bg-gray-900/60'}`}
                                        onClick={() => setSelectedTx(tx)}
                                    >
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-xs text-gray-500">#{String(tx.id).padStart(4, '0')}</span>
                                                    <span className="font-medium text-gray-300 text-sm truncate max-w-[200px]">{tx.sender}</span>
                                                </div>
                                                <p className="text-sm text-gray-400 pl-7 line-clamp-1">
                                                    {parseData(tx.data)}
                                                </p>
                                            </div>
                                            {getStatusBadge(tx.status)}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Grading Panel */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            {selectedTx ? (
                                <div className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-xl overflow-y-auto max-h-[calc(100vh-8rem)]">
                                    <h3 className="text-xl font-bold mb-6 text-gray-200">Request #{String(selectedTx.id).padStart(4, '0')}</h3>

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
        </div>
    );
}
