import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { api } from '../api';
import { Loader2, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';

export function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        // Fetch real gradings to construct basic stats on the frontend
        const fetchStats = async () => {
            try {
                const res = await api.get('/gradings');
                if (res.data.success) {
                    const gradings = res.data.gradings;

                    const total = gradings.length;
                    const completed = gradings.filter((g: any) => g.status === 'Completed' || g.status === 'Delivered').length;
                    const pending = total - completed;

                    // Compute Grade Distribution (Rounded to 10, 9.5, 9, 8, 7...)
                    const roundGrade = (g: number) => {
                        if (g === 10) return 10;
                        if (g >= 9.5) return 9.5;
                        return Math.floor(g);
                    };

                    const gradeCounts: Record<string, number> = {};
                    gradings.forEach((g: any) => {
                        if (g.grade) {
                            const numericGrade = parseFloat(g.grade);
                            if (!isNaN(numericGrade)) {
                                const rounded = roundGrade(numericGrade);
                                const gradeStr = String(rounded);
                                gradeCounts[gradeStr] = (gradeCounts[gradeStr] || 0) + 1;
                            }
                        }
                    });
                    const gradeDistribution = Object.entries(gradeCounts)
                        .map(([grade, count]) => ({ grade, count }))
                        .sort((a, b) => parseFloat(b.grade) - parseFloat(a.grade)); // Sort highest to lowest

                    // Compute Weekly Trends
                    const weeklyCounts: Record<string, number> = {};
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                    const today = new Date();
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(today.getDate() - i);
                        weeklyCounts[days[d.getDay()]] = 0;
                    }

                    gradings.forEach((g: any) => {
                        const timestamp = g.submitted_at || g.created_at;
                        if (!timestamp) return; // Ignore legacy rows with no timestamps rather than defaulting to today

                        const date = new Date(timestamp);
                        const diffTime = Math.abs(today.getTime() - date.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays <= 7) {
                            const dayName = days[date.getDay()];
                            if (weeklyCounts[dayName] !== undefined) {
                                weeklyCounts[dayName]++;
                            }
                        }
                    });

                    const weeklyTrends = Object.entries(weeklyCounts).map(([name, submissions]) => ({ name, submissions }));

                    // Compute Status Breakdown dynamically
                    const statusCounts: Record<string, number> = {};
                    const completedStatuses = ['Complete', 'Completed', 'Delivered'];

                    gradings.forEach((g: any) => {
                        if (g.status && !completedStatuses.includes(g.status)) {
                            statusCounts[g.status] = (statusCounts[g.status] || 0) + 1;
                        }
                    });

                    const totalActive = Object.values(statusCounts).reduce((a, b) => a + b, 0);

                    const colorPalette = [
                        '#eab308', '#3b82f6', '#a855f7', '#ec4899',
                        '#10b981', '#f97316', '#06b6d4', '#8b5cf6'
                    ];

                    const statusBreakdown = Object.entries(statusCounts)
                        .map(([name, count], index) => ({
                            name,
                            value: totalActive ? Math.round((count / totalActive) * 100) : 0,
                            count: count,
                            color: colorPalette[index % colorPalette.length]
                        }))
                        .sort((a, b) => b.value - a.value);

                    setStats({
                        totalOverview: { total, completed, pending },
                        weeklyTrends,
                        gradeDistribution,
                        statusBreakdown
                    });
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading || !stats) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white font-sans selection:bg-purple-500/30">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[128px]" />
            </div>

            <Navbar />

            <div className="relative z-10 p-8 max-w-[1600px] mx-auto pt-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-px bg-gradient-to-r from-gray-700 to-transparent w-8" />
                    <h2 className="text-2xl font-semibold text-gray-200 tracking-tight whitespace-nowrap">Analytics Overview</h2>
                    <div className="h-px bg-gradient-to-l from-gray-700 to-transparent flex-1" />
                </div>

                {/* Top Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-blue-500/50 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={64} className="text-blue-500" />
                        </div>
                        <p className="text-gray-400 font-medium mb-1">Total Submissions</p>
                        <h3 className="text-4xl font-black text-white">{stats.totalOverview.total}</h3>
                        <div className="mt-4 flex items-center gap-2 text-sm text-blue-400/80">
                            <span className="bg-blue-500/20 px-2 rounded">+12%</span> from last week
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-yellow-500/50 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock size={64} className="text-yellow-500" />
                        </div>
                        <p className="text-gray-400 font-medium mb-1">In Queue (Pending)</p>
                        <h3 className="text-4xl font-black text-white">{stats.totalOverview.pending}</h3>
                        <div className="mt-4 flex items-center gap-2 text-sm text-yellow-400/80">
                            <span className="bg-yellow-500/20 px-2 rounded">Active</span> working on it
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-green-500/50 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle size={64} className="text-green-500" />
                        </div>
                        <p className="text-gray-400 font-medium mb-1">Completed Gradings</p>
                        <h3 className="text-4xl font-black text-white">{stats.totalOverview.completed}</h3>
                        <div className="mt-4 flex items-center gap-2 text-sm text-green-400/80">
                            <span className="bg-green-500/20 px-2 rounded">Top tier</span> efficiency
                        </div>
                    </motion.div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Area Chart - Submissions Over Time */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                        className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <h3 className="text-lg font-bold text-gray-200 mb-6 font-mono tracking-widest uppercase text-sm">Weekly Submissions Trend</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.weeklyTrends}>
                                    <defs>
                                        <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                                    <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                        itemStyle={{ color: '#c4b5fd' }}
                                    />
                                    <Area type="monotone" dataKey="submissions" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSubmissions)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Bar Chart - Grade Distribution */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                        className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <h3 className="text-lg font-bold text-gray-200 mb-6 font-mono tracking-widest uppercase text-sm">Grade Distribution (Top Range)</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.gradeDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="grade" stroke="#9ca3af" axisLine={false} tickLine={false} />
                                    <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#1f2937' }}
                                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                        itemStyle={{ color: '#c4b5fd' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {stats.gradeDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.grade === '10' ? '#eab308' : '#3b82f6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Pie Chart - Status Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                        className="lg:col-span-2 bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row items-center"
                    >
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-200 mb-2 font-mono tracking-widest uppercase text-sm">Queue Status Breakdown</h3>
                            <p className="text-sm text-gray-400 max-w-sm mb-6">A high-level view of where active submissions currently sit in the grading pipeline.</p>

                            <div className="space-y-3">
                                {stats.statusBreakdown.map((item: any) => (
                                    <div key={item.name} className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm text-gray-300 flex-1">{item.name}</span>
                                        <span className="font-bold text-white">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-64 w-full md:w-1/2 mt-8 md:mt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.statusBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.statusBreakdown.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                        itemStyle={{ color: '#c4b5fd' }}
                                        formatter={(_value: any, name: any, props: any) => [props.payload.count, String(name || '')]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
