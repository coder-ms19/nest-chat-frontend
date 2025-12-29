import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import {
    MessageCircle, Shield, Globe, Zap, Layout,
    ArrowRight, Sparkles
} from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth-change'));
        setUser(null);
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 selection:text-blue-200 font-sans overflow-x-hidden">
            <Navbar user={user} isLoggedIn={isLoggedIn} onLogout={handleLogout} currentPage="home" />

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />

                <div className="text-center max-w-4xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium mb-8"
                    >
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>The Future of Connection</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight"
                    >
                        Connect without <br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Boundaries
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Experience a social platform designed for meaningful interactions.
                        Real-time chat, crystal clear video calls, and a community built for you.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to={isLoggedIn ? "/chat" : "/register"}>
                            <Button className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full text-lg font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                        <Link to="/about">
                            <Button variant="outline" className="px-8 py-4 bg-white/5 text-white border-white/10 hover:bg-white/10 rounded-full text-lg font-semibold transition-all">
                                Learn More
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-32">
                    {[
                        {
                            icon: MessageCircle,
                            title: "Real-time Chat",
                            desc: "Instant messaging with rich media support and seamless updates.",
                            color: "text-blue-400",
                            bg: "bg-blue-500/10"
                        },
                        {
                            icon: Globe,
                            title: "Global Connection",
                            desc: "Connect with anyone, anywhere in the world with low latency.",
                            color: "text-purple-400",
                            bg: "bg-purple-500/10"
                        },
                        {
                            icon: Shield,
                            title: "Secure & Private",
                            desc: "End-to-end encryption ensures your conversations stay private.",
                            color: "text-emerald-400",
                            bg: "bg-emerald-500/10"
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            className="p-8 rounded-3xl bg-[#0f0f12] border border-white/5 hover:border-white/10 transition-colors group"
                        >
                            <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Dashboard Preview / App Showcase */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#0f0f12] shadow-2xl mb-32"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5" />
                    <div className="p-8 md:p-12 text-center border-b border-white/5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                            <Layout className="w-3 h-3" /> App Interface
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Designed for Modern Teams</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            A clean, intuitive interface that gets out of your way and lets you focus on what matters most.
                        </p>
                    </div>

                    {/* Abstract UI Representation */}
                    <div className="relative h-[400px] md:h-[600px] w-full bg-[#0a0a0c] overflow-hidden group">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-xl border border-white/10 bg-[#0f0f12] shadow-2xl flex overflow-hidden">
                            {/* Sidebar Mockup */}
                            <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-4 hidden md:flex">
                                <div className="h-8 w-24 bg-white/10 rounded-md" />
                                <div className="space-y-2 mt-4">
                                    {[1, 2, 3, 4].map(j => (
                                        <div key={j} className="h-10 w-full bg-white/5 rounded-lg" />
                                    ))}
                                </div>
                            </div>
                            {/* Main Content Mockup */}
                            <div className="flex-1 p-6 flex flex-col gap-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-8 w-32 bg-white/10 rounded-md" />
                                    <div className="h-8 w-8 bg-white/10 rounded-full" />
                                </div>
                                <div className="flex-1 bg-white/5 rounded-xl border border-white/5 p-4 grid place-items-center text-slate-500">
                                    Interactive Chat Dashboard
                                </div>
                                <div className="h-14 w-full bg-white/5 rounded-xl border border-white/5" />
                            </div>
                        </div>

                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-80" />
                    </div>
                </motion.div>

                {/* About the Project Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Built with <span className="text-blue-500">Modern Tech</span></h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-6">
                            This project is a testament to modern web development standards, utilizing a powerful stack to deliver seamless performance and a premium user experience.
                        </p>
                        <ul className="space-y-4">
                            {[
                                { name: "NestJS Backend", desc: "Scalable server-side architecture", icon: Shield },
                                { name: "React + Vite", desc: "Lightning fast frontend performance", icon: Zap },
                                { name: "Real-time Socket.io", desc: "Instant communication features", icon: MessageCircle },
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-white/5 text-blue-400">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{item.name}</h4>
                                        <p className="text-sm text-slate-500">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl -z-10" />
                        <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-purple-400" />
                                Project Overview
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-sm text-slate-400 mb-1">Architecture</div>
                                    <div className="font-mono text-blue-300">Microservices Ready</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-sm text-slate-400 mb-1">State Management</div>
                                    <div className="font-mono text-purple-300">Advanced React Patterns</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-sm text-slate-400 mb-1">Styling</div>
                                    <div className="font-mono text-emerald-300">TailwindCSS + Framer Motion</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Developer Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-12"
                >
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1 mb-6">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                            <img
                                src="https://res.cloudinary.com/manish19/image/upload/v1766670690/social_media_app/avatars/v18pqflwyzixmwnbsqo2.jpg"
                                alt="Manish Keer"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Manish Keer</h2>
                    <p className="text-blue-400 font-medium mb-6">Full Stack Developer</p>
                    <p className="text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Passionate about building scalable applications and crafting intuitive user experiences.
                        Always exploring new technologies and pushing the boundaries of what's possible on the web.
                    </p>
                    <a
                        href="https://github.com/manish-keer19/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-slate-200 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        Follow on GitHub
                    </a>
                </motion.div>

            </main>

            {/* Footer Section */}
            <footer className="border-t border-white/5 bg-[#0a0a0c] py-12 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">SocialApp</span>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-400">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                    <div className="text-slate-500 text-sm">
                        © 2025 Social Media App.
                    </div>
                </div>
            </footer>
        </div>
    );
}
