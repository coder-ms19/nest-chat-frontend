import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Home } from 'lucide-react';
import api from '../api';
import { Button } from '../components/ui/Button';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/chat');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1e] to-[#0a0a0f] text-white overflow-hidden relative flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Home Button */}
            <Link
                to="/"
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all group"
            >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Home</span>
            </Link>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden md:block space-y-8"
                >
                    {/* Profile Section */}
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse" />
                            <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-2xl border-4 border-white/10 group-hover:scale-105 transition-transform duration-500">
                                <img
                                    src="https://res.cloudinary.com/manish19/image/upload/v1752930717/spring/profile/kjtwypqrvzgapyutbmlh.jpg"
                                    alt="Manish Keer"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Manish Keer
                            </h3>
                            <p className="text-slate-400">Full Stack Developer</p>
                        </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-50" />
                                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Welcome Back!
                            </h1>
                        </div>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            Sign in to continue your conversations and connect with your team.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                        {[
                            { icon: '💬', text: 'Real-time messaging' },
                            { icon: '👥', text: 'Group conversations' },
                            { icon: '🔒', text: 'Secure & private' },
                            { icon: '⚡', text: 'Lightning fast' }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                className="flex items-center gap-3 text-slate-300"
                            >
                                <span className="text-2xl">{feature.icon}</span>
                                <span className="text-sm">{feature.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Side - Login Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20" />
                        <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4 shadow-lg">
                                    <LogIn className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                                <p className="text-slate-400">Enter your credentials to continue</p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full bg-[#0f172a] border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-500"
                                    />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-purple-400" />
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full bg-[#0f172a] border border-white/10 text-white rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            Sign In
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Footer */}
                            <div className="mt-8 text-center">
                                <p className="text-slate-400 text-sm">
                                    Don't have an account?{' '}
                                    <Link
                                        to="/register"
                                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                    >
                                        Create one now
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
