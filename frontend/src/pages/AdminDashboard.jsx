import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { ShieldCheck, Hospital, Users, LayoutGrid, MapPin, BarChart2, PieChart as PieIcon, TrendingUp, ArrowRight, Activity, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    LineChart, Line
} from 'recharts';

const AdminDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [ovRes, anRes] = await Promise.all([
                axios.get('http://localhost:8000/api/admin/overview'),
                axios.get('http://localhost:8000/api/admin/analytics')
            ]);
            setOverview(ovRes.data);
            setAnalytics(anRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    if (loading) return <div className="p-20 text-center font-bold text-slate-400 italic">Accessing Master Control...</div>;

    if (!overview || !analytics) return (
        <DashboardLayout roleTitle="Error" roleIcon={<LayoutGrid className="text-rose-500" />} roleColor="bg-rose-50">
            <div className="p-20 text-center">
                <h2 className="text-2xl font-bold text-slate-800">Master Control Offline</h2>
                <p className="text-slate-500 mt-2">The system backbone is currently unavailable.</p>
                <button onClick={fetchAllData} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full font-bold">Retry Boot Sequence</button>
            </div>
        </DashboardLayout>
    );

    const COLORS = ['#1e293b', '#3b82f6', '#10b981', '#f43f5e', '#f59e0b'];

    const roleData = Object.entries(analytics?.role_distribution || {}).map(([name, value]) => ({ name, value }));
    const hospDistData = Object.entries(analytics?.hospital_distribution || {}).map(([name, value]) => ({ name, value }));
    const trendData = analytics?.delivery_trend?.map(t => ({ name: `${t.month}`, value: t.count })) || [];
    const statusData = Object.entries(analytics?.scheme_status || {}).map(([name, value]) => ({ name, value }));

    const stats = [
        { label: 'Total Hospitals', value: overview.total_hospitals },
        { label: 'Total Authorizers', value: overview.total_authorizers },
        { label: 'Total Beneficiaries', value: overview.total_beneficiaries },
        { label: 'Active Pregnancies', value: analytics.active_pregnancies },
    ];

    const menuItems = [
        { title: 'System Analytics', desc: 'Cross-role data visualization and platform performance.', icon: <BarChart2 className="w-8 h-8 text-indigo-600" />, path: '/dashboard/admin/analytics', color: 'bg-indigo-50' },
        { title: 'Hospital Registry', desc: 'Manage and monitor all health facilities.', icon: <Hospital className="w-8 h-8 text-emerald-600" />, path: '/dashboard/admin/hospitals', color: 'bg-emerald-50' },
        { title: 'Regional Authorizers', desc: 'Manage regional directors and officials.', icon: <ShieldCheck className="w-8 h-8 text-blue-600" />, path: '/dashboard/admin/authorizers', color: 'bg-blue-50' },
        { title: 'Infrastructure Scale-up', desc: 'Onboard new facilities and medical staff.', icon: <Plus className="w-8 h-8 text-rose-600" />, path: '/dashboard/admin/add-user', color: 'bg-rose-50' },
    ];

    return (
        <DashboardLayout
            roleTitle="System Administration"
            roleIcon={<LayoutGrid className="w-6 h-6 text-slate-600" />}
            roleColor="bg-slate-100"
        >
            {/* Hero Strip */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 py-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Administration</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Master control panel for facility onboarding and cross-role analytics.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold border border-slate-200 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Admin Protocol Alpha · Secure
                    </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                            Access Control <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-20 pt-10 border-t border-slate-100 text-center text-slate-400 lowercase italic text-[10px]">
                Master Control Interface v2.0 · Anti-Gravity Standard
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
