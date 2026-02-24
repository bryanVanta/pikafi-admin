import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, appleProvider } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';


export function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isLogin && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            navigate('/submissions');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to authenticate');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/submissions');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Google Sign-In failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithPopup(auth, appleProvider);
            navigate('/submissions');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Apple Sign-In failed');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center font-sans relative overflow-hidden text-white">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] mb-4">
                        <span className="text-3xl font-black tracking-tighter text-white">V</span>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        VantaTech Admin
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Authenticate to access the dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="Email Address"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/5 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required={!isLogin}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-black/50 border border-white/5 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                            placeholder="Confirm Password"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>

                        <div className="relative flex items-center justify-center py-4">
                            <div className="absolute inset-x-0 h-px bg-white/5" />
                            <span className="relative bg-[#0a0a0b] px-4 text-xs text-gray-500 uppercase tracking-widest font-bold">Or Continue With</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                disabled={loading}
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google
                            </button>

                            <button
                                disabled={loading}
                                type="button"
                                onClick={handleAppleSignIn}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm"
                            >
                                <svg className="w-5 h-5 mb-0.5" viewBox="0 0 384 512">
                                    <path
                                        fill="currentColor"
                                        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-19-84.1-19C52.1 142 0 204.6 0 286.9c0 36.3 8.3 75 25.8 116.7 18.5 44 43.1 82.5 73.1 82.5 26 0 39.6-18 78.6-18 38.6 0 52.3 18 78.6 18 26 0 51.5-35.9 71.3-71 28.5-40.8 38.5-73.8 39.4-75-1.1-.3-74.6-28.8-74.8-111.4zM249.1 81.3c21.2-25.8 32.8-56.1 27.2-81.3-30.8 1.4-64 21.4-83.3 44.4-16.7 19.3-31.5 50.8-27.4 75 32.7 2.6 63.3-15.1 83.5-38.1z"
                                    />
                                </svg>
                                Apple ID
                            </button>
                        </div>



                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-gray-400 hover:text-white text-sm transition-colors"
                            >
                                {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
