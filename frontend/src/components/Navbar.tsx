import { Search, Bell, Settings, LogOut } from 'lucide-react';

import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface NavbarProps {
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
}


export function Navbar({ searchTerm, onSearchChange }: NavbarProps) {

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
            <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between gap-8">
                {/* Logo & Brand */}
                <div
                    className="flex items-center gap-3 cursor-pointer group w-1/4"
                    onClick={() => navigate('/')}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-black text-xl tracking-tighter">V</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                            VantaTech
                        </h1>
                        <p className="text-blue-400 text-[10px] font-bold tracking-widest uppercase">Admin Portal</p>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-1 mx-4">
                    <button
                        onClick={() => navigate('/')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${location.pathname === '/' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/submissions')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${location.pathname.includes('/submissions') ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Submissions
                    </button>
                </div>

                {/* Center Search Bar */}
                <div className="flex-1 max-w-2xl flex justify-center">
                    {onSearchChange && (
                        <div className="relative w-full group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by card name, set, or ID..."
                                className="w-full bg-gray-900/80 border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-black/80 transition-all shadow-inner relative z-10"
                                value={searchTerm || ''}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-end gap-6 w-1/4">

                    <div className="flex items-center gap-2">
                        <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                        </button>
                        <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                            <Settings size={20} />
                        </button>
                    </div>

                    <div className="w-px h-8 bg-white/10" />



                    <div
                        onClick={handleLogout}
                        title="Sign Out"
                        className="w-10 h-10 rounded-full bg-gray-800 border-2 border-white/10 overflow-hidden flex items-center justify-center cursor-pointer hover:border-red-500/50 hover:bg-red-500/10 transition-colors group"
                    >
                        <LogOut size={16} className="text-gray-400 group-hover:text-red-400 transition-colors ml-0.5" />
                    </div>
                </div>
            </div>
        </nav>
    );
}
