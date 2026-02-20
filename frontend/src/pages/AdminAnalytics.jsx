import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { LayoutGrid, BarChart2, TrendingUp, Activity, PieChart as PieIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    LineChart, Line
} from 'recharts';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8000/api/admin/analytics');
            setAnalytics(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="p-20 text-center font-bold text-slate-400 italic">Processing System Intelligence...</div>;

    const COLORS = ['#1e293b', '#3b82f6', '#10b981', '#f43f5e', '#f59e0b'];
    const roleData = Object.entries(analytics?.role_distribution || {}).map(([name, value]) => ({ name, value }));
    const trendData = analytics?.delivery_trend?.map(t => ({ name: `${t.month}`, value: t.count })) || [];
    const statusData = Object.entries(analytics?.scheme_status || {}).map(([name, value]) => ({ name, value }));

    return (
        <DashboardLayout
            roleTitle="System Intelligence"
            roleIcon={<BarChart2 className="w-6 h-6 text-indigo-600" />}
            roleColor="bg-indigo-50"
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 py-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Analytics</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Cross-role data visualization and platform performance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stakeholder Mix */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-800">Stakeholder Mix</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Distribution of users across administrative and clinical roles.</p>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {roleData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Delivery Trends */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-800">System growth (Deliveries)</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Monthly trend of successful birth registrations.</p>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Scheme Status */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm col-span-1 lg:col-span-2">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-800">Benefit Processing Lifecycle</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Application lifecycle for government welfare schemes.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {statusData.map((item, idx) => (
                            <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.name}</div>
                                <div className="flex items-end justify-between">
                                    <div className="text-3xl font-black text-slate-900">{item.value}</div>
                                    <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.name === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                                            item.name === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {((item.value / statusData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminAnalytics;
