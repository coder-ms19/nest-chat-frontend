import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Zap, CheckCircle2, Shield, Heart } from 'lucide-react';
import api from '../api';
import { Button } from '../components/ui/Button';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/signup', { username, email, password });
            // Auto login after registration
            const loginRes = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', loginRes.data.token);
            localStorage.setItem('user', JSON.stringify(loginRes.data.user));
            navigate('/chat');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Left Side - Brand & Value Prop */}
            <div className="hidden lg:flex flex-1 relative bg-[#0a0a0c] overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(147,51,234,0.08),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.08),transparent)]" />

                <div className="relative z-10 max-w-lg">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-10 shadow-xl shadow-purple-900/20">
                        <Zap className="w-7 h-7 text-white" />
                    </div>

                    <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
                        Start Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            Journey Here
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-12 leading-relaxed font-light">
                        Join next-generation social platform. Safe, secure, and built for real connections.
                    </p>

                    <div className="space-y-6">
                        {[
                            { text: "Unlimited Random Chats", icon: Heart, color: "text-pink-400" },
                            { text: "Secure Group Conversations", icon: Shield, color: "text-emerald-400" },
                            { text: "Crystal Clear Calls", icon: Zap, color: "text-yellow-400" },
                            { text: "No Hidden Fees", icon: CheckCircle2, color: "text-blue-400" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <item.icon className={`w-6 h-6 ${item.color}`} />
                                <span className="text-lg font-medium">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-[#050505]">
                <Link to="/" className="absolute top-8 right-8 text-sm text-slate-400 hover:text-white transition-colors">
                    Back to Home
                </Link>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-slate-400">Join thousands of users today.</p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">Username</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="johndoe"
                                    required
                                    className="w-full bg-[#0f1115] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder-slate-600 outline-none hover:border-white/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full bg-[#0f1115] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder-slate-600 outline-none hover:border-white/20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 6 chars"
                                        required
                                        className="w-full bg-[#0f1115] border border-white/10 text-white rounded-xl pl-10 pr-10 py-3.5 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder-slate-600 outline-none hover:border-white/20 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-300">Confirm</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm"
                                        required
                                        className="w-full bg-[#0f1115] border border-white/10 text-white rounded-xl pl-10 pr-10 py-3.5 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder-slate-600 outline-none hover:border-white/20 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-slate-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                            Sign in instead
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
