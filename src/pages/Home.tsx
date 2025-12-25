import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import {
    MessageCircle, Github, Mail, MapPin,
    Code2, Database, Server, Zap, Rocket, Trophy,
    GitBranch, Box, FileCode, Layers, UserPlus,
    Cpu, Globe, Terminal, Share2, Activity
} from 'lucide-react';

// --- Components ---

const GlowingIcon = ({ icon: Icon, color, className = "" }: { icon: any, color: string, className?: string }) => (
    <div className={`relative group ${className}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-2xl blur-xl opacity-20 group-hover:opacity-60 transition-opacity duration-500`} />
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#12121a]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl group-hover:border-white/30">
            <Icon className="w-6 h-6 md:w-7 md:h-7 text-slate-300 group-hover:text-white transition-colors duration-300" />
        </div>
    </div>
);

const BentoCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -5 }}
        className={`relative group bg-[#12121a]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 overflow-hidden hover:border-white/10 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 ${className}`}
    >
        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10 h-full">
            {children}
        </div>
    </motion.div>
);

const StatItem = ({ label, value, icon: Icon, color, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay, type: "spring" }}
        className="flex items-center gap-4"
    >
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} bg-opacity-10 flex items-center justify-center relative overflow-hidden group`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20 group-hover:opacity-30 transition-opacity`} />
            <Icon className="w-6 h-6 text-white relative z-10" />
        </div>
        <div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-slate-400 font-medium">{label}</div>
        </div>
    </motion.div>
);

export default function Home() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Parallax effect for hero
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);


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
        setUser(null);
        setIsLoggedIn(false);
        navigate('/login');
    };

    const developerInfo = {
        name: "Manish Keer",
        role: "Full Stack Engineer",
        tagline: "Architecting Digital Experiences",
        location: "India",
        email: "manishkeer530@gmail.com",
        github: "Manish-keer19",
        stats: [
            { label: "Projects", value: "40+", icon: Trophy, color: "from-yellow-400 to-orange-500" },
            { label: "Commits", value: "500+", icon: GitBranch, color: "from-green-400 to-emerald-500" },
            { label: "Exp.", value: "1+ Years", icon: Rocket, color: "from-blue-400 to-indigo-500" },
        ],
        stack: [
            { icon: Layers, name: "React", color: "from-cyan-400 to-blue-500" },
            { icon: Server, name: "Node.js", color: "from-green-400 to-emerald-600" },
            { icon: Box, name: "NestJS", color: "from-red-500 to-pink-600" },
            { icon: Database, name: "PostgreSQL", color: "from-blue-600 to-cyan-600" },
            { icon: Zap, name: "Socket.io", color: "from-yellow-400 to-orange-500" },
            { icon: FileCode, name: "TypeScript", color: "from-blue-500 to-indigo-600" },
        ]
    };

    return (
        <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200 font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[5000ms]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute top-[30%] left-[50%] transform -translate-x-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            {/* Ambient Background */}
            <Navbar user={user} isLoggedIn={isLoggedIn} onLogout={handleLogout} currentPage="home" />

            {/* Navigation - Replaced by Navbar component above */}

            <main className="relative z-10 pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex-1 text-center lg:text-left"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6 uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        >
                            <Terminal className="w-3 h-3" />
                            Software Engineer
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
                            <span className="block text-slate-400 text-2xl md:text-3xl font-light mb-2">Hello, I'm</span>
                            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-2xl">
                                {developerInfo.name}
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
                            {developerInfo.role} focusing on building <span className="text-blue-400 font-semibold">interactive</span> and <span className="text-purple-400 font-semibold">performant</span> web applications.
                        </p>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href={`https://github.com/${developerInfo.github}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-8 py-4 bg-white text-black font-bold rounded-2xl shadow-xl shadow-white/10 hover:shadow-white/20 transition-all flex items-center gap-2"
                            >
                                <Github className="w-5 h-5" />
                                <span>GitHub</span>
                            </motion.a>
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href={`mailto:${developerInfo.email}`}
                                className="px-8 py-4 bg-[#1e1e2d] border border-white/10 text-white font-medium rounded-2xl hover:bg-[#27273a] transition-all flex items-center gap-2"
                            >
                                <Mail className="w-5 h-5" />
                                <span>Contact Me</span>
                            </motion.a>
                        </div>
                    </motion.div>

                    <motion.div
                        style={{ y: y1 }}
                        className="flex-1 relative w-full max-w-md lg:max-w-full flex justify-center"
                    >
                        <div className="relative w-80 h-80 md:w-[500px] md:h-[500px]">
                            {/* Abstract decorative circles */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border border-dashed border-white/10"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 sm:inset-10 rounded-full border border-white/5"
                            />

                            {/* Profile Image */}
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, type: "spring" }}
                                className="absolute inset-8 sm:inset-16 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl shadow-blue-500/20 z-10 group cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
                                <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500" />
                                <img
                                    src="https://res.cloudinary.com/manish19/image/upload/v1766670690/social_media_app/avatars/v18pqflwyzixmwnbsqo2.jpg"
                                    alt="Profile"
                                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 filter brightness-90 group-hover:brightness-110"
                                />
                            </motion.div>

                            {/* Floating Tech Orbs */}
                            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-10 md:right-0 z-20">
                                <div className="p-4 rounded-2xl bg-[#0f0f16]/90 backdrop-blur-xl border border-white/10 shadow-xl">
                                    <Code2 className="w-8 h-8 text-blue-400" />
                                </div>
                            </motion.div>
                            <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-10 left-0 z-20">
                                <div className="p-4 rounded-2xl bg-[#0f0f16]/90 backdrop-blur-xl border border-white/10 shadow-xl">
                                    <Database className="w-8 h-8 text-purple-400" />
                                </div>
                            </motion.div>
                            <motion.div animate={{ x: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-1/2 -right-4 md:-right-10 z-20">
                                <div className="p-4 rounded-2xl bg-[#0f0f16]/90 backdrop-blur-xl border border-white/10 shadow-xl">
                                    <Zap className="w-8 h-8 text-yellow-400" />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-32">
                    {/* Stats Card */}
                    <BentoCard className="md:col-span-6 lg:col-span-4 min-h-[250px] flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            Performance
                        </h3>
                        <div className="space-y-6">
                            {developerInfo.stats.map((stat, i) => (
                                <StatItem key={i} {...stat} delay={i * 0.1} />
                            ))}
                        </div>
                    </BentoCard>

                    {/* About Card */}
                    <BentoCard className="md:col-span-6 lg:col-span-5 flex flex-col justify-between" delay={0.1}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/10 to-transparent rounded-bl-full pointer-events-none" />
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                                <UserPlus className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">About Me</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Passionate about creating intuitive and dynamic user experiences.
                                I specialize in the React ecosystem and server-side logic,
                                bringing ideas to life with clean, efficient code.
                            </p>
                        </div>
                        <div className="mt-8 flex gap-3 flex-wrap">
                            <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-300 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {developerInfo.location}
                            </div>
                            <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-300 flex items-center gap-1">
                                <Globe className="w-3 h-3" /> Remote/On-site
                            </div>
                        </div>
                    </BentoCard>

                    {/* Quick Action Card - Enhanced */}
                    <BentoCard className="md:col-span-12 lg:col-span-3 min-h-[200px] flex flex-col items-center justify-between text-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] border-blue-500/20" delay={0.2}>
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="mb-4 p-4 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                <MessageCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Let's Build Together</h3>
                            <p className="text-sm text-slate-400 px-2 leading-relaxed">
                                Turn your ideas into reality. Start a conversation today.
                            </p>
                        </div>
                        <Link to={isLoggedIn ? "/conversations" : "/login"} className="w-full mt-4">
                            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]">
                                Start Chatting
                            </Button>
                        </Link>
                    </BentoCard>

                    {/* Tech Stack - Wide */}
                    <BentoCard className="md:col-span-12 lg:col-span-8 flex flex-col justify-center" delay={0.3}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Cpu className="w-6 h-6 text-emerald-400" />
                                Tech Stack
                            </h3>
                            <span className="text-xs font-mono text-slate-500">// EXPERTISE</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {developerInfo.stack.map((tech, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="flex flex-col items-center gap-3"
                                >
                                    <GlowingIcon icon={tech.icon} color={tech.color} />
                                    <span className="text-sm font-medium text-slate-300">{tech.name}</span>
                                </motion.div>
                            ))}
                        </div>
                    </BentoCard>

                    {/* Highlight Card */}
                    <BentoCard className="md:col-span-12 lg:col-span-4 min-h-[250px] relative overflow-hidden" delay={0.4}>
                        <img
                            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
                            alt="Coding"
                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-[#12121a]/50 to-transparent" />
                        <div className="relative z-10 h-full flex flex-col justify-end">
                            <h3 className="text-xl font-bold text-white mb-2">Modern Development</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Utilizing the latest frameworks and clean architecture patterns.
                            </p>
                            <div className="flex gap-2">
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[80%] rounded-full" />
                                </div>
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[60%] rounded-full" />
                                </div>
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-[90%] rounded-full" />
                                </div>
                            </div>
                        </div>
                    </BentoCard>
                </div>

                {/* Footer Section */}
                <footer className="border-t border-white/10 pt-12 pb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <span className="text-2xl font-bold text-white">MS</span>
                            <p className="text-slate-500 text-sm mt-2">© 2025 Manish Keer. All rights reserved.</p>
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Share2 className="w-5 h-5" /></a>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
