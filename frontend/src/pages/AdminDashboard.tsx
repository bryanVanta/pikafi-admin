import { useEffect, useState } from 'react';
import { getTransactions, api, type Transaction } from '../api';
import { Check, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminDashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    // Grading Form State
    const [grade, setGrade] = useState('');
    const [comments, setComments] = useState('');
    const [processing, setProcessing] = useState(false);

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

    useEffect(() => {
        fetchTransactions();
        const interval = setInterval(fetchTransactions, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTx) return;

        setProcessing(true);
        try {
            // Logic to keep existing recipient and amount, but update data with grade
            const newData = JSON.stringify({ grade, comments, timestamp: Date.now() });

            const res = await api.post(`/transactions/${selectedTx.id}/approve`, {
                newRecipient: selectedTx.recipient, // Keep same recipient
                newAmount: selectedTx.amount,       // Keep same amount
                newData: newData
            });

            if (res.data.success) {
                alert("Graded successfully!");
                setSelectedTx(null);
                setGrade('');
                setComments('');
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

    // Parse data field if it looks like JSON
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
                    onClick={fetchTransactions}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                    Refresh
                </button>
            </header>

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
                                    <p className="text-sm text-gray-400">Data / Product</p>
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
                            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                                <h3 className="text-xl font-bold mb-6">Grade Request #{selectedTx.id}</h3>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Current Status</label>
                                        <div className="mt-1">{getStatusBadge(selectedTx.status)}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Recipient</label>
                                        <p className="font-mono text-xs truncate text-gray-300">{selectedTx.recipient}</p>
                                    </div>
                                </div>

                                {selectedTx.status === 0 ? (
                                    <form onSubmit={handleGrade} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Assign Grade</label>
                                            <select
                                                value={grade}
                                                onChange={(e) => setGrade(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                                                required
                                            >
                                                <option value="">Select Grade</option>
                                                <option value="A+">A+ (Mint)</option>
                                                <option value="A">A (Near Mint)</option>
                                                <option value="B">B (Excellent)</option>
                                                <option value="C">C (Good)</option>
                                                <option value="F">F (Rejected)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Admin Comments</label>
                                            <textarea
                                                value={comments}
                                                onChange={(e) => setComments(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 focus:border-blue-500 focus:outline-none h-24"
                                                placeholder="Add notes about authenticity or condition..."
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                        >
                                            {processing ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                            Submit Grade
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-gray-900/50 p-4 rounded-lg text-center text-gray-400 text-sm">
                                        This transaction has already been processed.
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
        </div>
    );
}
