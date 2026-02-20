import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Shield, TrendingUp, AlertTriangle, Activity, Calculator, CheckCircle2, LayoutGrid, MapPin, ArrowRight, BarChart2, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthorizerDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Get the logged-in user's assigned state (null = global authorizer)
    const userState = JSON.parse(localStorage.getItem('maatri_user') || '{}').state || null;

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = userState ? { state: userState } : {};
            const sumRes = await axios.get('http://localhost:8000/api/authorizer/summary', { params });
            setSummary(sumRes.data);
        } catch (error) {
            console.error("Error fetching authorizer data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRecompute = async () => {
        try {
            await axios.post('http://localhost:8000/api/predictions/recompute');
            alert("AI Inference triggered on all records. Dashboards updated.");
            fetchData();
        } catch (err) {
            alert("Failed to recompute.");
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-slate-400 italic">Accessing Population Intelligence...</div>;

    if (!summary) return (
        <DashboardLayout roleTitle="Error" roleIcon={<Shield className="text-rose-500" />} roleColor="bg-rose-50">
            <div className="p-20 text-center">
                <h2 className="text-2xl font-bold text-slate-800">Connection Interrupted</h2>
                <p className="text-slate-500 mt-2">Could not secure intelligence data. The backend might be initializing.</p>
                <button onClick={fetchData} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full font-bold">Retry Connection</button>
            </div>
        </DashboardLayout>
    );

    const stats = [
        { label: 'Pre‑birth High‑Risk', value: summary.pregnancy_risk_distribution?.HIGH || 0 },
        { label: 'Post‑birth High‑Risk', value: summary.delivery_risk_distribution?.HIGH || 0 },
        { label: 'Off‑Track Beneficiaries', value: summary.offtrack_count || 0 },
        { label: 'Service Coverage', value: '88.4%' },
    ];

    const menuItems = [
        { title: 'Population Analytics', desc: 'Regional risk distribution, block-level hotspots, and coverage trends.', icon: <BarChart2 className="w-8 h-8 text-blue-600" />, path: '/dashboard/authorizer/analytics', color: 'bg-blue-50' },
        { title: 'Critical High-Risk', desc: 'Detailed priority list of beneficiaries requiring immediate monitoring.', icon: <AlertTriangle className="w-8 h-8 text-rose-600" />, path: '/dashboard/authorizer/highrisk', color: 'bg-rose-50' },
        { title: 'Off-Track Monitor', desc: 'Identify and track cases with missed immunizations or ANC visits.', icon: <Activity className="w-8 h-8 text-amber-600" />, path: '/dashboard/authorizer/offtrack', color: 'bg-amber-50' },
        { title: 'Scheme Approvals', desc: 'Verify and authorize maternal benefit scheme applications and payouts.', icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />, path: '/dashboard/authorizer/approvals', color: 'bg-emerald-50' },
        { title: 'Facility Registry', desc: 'Manage state healthcare facilities and infrastructure.', icon: <Building2 className="w-8 h-8 text-purple-600" />, path: '/dashboard/authorizer/hospitals', color: 'bg-purple-50' },
    ];

    return (
        <DashboardLayout
            roleTitle="Population Intelligence"
            roleIcon={<Shield className="w-6 h-6 text-blue-600" />}
            roleColor="bg-blue-50"
        >
            {/* Hero Strip */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 py-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Population Intelligence</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">AI-powered regional overview across 2,000+ active records.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <button
                        onClick={handleRecompute}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                    >
                        <Calculator className="w-4 h-4" /> Re‑run ML Inference
                    </button>
                    {userState ? (
                        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black border border-blue-100 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {userState} · State View
                        </div>
                    ) : (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Auth Protocol Beta · Live Monitoring
                        </div>
                    )}
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100"
                    >
                        <div className="text-4xl font-black text-slate-900 mb-2">{stat.value}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {menuItems.map((item, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                        onClick={() => navigate(item.path)}
                    >
                        <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">{item.desc}</p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                            Access Analytics <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-20 pt-10 border-t border-slate-100 text-center text-slate-400 lowercase italic text-[10px]">
                Population Control Interface v2.0 · MaatriNet Security
            </div>
        </DashboardLayout>
    );
};

export default AuthorizerDashboard;
