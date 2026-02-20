import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Activity, Heart, ArrowRight, Zap, Globe,
    CheckCircle2, Lock, Users, ChevronRight, BarChart3,
    Stethoscope, Baby, Smartphone, Star
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Activity className="w-6 h-6 text-cyan-600" />,
            title: "AI Risk Prediction",
            desc: "Advanced gradient boosting models analyze 30+ health parameters to predict high-risk pregnancies with 89% accuracy."
        },
        {
            icon: <Globe className="w-6 h-6 text-blue-600" />,
            title: "Geospatial Intelligence",
            desc: "Real-time heatmaps identify regional health hotspots, enabling authorities to allocate resources where they're needed most."
        },
        {
            icon: <Zap className="w-6 h-6 text-amber-500" />,
            title: "Automated Interventions",
            desc: "Instant alerts to ASHA workers and hospitals when a beneficiary misses an ANC visit or shows critical symptoms."
        },
        {
            icon: <Lock className="w-6 h-6 text-emerald-600" />,
            title: "Secure Data Pipeline",
            desc: "End-to-end encryption ensures robust privacy for millions of sensitive maternal and child health records."
        }
    ];

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-cyan-500/20 selection:text-cyan-900">
            {/* dynamic background mesh - adjusted for light theme */}
            <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-indigo-400/20 rounded-full blur-[80px]" />
            </div>

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg shadow-slate-200/50 py-4 border-b border-slate-100' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <Heart className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">CARE FOR <span className="text-cyan-600">TWO</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-bold text-slate-600 hover:text-cyan-600 transition-colors">Features</a>
                        <a href="#impact" className="text-sm font-bold text-slate-600 hover:text-cyan-600 transition-colors">Impact</a>
                        <button
                            onClick={() => navigate('/login')}
                            className="group px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm shadow-[0_5px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_8px_25px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                            Login Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 max-w-7xl mx-auto z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                            Guarding Every <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">Mother & Child.</span>
                        </h1>

                        <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10 max-w-xl">
                            A unified AI intelligence platform connecting ASHA workers, hospitals, and government authorities to ensure zero preventable maternal mortality.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-16">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-8 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300" />
                                <Shield className="w-5 h-5 relative z-10" />
                                <span className="relative z-10">Launch Platform</span>
                            </button>
                            <button className="px-8 py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 shadow-sm">
                                View Documentation
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        {/* Abstract Motherhood Symbolism */}
                        <div className="relative w-full h-[600px] flex items-center justify-center">
                            {/* Outer Rings */}
                            <div className="absolute w-[500px] h-[500px] border border-slate-200 rounded-full animate-[spin_60s_linear_infinite]" />
                            <div className="absolute w-[400px] h-[400px] border border-cyan-500/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                            <div className="absolute w-[300px] h-[300px] border border-blue-500/20 rounded-full animate-[spin_30s_linear_infinite]" />

                            {/* Central Composition */}
                            <div className="relative z-10">
                                {/* Stylized Mother Figure */}
                                <svg width="300" height="300" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                                    <path d="M100 40C111.046 40 120 31.0457 120 20C120 8.9543 111.046 0 100 0C88.9543 0 80 8.9543 80 20C80 31.0457 88.9543 40 100 40Z" fill="url(#paint0_linear)" />
                                    <path d="M100 50C70 50 40 80 40 140C40 180 80 200 100 200C120 200 160 180 160 140C160 80 130 50 100 50Z" fill="url(#paint1_linear)" stroke="white" strokeOpacity="1" strokeWidth="1" />

                                    {/* Child Figure Nestled Inside */}
                                    <circle cx="100" cy="110" r="25" fill="url(#paint2_linear)" />
                                    <path d="M85 130C85 130 90 150 100 150C110 150 115 130 115 130" stroke="white" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" />

                                    <defs>
                                        <linearGradient id="paint0_linear" x1="100" y1="0" x2="100" y2="40" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#0891b2" />
                                            <stop offset="1" stopColor="#0284c7" />
                                        </linearGradient>
                                        <linearGradient id="paint1_linear" x1="100" y1="50" x2="100" y2="200" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#0f172a" stopOpacity="0.9" />
                                            <stop offset="1" stopColor="#1e3a8a" stopOpacity="0.95" />
                                        </linearGradient>
                                        <linearGradient id="paint2_linear" x1="100" y1="85" x2="100" y2="135" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#fcd34d" />
                                            <stop offset="1" stopColor="#fbbf24" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Floating Metrics */}
                                <motion.div
                                    animate={{ y: [-10, 10, -10] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -right-10 top-0 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] font-bold uppercase text-emerald-600">Stable</span>
                                    </div>
                                    <div className="text-slate-800 font-bold text-sm">Vitals Normal</div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [10, -10, 10] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -left-16 bottom-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Shield className="w-4 h-4 text-cyan-500" />
                                        <span className="text-[10px] font-bold uppercase text-cyan-600">Protected</span>
                                    </div>
                                    <div className="text-slate-800 font-bold text-sm">ANC Completed</div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 px-6 max-w-7xl mx-auto border-t border-slate-100">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((item, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-xl hover:shadow-slate-200 hover:border-blue-100 transition-all cursor-default group"
                        >
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-colors">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Ecosystem Section */}
            <section id="impact" className="py-24 bg-gradient-to-b from-slate-50 to-indigo-50/50 text-slate-900 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-cyan-600 font-bold uppercase tracking-widest text-xs mb-2 block">The Ecosystem</span>
                        <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900">Connected Care at Every Step</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">From the remote ASHA worker to the district collector, CARE FOR TWO bridges the gap.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 p-10 rounded-3xl hover:border-cyan-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-8 border border-amber-200 group-hover:scale-110 transition-transform">
                                <Users className="w-8 h-8 text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-slate-900">For Administrators</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">District-wide surveillance, resource allocation, and performance monitoring dashboards.</p>
                            <button onClick={() => navigate('/login')} className="text-sm font-bold text-cyan-600 flex items-center gap-2 hover:gap-3 transition-all">
                                Admin Portal <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 p-10 rounded-3xl hover:border-cyan-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8 border border-emerald-200 group-hover:scale-110 transition-transform">
                                <Stethoscope className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-slate-900">For Hospitals</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">Patient registries, digitalization of records, and follow-up tracking systems.</p>
                            <button onClick={() => navigate('/login')} className="text-sm font-bold text-cyan-600 flex items-center gap-2 hover:gap-3 transition-all">
                                Hospital Login <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 p-10 rounded-3xl hover:border-cyan-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-8 border border-rose-200 group-hover:scale-110 transition-transform">
                                <Baby className="w-8 h-8 text-rose-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-slate-900">For Beneficiaries</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">Direct access to health records, scheme benefits, and emergency support.</p>
                            <button onClick={() => navigate('/login')} className="text-sm font-bold text-cyan-600 flex items-center gap-2 hover:gap-3 transition-all">
                                Patient Access <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* System Capabilities Section */}
            <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2 block">Enterprise Capacity</span>
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Built for National Scale</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 mb-20">
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                            <Activity className="w-8 h-8 text-cyan-400 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Predictive Analytics Engine</h3>
                            <p className="text-lg text-slate-300 leading-relaxed">
                                Our platform processes over 30+ health parameters per beneficiary to generate real-time risk scores, enabling preemptive healthcare interventions.
                            </p>
                        </div>
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                            <Zap className="w-8 h-8 text-amber-400 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Rapid Response Protocol</h3>
                            <p className="text-lg text-slate-300 leading-relaxed">
                                Automated alert dispatch system connects ASHA workers, ambulances, and district hospitals instantly when critical anomalies are detected.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
                        <div className="p-4">
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">99.9%</div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Uptime SLA</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">&lt;200ms</div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">API Latency</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">AES-256</div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Data Encryption</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-2">ISO</div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Compliance Ready</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 border-t border-slate-100">
                <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 border border-white/10">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400 rounded-full blur-[100px] opacity-30" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 rounded-full blur-[100px] opacity-30" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Transform Healthcare?</h2>
                        <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto font-medium">
                            Join the network that is actively securing the future of mothers and children across the nation.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-10 py-5 bg-white text-blue-900 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all"
                        >
                            Get Started Now
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 pt-24 pb-12 px-6 border-t border-slate-200">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white fill-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">CARE FOR TWO</span>
                        </div>
                        <p className="text-slate-500 max-w-sm mb-6">
                            Building the digital infrastructure for the next generation of public health.
                        </p>
                        <div className="flex gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-all cursor-pointer shadow-sm">
                                    <Globe className="w-5 h-5" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm font-medium text-slate-500">
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">Analytics Dashboard</a></li>
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">Risk Modeling</a></li>
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">Field App</a></li>
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">API Docs</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Company</h4>
                        <ul className="space-y-4 text-sm font-medium text-slate-500">
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">Impact Reports</a></li>
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <p>© 2026 CARE FOR TWO Systems. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-700 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
