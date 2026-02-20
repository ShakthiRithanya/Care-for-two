import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Heart, Shield, BrainCircuit, Users, Terminal, Database,
    ArrowRight, Sparkles, Activity, FileCode, CheckCircle, Hospital, User
} from 'lucide-react';

const Architecture = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "High-Level Architecture",
            icon: <Database className="w-5 h-5" />,
            content: "MaatriNet follows a modern decoupled architecture designed for high throughput and modular AI extensibility.",
            items: [
                "React Frontend: Three role-specific views (Authorizer, Hospital, Beneficiary) for tailored data visibility.",
                "FastAPI Backend: High-performance Python server processing complex health data and ML inference tasks.",
                "SQLite DB: Efficient relational storage using SQLModel for robust data integrity and lifecycle tracking."
            ]
        },
        {
            title: "ML Pipeline & Intelligence",
            icon: <BrainCircuit className="w-5 h-5" />,
            content: "The heart of MaatriNet is its modular intelligence layer using Gradient Boosting Classifiers.",
            items: [
                "Data Generation: Automated simulation of maternal health variables and risk outcomes.",
                "Model Training: Three distinct GBC models optimized for Pregnancy Risk, Newborn Risk, and Coverage Gaps.",
                "On-Demand Inference: Real-time risk recomputation across all records with a single trigger."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-slate-100 bg-white shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">MaatriNet <span className="text-primary-600">Core</span></span>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back to Dashboard
                </button>
            </nav>

            <div className="max-w-5xl mx-auto px-8 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest mb-6 border border-indigo-100">
                        <Terminal className="w-3 h-3" /> System Architecture Overview
                    </div>
                    <h1 className="text-5xl font-extrabold text-slate-900 mb-6">Designed for <span className="text-primary-600 italic underline decoration-primary-200">Scale</span> & <span className="text-indigo-600">Safety</span></h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        An integrated ecosystem connecting health programmes, facilities, and patients through a centralized intelligence engine.
                    </p>
                </motion.div>

                {/* The Diagram Flow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 relative">
                    {[
                        { role: 'Beneficiary', icon: <User />, desc: 'Health Tracking' },
                        { role: 'Intelligence Engine', icon: <BrainCircuit />, desc: 'ML Inference', main: true },
                        { role: 'Authorizer', icon: <Shield />, desc: 'Regional Policy' },
                    ].map((item, i) => (
                        <div key={i} className={`flex flex-col items-center p-8 rounded-3xl border ${item.main ? 'bg-slate-900 text-white border-slate-800 shadow-2xl scale-110 z-10' : 'bg-white text-slate-900 border-slate-100 shadow-sm'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${item.main ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                {item.icon}
                            </div>
                            <div className="font-extrabold text-sm uppercase tracking-widest">{item.role}</div>
                            <div className="text-[10px] opacity-60 mt-1 uppercase font-bold tracking-widest">{item.desc}</div>
                        </div>
                    ))}
                </div>

                {/* Detailed Sections */}
                <div className="space-y-12">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.2 }}
                            className="bg-white p-10 rounded-4xl border border-slate-100 shadow-sm"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                                    {section.icon}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                            </div>
                            <p className="text-slate-600 mb-8 leading-relaxed font-medium">{section.content}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {section.items.map((item, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <p className="text-xs text-slate-600 font-bold leading-relaxed">{item}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-primary-600 p-12 rounded-4xl text-white text-center shadow-2xl relative overflow-hidden"
                    >
                        <Sparkles className="absolute top-10 right-10 w-20 h-20 opacity-20 rotate-12" />
                        <h3 className="text-3xl font-bold mb-4 relative z-10">Optimized for Impact</h3>
                        <p className="text-primary-100 max-w-xl mx-auto mb-8 relative z-10 font-medium">
                            By automating risk detection with synthetic training data, MaatriNet provides a reference implementation
                            for modernizing public health surveillance.
                        </p>
                        <div className="flex justify-center gap-4 relative z-10">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest">
                                <FileCode className="w-4 h-4" /> Python FastAPI
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest">
                                <Activity className="w-4 h-4" /> Scikit-Learn
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-12 border-t border-slate-100 bg-white">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest underline decoration-primary-200">
                    Technical Reference Only • AI Risk Indicator • Prototype Evaluation
                </p>
            </footer>
        </div>
    );
};

export default Architecture;
